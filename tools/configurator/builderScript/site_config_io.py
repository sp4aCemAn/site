"""Read and write src/data/siteConfig.ts in place.

Locates the managed `export const` blocks (site, socials, every *Screen
export and articles), parses their object/array/string literals into plain
Python models, and writes back by splicing ONLY the blocks whose model
changed. Unmanaged bytes — header comments, interfaces, getNewsItems and the
whitespace between blocks — are never touched. Values this tool cannot
represent (template strings, referenced identifiers like `site.tagline`)
round-trip verbatim as `Raw` expressions.

Save is atomic (temp file + os.replace). Parsing managed exports is strict:
a file shape this tool cannot splice raises ConfigError instead of guessing.
"""

from __future__ import annotations

import copy
import json
import os
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable

class ConfigError(ValueError):
    """The config file does not have the shape the tool expects."""


@dataclass(frozen=True)
class Raw:
    """An expression preserved verbatim (e.g. `site.tagline`)."""

    text: str


_REQUIRED_NAMES = ("site", "socials", "articles")
_ESCAPES = {
    '"': '"', "'": "'", "\\": "\\", "/": "/",
    "b": "\b", "f": "\f", "n": "\n", "r": "\r", "t": "\t", "v": "\v", "0": "\0",
}
_IDENT_RE = re.compile(r"[A-Za-z_$][\w$]*")
_BLOCK_RE = re.compile(
    r"^export const ([A-Za-z_$][\w$]*)\s*((?::[^\n=]*?)?)\s*=\s*", re.MULTILINE
)


def is_managed(name: str) -> bool:
    return name in _REQUIRED_NAMES or name.endswith("Screen")


def blocks_to_text(blocks: list) -> str:
    """Render a blurb/body block list for a TextArea (blocks join on blank lines)."""
    return "\n\n".join(b.text if isinstance(b, Raw) else b for b in blocks)


def text_to_blocks(old: list, text: str) -> list:
    """Split edited TextArea text back into blocks.

    A block that is unchanged at its position and was a Raw expression there
    stays Raw, so editing a blurb can never flatten `site.tagline` unless the
    user actually edits that line.
    """
    parts = [p.strip() for p in re.split(r"\n{2,}", text.strip())]
    parts = [p for p in parts if p]
    out: list = []
    for i, part in enumerate(parts):
        prev = old[i] if i < len(old) else None
        if isinstance(prev, Raw) and prev.text == part:
            out.append(prev)
        else:
            out.append(part)
    return out


# ---------------------------------------------------------------------------
# Scanner helpers
# ---------------------------------------------------------------------------

def _skip_ws(text: str, i: int) -> int:
    while i < len(text) and text[i] in " \t\r\n":
        i += 1
    return i


def _skip_trivia(text: str, i: int) -> int:
    while True:
        i = _skip_ws(text, i)
        if text.startswith("//", i):
            nl = text.find("\n", i)
            i = len(text) if nl < 0 else nl
        elif text.startswith("/*", i):
            end = text.find("*/", i + 2)
            if end < 0:
                raise ConfigError("unterminated block comment")
            i = end + 2
        else:
            return i


def _parse_string(text: str, i: int) -> tuple[str, int]:
    quote = text[i]
    j = i + 1
    out: list[str] = []
    while j < len(text):
        c = text[j]
        if c == "\\":
            if j + 1 >= len(text):
                raise ConfigError("unterminated string escape")
            nxt = text[j + 1]
            if nxt in _ESCAPES:
                out.append(_ESCAPES[nxt])
                j += 2
            elif nxt == "u":
                rest = text[j + 2:]
                if rest.startswith("{"):
                    close = rest.index("}")
                    out.append(chr(int(rest[2:close], 16)))
                    j += close + 3
                else:
                    out.append(chr(int(text[j + 2:j + 6], 16)))
                    j += 6
            elif nxt == "\n":
                j += 2
            else:
                out.append("\\")
                out.append(nxt)
                j += 2
        elif c == quote:
            return "".join(out), j + 1
        else:
            out.append(c)
            j += 1
    raise ConfigError("unterminated string")


def _skip_template(text: str, i: int) -> int:
    j = i + 1
    while j < len(text):
        c = text[j]
        if c == "\\":
            j += 2
            continue
        if c == "`":
            return j + 1
        if c == "$" and text.startswith("${", j):
            depth = 1
            j += 2
            while j < len(text) and depth:
                if text[j] == "{":
                    depth += 1
                elif text[j] == "}":
                    depth -= 1
                j += 1
            continue
        j += 1
    raise ConfigError("unterminated template literal")


def _scan_raw(text: str, i: int) -> tuple[str, int]:
    j = i
    depth = 0
    while j < len(text):
        c = text[j]
        if c in "\"'":
            _, j = _parse_string(text, j)
            continue
        if c == "`":
            j = _skip_template(text, j)
            continue
        if c in "([{":
            depth += 1
        elif c in ")]}":
            if depth == 0:
                break
            depth -= 1
        elif c in ",;" and depth == 0:
            break
        j += 1
    return text[i:j].strip(), j


def _parse_value(text: str, i: int) -> tuple[Any, int]:
    i = _skip_trivia(text, i)
    if i >= len(text):
        raise ConfigError("unexpected end of file in value")
    c = text[i]
    if c == "{":
        model, _order, _suffixes, j = _parse_object(text, i)
        return model, j
    if c == "[":
        return _parse_array(text, i)
    if c in "\"'":
        return _parse_string(text, i)
    if c == "`":
        end = _skip_template(text, i)
        return Raw(text[i:end]), end
    raw, j = _scan_raw(text, i)
    if not raw:
        raise ConfigError(f"cannot parse config value at offset {i}")
    return Raw(raw), j


def _parse_object(text: str, i: int, top: bool = False) -> tuple[dict, list, dict, int]:
    """Returns (model, member_order, suffixes, end).

    With top=True a member's trailing expression (e.g. `satisfies NavLink[]`)
    is recorded in `suffixes` so the block writer can re-emit it after the
    value; nested members carrying one bake into a Raw instead."""
    j = i + 1
    model: dict = {}
    order: list[str] = []
    suffixes: dict[str, str] = {}
    while True:
        j = _skip_trivia(text, j)
        if j >= len(text):
            raise ConfigError("unterminated object")
        c = text[j]
        if c == "}":
            return model, order, suffixes, j + 1
        if c == ",":
            j += 1
            continue
        m = _IDENT_RE.match(text, j)
        if m:
            key = m.group(0)
            j = m.end()
        elif c in "\"'":
            key, j = _parse_string(text, j)
        else:
            raise ConfigError(f"bad object key at offset {j}")
        j = _skip_trivia(text, j)
        if j >= len(text) or text[j] != ":":
            raise ConfigError(f"expected ':' after key {key!r}")
        raw_start = j + 1
        value, j = _parse_value(text, j + 1)
        k = _skip_trivia(text, j)
        suffix = ""
        if k < len(text) and text[k] not in ",}":
            suffix, k = _scan_raw(text, k)
        if suffix and not top:
            model[key] = Raw(text[raw_start:k].strip())
        elif key not in model:
            if suffix:
                suffixes[key] = suffix
            model[key] = value
            order.append(key)
        j = k


def _parse_array(text: str, i: int) -> tuple[list, int]:
    j = i + 1
    items: list = []
    while True:
        j = _skip_trivia(text, j)
        if j >= len(text):
            raise ConfigError("unterminated array")
        if text[j] == "]":
            return items, j + 1
        if text[j] == ",":
            j += 1
            continue
        value, j = _parse_value(text, j)
        items.append(value)


# ---------------------------------------------------------------------------
# Emitter
# ---------------------------------------------------------------------------

def emit(value: Any, indent: str = "") -> str:
    """Serialize a model back into the file's literal style (2-space indent)."""
    inner = indent + "  "
    if isinstance(value, Raw):
        return value.text
    if isinstance(value, str):
        return json.dumps(value, ensure_ascii=False)
    if isinstance(value, bool):
        return "true" if value else "false"
    if value is None:
        return "null"
    if isinstance(value, dict):
        if not value:
            return "{}"
        lines = [
            f"{k if _IDENT_RE.fullmatch(k) else json.dumps(k)}: {emit(v, inner)}"
            for k, v in value.items()
        ]
        return "{\n" + ",\n".join(f"{inner}{ln}" for ln in lines) + "\n" + indent + "}"
    if isinstance(value, list):
        if not value:
            return "[]"
        return "[\n" + ",\n".join(f"{inner}{emit(v, inner)}" for v in value) + "\n" + indent + "]"
    if isinstance(value, (int, float)):
        return repr(value)
    raise ConfigError(f"cannot emit value of type {type(value).__name__}")


@dataclass
class Block:
    name: str
    annotation: str
    start: int
    end: int
    member_order: list | None
    suffixes: dict
    model: Any
    baseline: Any
    raw: str

    @property
    def dirty(self) -> bool:
        return self.model != self.baseline


class SiteConfigFile:
    """One parsed src/data/siteConfig.ts with splice-based saving."""

    def __init__(self, path: Path):
        self.path = Path(path)
        self.text = ""
        self.blocks: dict[str, Block] = {}
        self.order: list[str] = []
        self.load()

    # -- parsing --------------------------------------------------------

    def load(self) -> dict[str, Any]:
        try:
            self.text = self.path.read_text(encoding="utf-8")
        except FileNotFoundError as exc:
            raise ConfigError(f"missing config file: {self.path}") from exc
        except OSError as exc:
            raise ConfigError(f"cannot read config file: {exc}") from exc
        self._parse(self.text)
        return self.models()

    def _parse(self, text: str) -> None:
        self.blocks = {}
        self.order = []
        for m in _BLOCK_RE.finditer(text):
            name = m.group(1)
            managed = is_managed(name)
            try:
                kind_idx = _skip_trivia(text, m.end())
                if kind_idx >= len(text):
                    raise ConfigError(f"export const {name} has no value")
                kind_char = text[kind_idx]
                member_order: list | None = None
                suffixes: dict = {}
                if kind_char == "{":
                    model, member_order, suffixes, v_end = _parse_object(text, kind_idx, top=True)
                else:
                    model, v_end = _parse_value(text, kind_idx)
                k = _skip_trivia(text, v_end)
                if k >= len(text) or text[k] != ";":
                    raise ConfigError(f"export const {name} is not terminated by ';'")
            except ConfigError:
                if managed:
                    raise
                continue
            if not managed:
                continue
            self.blocks[name] = Block(
                name=name,
                annotation=m.group(2).strip(),
                start=m.start(),
                end=k + 1,
                member_order=member_order,
                suffixes=suffixes,
                model=model,
                baseline=copy.deepcopy(model),
                raw=text[m.start():k + 1],
            )
            self.order.append(name)
        for required in _REQUIRED_NAMES:
            if required not in self.blocks:
                raise ConfigError(f"required export const {required} block not found")

    def models(self) -> dict[str, Any]:
        return {name: self.blocks[name].model for name in self.order}

    # -- rendering ------------------------------------------------------

    def _render_changed(self, name: str, model: Any) -> str:
        block = self.blocks.get(name)
        if block is not None:
            annotation = block.annotation
        elif name.endswith("Screen"):
            annotation = ": ScreenContent"
        else:
            annotation = ""
        head = f"export const {name}"
        if annotation:
            head += annotation
        if block is not None and block.member_order is not None and isinstance(model, dict):
            lines = []
            seen = set()
            for key in block.member_order:
                seen.add(key)
                if key not in model:
                    continue
                suffix = block.suffixes.get(key, "")
                line = f"{key}: {emit(model[key], '  ')}"
                lines.append(line + (f" {suffix}" if suffix else ""))
            for key, val in model.items():
                if key in seen:
                    continue
                lines.append(f"{key}: {emit(val, '  ')}")
            body = "{\n" + ",\n".join(f"  {ln}" for ln in lines) + "\n}"
        else:
            body = emit(model, "")
        return f"{head} = {body};"

    def _insertion_index(self) -> int:
        anchor = self.blocks.get("articles")
        if anchor:
            return anchor.start
        screens = [b for b in self.blocks.values() if b.name.endswith("Screen")]
        if screens:
            return max(b.end for b in screens) + 2
        return len(self.text)

    # -- saving ---------------------------------------------------------

    def save(self, models: dict[str, Any], removed: Iterable[str] = ()) -> list[str]:
        """Splice changed/added/removed blocks and write atomically.

        Returns the block names that were written. Unchanged blocks are not
        re-rendered, so their bytes stay exactly as they are on disk.
        """
        removed = {n for n in removed if n in self.blocks}
        for name in _REQUIRED_NAMES:
            if name not in models:
                raise ConfigError(f"refusing to save: {name} missing from state")

        ops: list[tuple[int, int, str, str]] = []
        for name in self.order:
            block = self.blocks[name]
            if name in removed:
                ops.append((block.start, block.end, "", name))
            elif name in models and models[name] != block.baseline:
                ops.append((block.start, block.end, self._render_changed(name, models[name]), name))
        for name, model in reversed(list(models.items())):
            if name in self.blocks or name in removed:
                continue
            idx = self._insertion_index()
            ops.append((idx, idx, self._render_changed(name, model) + "\n\n", name))

        if not ops:
            return []

        ops.sort(key=lambda op: (op[0], op[1]), reverse=True)
        text = self.text
        for start, end, replacement, _name in ops:
            text = text[:start] + replacement + text[end:]
        if removed:
            text = re.sub(r"\n{3,}", "\n\n", text)

        self._atomic_write(text)
        self.text = text
        self._parse(text)
        for name, block in self.blocks.items():
            if name in models:
                block.model = models[name]
                block.baseline = copy.deepcopy(models[name])
        return [name for _, _, _, name in ops]

    def _atomic_write(self, text: str) -> None:
        tmp = self.path.with_name(f"{self.path.name}.tmp.{os.getpid()}")
        try:
            tmp.write_text(text, encoding="utf-8")
            os.replace(tmp, self.path)
        finally:
            if tmp.exists():
                try:
                    tmp.unlink()
                except OSError:
                    pass
