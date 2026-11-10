from __future__ import annotations

import logging

from textual import on
from theme import SCREEN_EDITOR_CSS
from textual.app import ComposeResult
from textual.containers import Horizontal, Vertical, VerticalScroll
from textual.widget import Widget
from textual.widgets import (
    Button,
    Input,
    Label,
    Static,
    TabbedContent,
    TabPane,
    TextArea,
)

from site_config_io import blocks_to_text

logger = logging.getLogger("configurator.screen_editor")


class ScreensTab(VerticalScroll):

    """Screen content + navigation tab (writes *Screen exports and site.navLinks)."""

    DEFAULT_CSS = SCREEN_EDITOR_CSS

    def _pane_contents(self, name: str) -> list[Widget]:
        screen = self.app.state.screen(name)
        return [
            Horizontal(
                Button("Save Screen", id=f"btn-save-screen-{name}", variant="success"),
                Button("Delete Screen", id=f"btn-delete-screen-{name}", variant="error"),
                classes="screen-action-row",
            ),
            Label("TITLE:"),
            Input(value=str(screen.get("title", "")), id=f"screen-title-{name}"),
            Label("BLURB (markdown; blank line separates blocks):"),
            TextArea(blocks_to_text(screen.get("blurb", [])),
                     id=f"screen-blurb-{name}", show_line_numbers=False,
                     classes="blurb-box"),
        ]

    # ------------------------------------------------------------------

    def compose(self) -> ComposeResult:
        with Horizontal(id="top-bar"):
            yield Button("Menu", id="btn-open-website")
            yield Static("Screens & navigation", classes="section-heading")

        with TabbedContent(id="screen_tabs"):
            for name in self.app.state.screen_names:
                with TabPane(self.app.state.screen(name).get("title", name), id=f"pane-{name}"):
                    for widget in self._pane_contents(name):
                        yield widget

        yield Static("", classes="divider")
        yield Static(" NAV LINKS ", classes="section-title")
        yield Vertical(id="nav_rows")

        with Vertical(id="new-page-bar"):
            with Horizontal(id="page-inputs"):
                yield Input(id="new-page-label", placeholder="Page label (e.g. About Me)")
                yield Input(id="new-page-slug", placeholder="URL slug (e.g. about-me)")
            with Horizontal(id="page-actions"):
                yield Button("+ Add page", id="btn-add-page", variant="primary")
                yield Button("Remove active screen", id="btn-remove-screen", variant="error")

    # ------------------------------------------------------------------

    @on(TabbedContent.TabActivated)
    def handle_tab_change(self, event: TabbedContent.TabActivated) -> None:
        pane_id = event.pane.id or ""
        if pane_id.startswith("pane-"):
            logger.debug("switching screen: %s", pane_id.removeprefix("pane-"))

    async def rebuild(self, active_name: str | None = None) -> None:
        """Rebuild screen panes and nav rows from state."""
        tabs = self.query_one("#screen_tabs", TabbedContent)
        for pane in list(tabs.query(TabPane)):
            if pane.id:
                await tabs.remove_pane(pane.id)
        names = self.app.state.screen_names
        for name in names:
            pane = TabPane(self.app.state.screen(name).get("title", name), id=f"pane-{name}")
            await tabs.add_pane(pane)
            for widget in self._pane_contents(name):
                await pane.mount(widget)
        target = active_name if active_name in names else (names[0] if names else None)
        tabs.active = f"pane-{target}" if target else None
        await self.refresh_nav_rows()

    async def refresh_nav_rows(self) -> None:
        box = self.query_one("#nav_rows", Vertical)
        await box.remove_children()
        for i, link in enumerate(self.app.state.nav_links):
            row = Horizontal(
                Label(f"{i + 1}."),
                Input(value=str(link.get("label", "")), id=f"nav-label-{i}", classes="nav-cell"),
                Input(value=str(link.get("href", "")), id=f"nav-href-{i}", classes="nav-cell"),
                Button("Up", id=f"nav-up-{i}", variant="default"),
                Button("Down", id=f"nav-down-{i}", variant="default"),
                Button("Save", id=f"nav-save-{i}", variant="success"),
                Button("X", id=f"nav-remove-{i}", variant="error"),
                classes="nav-row",
            )
            await box.mount(row)
