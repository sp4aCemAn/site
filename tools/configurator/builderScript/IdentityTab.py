from __future__ import annotations

from textual.app import ComposeResult
from theme import IDENTITY_CSS
from textual.containers import VerticalScroll
from textual.widgets import Button, Input, Label, Static

from site_config_io import Raw

CORE_KEYS = ("name", "tagline", "description")
CORE_LABELS = {"name": "Name", "tagline": "Tagline", "description": "Description"}


class IdentityTab(VerticalScroll):
    """Site identity + social links tab (writes the `site`/`socials` exports)."""

    DEFAULT_CSS = IDENTITY_CSS

    def compose(self) -> ComposeResult:
        site = self.app.state.site
        socials = self.app.state.socials

        yield Button("Open Menu", id="btn-open-identity")
        yield Button("Save Identity & Write siteConfig", id="btn-save-identity",
                     variant="primary", classes="btn-full")

        yield Static(" SITE IDENTITY ", classes="section-title")
        for key in CORE_KEYS:
            yield Label(f"{CORE_LABELS[key]}:")
            yield Input(value=str(site.get(key, "")), id=f"global-site-{key}")

        yield Label("")
        yield Static(" SOCIAL LINKS ", classes="section-title")
        for key, value in socials.items():
            yield Label(f"{key}:")
            if isinstance(value, Raw):
                yield Static(f"[raw expression {value.text!r} — not editable here]",
                             classes="editor-label")
            else:
                yield Input(value=str(value), id=f"global-social-{key}")
