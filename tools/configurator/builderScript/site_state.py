"""Editable model over SiteConfigFile with validation.

Holds the parsed `site` / `socials` / screens / `articles` models (shared
object references with SiteConfigFile blocks, so edits are what save()
splices). All user-facing mutations validate here and raise ConfigError with
messages the UI logs verbatim.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field

from site_config_io import ConfigError, SiteConfigFile
from slugs import validate_slug

DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
SLUG_HINT = "Use lowercase letters, numbers, '-' and '_'."


def derive_export_name(label: str) -> str:
    """'Cool Stuff' -> 'coolStuffScreen' (the file's own naming pattern)."""
    words = [w for w in re.split(r"[^A-Za-z0-9]+", label.strip()) if w]
    if not words:
        raise ConfigError("Label has no letters to build an export name from.")
    first = words[0]
    if not re.match(r"[A-Za-z]", first):
        raise ConfigError(f"Label '{label}' must start with a letter.")
    name = first[0].lower() + first[1:] + "".join(w[0].upper() + w[1:] for w in words[1:])
    if not name.endswith("Screen"):
        name += "Screen"
    return name


@dataclass
class SiteState:
    config: SiteConfigFile
    models: dict = field(init=False)
    removed: set = field(default_factory=set)

    def __post_init__(self) -> None:
        self.models = self.config.models()
        for required in ("site", "socials", "articles"):
            self.models.setdefault(required, {"navLinks": []} if required == "site" else ({} if required == "socials" else []))
        self.site.setdefault("navLinks", [])

    # -- identity -------------------------------------------------------

    @property
    def site(self) -> dict:
        return self.models["site"]

    @property
    def socials(self) -> dict:
        return self.models["socials"]

    @property
    def nav_links(self) -> list:
        return self.site["navLinks"]

    @property
    def screen_names(self) -> list[str]:
        return [n for n in self.models if n.endswith("Screen") and n not in self.removed]

    def screen(self, name: str) -> dict:
        try:
            return self.models[name]
        except KeyError:
            raise ConfigError(f"Screen '{name}' not found.") from None

    # -- nav links ------------------------------------------------------

    def set_nav_link(self, index: int, label: str, href: str) -> None:
        label, href = label.strip(), href.strip()
        if not label:
            raise ConfigError("Nav link label cannot be empty.")
        self._check_href(href)
        if not (0 <= index < len(self.nav_links)):
            raise ConfigError(f"Nav link index '{index}' not found.")
        self._check_href_unique(href, skip=index)
        self.nav_links[index] = {"label": label, "href": href}

    def add_nav_link(self, label: str, href: str) -> None:
        label, href = label.strip(), href.strip()
        if not label:
            raise ConfigError("Nav link label cannot be empty.")
        self._check_href(href)
        self._check_href_unique(href)
        self.nav_links.append({"label": label, "href": href})

    def remove_nav_link(self, index: int) -> dict:
        if not (0 <= index < len(self.nav_links)):
            raise ConfigError(f"Nav link index '{index}' not found.")
        return self.nav_links.pop(index)

    def move_nav_link(self, index: int, delta: int) -> None:
        target = index + delta
        if not (0 <= index < len(self.nav_links) and 0 <= target < len(self.nav_links)):
            raise ConfigError("Nav link move out of range.")
        self.nav_links[index], self.nav_links[target] = self.nav_links[target], self.nav_links[index]

    def _check_href(self, href: str) -> None:
        if not href.startswith("/"):
            raise ConfigError(f"Nav href '{href}' must start with '/'.")

    def _check_href_unique(self, href: str, skip: int = -1) -> None:
        for i, link in enumerate(self.nav_links):
            if i != skip and link.get("href") == href:
                raise ConfigError(f"A nav link for '{href}' already exists.")

    # -- pages ----------------------------------------------------------

    def add_page(self, label: str, slug: str) -> tuple[str, str]:
        """Register a new screen + nav link; returns (export_name, href)."""
        label, slug = label.strip(), slug.strip()
        if not label:
            raise ConfigError("Page label cannot be empty.")
        if not validate_slug(slug):
            raise ConfigError(f"Invalid slug '{slug}'. {SLUG_HINT}")
        href = f"/{slug}"
        self._check_href_unique(href)
        export = derive_export_name(label)
        if export in self.models or export in self.removed:
            raise ConfigError(f"Screen export '{export}' already exists.")
        self.models[export] = {"title": label, "blurb": [""]}
        self.nav_links.append({"label": label, "href": href})
        return export, href

    def remove_page(self, name: str) -> dict:
        if name not in self.models:
            raise ConfigError(f"Screen '{name}' not found.")
        model = self.models.pop(name)
        self.removed.add(name)
        return model

    # -- articles -------------------------------------------------------

    def upsert_article(self, article: dict, replaces_slug: str | None = None) -> str:
        slug = (article.get("slug") or "").strip()
        if not validate_slug(slug):
            raise ConfigError(f"Invalid article slug '{slug}'. {SLUG_HINT}")
        date = (article.get("date") or "").strip()
        if not DATE_RE.match(date):
            raise ConfigError(f"Invalid date '{date}'. Use YYYY-MM-DD.")
        title = (article.get("title") or "").strip()
        if not title:
            raise ConfigError("Article title cannot be empty.")
        article = {**article, "slug": slug, "title": title, "date": date}
        target = None
        if replaces_slug:
            target = next((a for a in self.articles if a.get("slug") == replaces_slug), None)
        if target is None:
            target = next((a for a in self.articles if a.get("slug") == slug), None)
        if target is not None:
            target.clear()
            target.update(article)
        else:
            self.articles.append(article)
        return slug

    def remove_article(self, slug: str) -> dict | None:
        existing = next((a for a in self.articles if a.get("slug") == slug), None)
        if existing is None:
            return None
        self.articles[:] = [a for a in self.articles if a.get("slug") != slug]
        return existing

    @property
    def articles(self) -> list:
        return self.models["articles"]

    # -- persistence ----------------------------------------------------

    def persist(self) -> list[str]:
        written = self.config.save(self.models, removed=self.removed)
        self.removed.clear()
        return written
