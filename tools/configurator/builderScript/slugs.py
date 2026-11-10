"""Slug validation helpers for filesystem-boundary safety.

Every route/article slug that is used to build a filesystem path must pass
through validate_slug() before touching the disk. This prevents traversal
(e.g. "../secrets"), absolute paths, and stray separators from reaching
shutil.rmtree, mkdir, or open.
"""

from __future__ import annotations

import re
from pathlib import Path

# A single path segment: lowercase alphanumeric start, then alnum/_/- only.
_SEGMENT_RE = re.compile(r"^[a-z0-9][a-z0-9_-]*$")

MAX_SLUG_LENGTH = 200


def validate_slug(slug: object) -> bool:
    """Return True if slug is a safe, relative, POSIX-style route path.

    Accepts "home", "tab-2", "news/my-post".
    Rejects "", ".", "..", "../x", "/abs", "a\\b", "a//b", uppercase, etc.
    """
    if not isinstance(slug, str) or not slug or len(slug) > MAX_SLUG_LENGTH:
        return False
    if "\\" in slug or ":" in slug or slug.startswith(("/", "~", ".")):
        return False
    return all(_SEGMENT_RE.match(seg) for seg in slug.split("/"))


def assert_safe_relpath(base: Path, *segments: str) -> Path:
    """Join segments onto base, raising ValueError if the result escapes base."""
    base_resolved = base.resolve()
    candidate = base_resolved.joinpath(*segments).resolve()
    if candidate != base_resolved and base_resolved not in candidate.parents:
        raise ValueError(f"Refusing path outside base directory: {segments!r}")
    return candidate


def derive_slug(title: str) -> str:
    """Best-effort URL slug from a free-text title or label."""
    return re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
