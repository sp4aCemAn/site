"""Create/remove src/app/<slug>/page.tsx for screens added by this tool.

Follows the site's standard screen route pattern (TextScreen + ScreenBody).
Only files carrying the AUTO-GENERATED marker are ever overwritten or
deleted, so hand-written routes can never be touched by accident.
"""

from __future__ import annotations

import re
import shutil
from pathlib import Path

from site_config_io import ConfigError
from slugs import assert_safe_relpath, validate_slug

PAGE_MARKER = "AUTO-GENERATED FILE"
_EXPORT_RE = re.compile(r"[A-Za-z_$][\w$]*")
_COMPONENT_RE = re.compile(r"^[A-Za-z][\w$]*$")


def component_name(label: str) -> str:
    """'Cool Stuff' -> 'CoolStuff' (PascalCase, from the page label)."""
    words = [w for w in re.split(r"[^A-Za-z0-9]+", label.strip()) if w]
    name = "".join(w[0].upper() + w[1:] for w in words)
    if not name or not _COMPONENT_RE.match(name):
        raise ConfigError(f"Cannot derive a component name from '{label}'.")
    return name


def _escape_template(value: str) -> str:
    return value.replace("\\", "\\\\").replace("`", "\\`").replace("$", "\\$")


def page_source(slug: str, screen_export: str, label: str) -> str:
    if not validate_slug(slug):
        raise ConfigError(f"Invalid slug '{slug}'.")
    if not re.fullmatch(r"[A-Za-z_$][\w$]*", screen_export):
        raise ConfigError(f"Invalid screen export name '{screen_export}'.")
    pascal = component_name(label)
    return f"""/**
 * {PAGE_MARKER}. Route: /{slug} Screen: {screen_export}
 */
import type {{ Metadata }} from "next";
import ScreenBody from "@/components/rainScreen/screenBody";
import TextScreen from "@/components/rainScreen/textScreen";
import {{ {screen_export}, site }} from "@/data/siteConfig";

export const metadata: Metadata = {{
  title: `${{site.name}} - {_escape_template(label)}`,
}};

export default function {pascal}Page() {{
  return (
    <TextScreen title={{{screen_export}.title}}>
      <ScreenBody screen={{{screen_export}}} prefix="{slug}" />
    </TextScreen>
  );
}}
"""


def page_is_generated(path: Path) -> bool:
    try:
        return PAGE_MARKER in path.read_text(encoding="utf-8")
    except OSError:
        return False


def create_page(app_root: Path, slug: str, source: str) -> Path:
    target_dir = assert_safe_relpath(Path(app_root), slug)
    page = target_dir / "page.tsx"
    if page.exists() and not page_is_generated(page):
        raise ConfigError(f"Refusing to overwrite hand-written page: {page}")
    target_dir.mkdir(parents=True, exist_ok=True)
    page.write_text(source, encoding="utf-8")
    return target_dir


def delete_page_for_screen(app_root: Path, screen_export: str) -> list[str]:
    """Delete route dirs whose generated page.tsx imports this screen."""
    app_root = Path(app_root)
    deleted: list[str] = []
    if not app_root.is_dir():
        return deleted
    needle = f"Screen: {screen_export}"
    for child in sorted(app_root.iterdir()):
        if not child.is_dir():
            continue
        page = child / "page.tsx"
        if not page.is_file() or not page_is_generated(page):
            continue
        try:
            head = page.read_text(encoding="utf-8")[:200]
        except OSError:
            continue
        if needle in head:
            shutil.rmtree(child)
            deleted.append(child.name)
    return deleted
