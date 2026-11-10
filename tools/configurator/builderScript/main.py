"""
NextJs Site Configurator — Textual TUI for editing src/data/siteConfig.ts
Author: James Shufelt

Adapted from the NextJsSite Builder: instead of generating route pages from a
JSON config, this tool reads and writes the site's single source of truth
(`site` / `socials` / *Screen exports / `articles`) in place, and only ever
scaffolds `page.tsx` files for pages it created itself (ownership-marked).
"""

from __future__ import annotations
import logging
import sys
from pathlib import Path
from typing import Iterable

import IdentityTab as ided
import ScreenEditor as sced
import ArticleEditor as ared
from textual.app import App, ComposeResult, SystemCommand
from textual.binding import Binding
from textual.containers import Container, Horizontal
from textual.css.query import NoMatches
from textual.screen import Screen
from textual.widgets import (
    Button,
    ContentSwitcher,
    Footer,
    Header,
    Input,
    RichLog,
    Select,
    TabbedContent,
    TextArea,
)

# ---------------------------------------------------------------------------
# Optional dependency guard
# ---------------------------------------------------------------------------
try:
    from route_scaffold import create_page, delete_page_for_screen, page_source
    from site_config_io import ConfigError, SiteConfigFile, text_to_blocks
    from site_state import SiteState
    from slugs import derive_slug, validate_slug
    from textual_log_handler import RichLogHandler
    from theme import APP_CSS, COMPACT_WIDTH, SIDEBAR_CSS
except ImportError as exc:
    sys.exit(f"Import error: {exc}")

logger = logging.getLogger("configurator.app")

PAGE_MAP: dict[str, str] = {
    "nav-identity": "page-identity",
    "nav-contentmanager": "page-screens",
    "nav-articleditor": "page-article",
}

SITE_KEYS = ("name", "tagline", "description")


class SidebarMenu(Horizontal):
    """Collapsible top navigation bar."""

    DEFAULT_CSS = SIDEBAR_CSS

    def compose(self) -> ComposeResult:
        yield Button("Identity", id="nav-identity", variant="primary")
        yield Button("Screens", id="nav-contentmanager", variant="primary")
        yield Button("Articles", id="nav-articleditor", variant="primary")
        yield Button("Close Menu", id="btn-close", variant="error")


class AppShell(Container):
    """Wraps the sidebar + the three page panels."""

    def compose(self) -> ComposeResult:
        yield SidebarMenu(id="sidebar")

        with Container(id="root"):
            with ContentSwitcher(initial="page-identity", id="page-switcher"):
                with Container(id="page-identity"):
                    yield ided.IdentityTab()
                with Container(id="page-screens"):
                    yield sced.ScreensTab()
                with Container(id="page-article"):
                    yield ared.ArticleEditorTab()


class SiteConfiguratorApp(App):

    BINDINGS = [
        Binding("ctrl+l", "toggle_log", "Toggle Log"),
        Binding("ctrl+q", "quit", "Quit"),
        Binding("1", "switch_to_identity", "Identity"),
        Binding("2", "switch_to_screens", "Screens"),
        Binding("3", "switch_to_articles", "Articles"),
    ]

    CSS = APP_CSS

    def __init__(self) -> None:
        super().__init__()
        self._install_logging()
        self._resolve_paths()

        self.config = SiteConfigFile(self.config_path)
        self.state = SiteState(self.config)
        self._compact: bool | None = None
        self.current_editing_slug: str | None = None

    # ------------------------------------------------------------------
    # Initialisation
    # ------------------------------------------------------------------

    def _install_logging(self) -> None:
        root = logging.getLogger()
        for handler in list(root.handlers):
            if isinstance(handler, RichLogHandler):
                root.removeHandler(handler)
        self.log_handler = RichLogHandler()
        self.log_handler.setFormatter(logging.Formatter("%(name)s: %(message)s"))
        root.addHandler(self.log_handler)
        root.setLevel(logging.INFO)

    def _resolve_paths(self) -> None:
        if len(sys.argv) > 1:
            project_root = Path(sys.argv[1]).resolve()
        elif getattr(sys, "frozen", False):
            project_root = Path.cwd().parents[3]
        else:
            project_root = Path(__file__).resolve().parents[3]

        self.app_root = project_root / "src" / "app"
        self.config_path = project_root / "src" / "data" / "siteConfig.ts"

    # ------------------------------------------------------------------
    # Commands
    # ------------------------------------------------------------------

    def get_system_commands(self, screen: Screen) -> Iterable[SystemCommand]:
        yield from super().get_system_commands(screen)

    # ------------------------------------------------------------------
    # Persistence
    # ------------------------------------------------------------------

    def _persist(self) -> None:
        try:
            written = self.state.persist()
        except (ConfigError, OSError) as exc:
            logger.error("Could not write siteConfig.ts: %s", exc)
            return
        if written:
            logger.info("Wrote siteConfig.ts (%s)", ", ".join(written))

    # ------------------------------------------------------------------
    # Compose & mount
    # ------------------------------------------------------------------

    def compose(self) -> ComposeResult:
        yield Header(show_clock=True)
        yield AppShell()
        yield RichLog(id="status-log", markup=False)
        yield Footer()

    async def on_mount(self) -> None:
        self.log_handler.attach(self.query_one("#status-log", RichLog))
        self._update_compact(self.size.width)
        logger.info("System ready. Editing %s", self.config_path.name)

    # ------------------------------------------------------------------
    # Responsive layout
    # ------------------------------------------------------------------

    def _update_compact(self, width: int) -> None:
        compact = 0 < width < COMPACT_WIDTH
        if compact == self._compact:
            return
        self._compact = compact
        if compact:
            self.screen.add_class("compact")
        else:
            self.screen.remove_class("compact")

    def on_resize(self, event) -> None:
        self._update_compact(event.size.width)

    # ------------------------------------------------------------------
    # Identity
    # ------------------------------------------------------------------

    def _collect_identity(self) -> None:
        for key in SITE_KEYS:
            try:
                self.state.site[key] = self.query_one(f"#global-site-{key}", Input).value
            except NoMatches:
                pass
        for key in list(self.state.socials):
            try:
                self.state.socials[key] = self.query_one(f"#global-social-{key}", Input).value
            except NoMatches:
                pass

    # ------------------------------------------------------------------
    # Screens + nav
    # ------------------------------------------------------------------

    def _collect_screen(self, name: str) -> None:
        screen = self.state.screen(name)
        try:
            screen["title"] = self.query_one(f"#screen-title-{name}", Input).value
        except NoMatches:
            pass
        try:
            raw = self.query_one(f"#screen-blurb-{name}", TextArea).text
        except NoMatches:
            return
        screen["blurb"] = text_to_blocks(list(screen.get("blurb", [])), raw)

    async def _refresh_screens(self, active_name: str | None = None) -> None:
        await self.query_one(sced.ScreensTab).rebuild(active_name=active_name)

    async def _add_page(self) -> None:
        label = self.query_one("#new-page-label", Input).value
        slug = self.query_one("#new-page-slug", Input).value or derive_slug(label)
        try:
            export, href = self.state.add_page(label, slug)
        except ConfigError as exc:
            logger.error("%s", exc)
            return
        self._persist()
        if export not in self.state.models:
            return
        try:
            created = create_page(self.app_root, slug, page_source(slug, export, label))
        except (ConfigError, OSError, ValueError) as exc:
            logger.error("Could not scaffold page: %s", exc)
            self.state.remove_page(export)
            self.state.nav_links[:] = [l for l in self.state.nav_links if l.get("href") != href]
            self._persist()
            return
        self.query_one("#new-page-label", Input).value = ""
        self.query_one("#new-page-slug", Input).value = ""
        logger.info("Added page '/%s' → %s + %s", slug, export, created / "page.tsx")
        await self._refresh_screens(active_name=export)

    async def _remove_page(self, name: str) -> None:
        try:
            self.state.remove_page(name)
        except ConfigError as exc:
            logger.error("%s", exc)
            return
        self._persist()
        deleted = delete_page_for_screen(self.app_root, name)
        if deleted:
            logger.info("Removed generated route dirs: %s", ", ".join(deleted))
        logger.info("Removed screen: %s", name)
        await self._refresh_screens()

    def _active_screen_name(self) -> str | None:
        try:
            tabs = self.query_one("#screen_tabs", TabbedContent)
            active = str(tabs.active or "")
        except NoMatches:
            return None
        return active.removeprefix("pane-") if active.startswith("pane-") else None

    # ------------------------------------------------------------------
    # Nav links
    # ------------------------------------------------------------------

    async def _nav_row_action(self, action: str, index: int) -> None:
        try:
            if action == "save":
                label = self.query_one(f"#nav-label-{index}", Input).value
                href = self.query_one(f"#nav-href-{index}", Input).value
                self.state.set_nav_link(index, label, href)
            elif action == "up":
                self.state.move_nav_link(index, -1)
            elif action == "down":
                self.state.move_nav_link(index, 1)
            elif action == "remove":
                link = self.state.remove_nav_link(index)
                logger.info("Removed nav link: %s", link.get("href"))
        except ConfigError as exc:
            logger.error("%s", exc)
            return
        self._persist()
        await self.query_one(sced.ScreensTab).refresh_nav_rows()

    # ------------------------------------------------------------------
    # Articles
    # ------------------------------------------------------------------

    def _save_article(self) -> None:
        title = self.query_one("#art-title", Input).value.strip()
        date = self.query_one("#art-date", Input).value.strip()
        summary = self.query_one("#art-summary", Input).value.strip()
        slug = self.query_one("#art-slug", Input).value.strip() or derive_slug(title)
        raw_body = self.query_one("#art-content", TextArea).text

        old = next((a for a in self.state.articles
                    if a.get("slug") == (self.current_editing_slug or slug)), None)
        body = text_to_blocks(list(old.get("body", [])) if old else [], raw_body)
        article = {"slug": slug, "title": title, "date": date, "summary": summary, "body": body}
        try:
            final_slug = self.state.upsert_article(article, replaces_slug=self.current_editing_slug)
        except ConfigError as exc:
            logger.error("%s", exc)
            return
        self.current_editing_slug = final_slug
        self._persist()
        self._refresh_article_selector(select_slug=final_slug)
        logger.info("Saved article: %s", final_slug)

    def _delete_article(self) -> None:
        selector = self.query_one("#sel-article", Select)
        slug = selector.value
        if not slug or slug in (Select.BLANK, "*new*"):
            return
        if not validate_slug(slug):
            logger.error("Refusing to delete article with invalid slug: '%s'", slug)
            return
        if self.state.remove_article(slug) is None:
            logger.warning("Article '%s' not found in state.", slug)
            return
        self._persist()
        self.current_editing_slug = None
        self._refresh_article_selector(select_slug="*new*")
        tab = self.query_one(ared.ArticleEditorTab)
        tab.load_article(None)
        logger.info("Deleted article: %s", slug)

    def _refresh_article_selector(self, select_slug: str = "*new*") -> None:
        opts = [("* Create New Article *", "*new*")] + [
            (a.get("slug", "untitled"), a.get("slug")) for a in self.state.articles
        ]
        try:
            sel = self.query_one("#sel-article", Select)
            sel.set_options(opts)
            sel.value = select_slug
        except NoMatches:
            pass

    # ------------------------------------------------------------------
    # Textual event handlers
    # ------------------------------------------------------------------

    async def on_select_changed(self, event: Select.Changed) -> None:
        if event.select.id != "sel-article":
            return
        slug = event.value
        tab = self.query_one(ared.ArticleEditorTab)
        if slug in (Select.BLANK, "*new*"):
            self.current_editing_slug = None
            tab.load_article(None)
            return
        article = next((a for a in self.state.articles if a.get("slug") == slug), None)
        if article:
            self.current_editing_slug = slug
            tab.load_article(article)

    async def on_button_pressed(self, event: Button.Pressed) -> None:
        bid = event.button.id
        if bid is None:
            return

        if bid in ("btn-open-identity", "btn-open-articles", "btn-open-website", "btn-close"):
            self.action_toggle_menu()
            return

        if bid in PAGE_MAP:
            self._switch_page(PAGE_MAP[bid])
            self.action_toggle_menu()
            return

        if bid == "btn-save-identity":
            self._collect_identity()
            self._persist()
            return

        if bid == "btn-add-page":
            await self._add_page()
            return

        if bid == "btn-remove-screen":
            name = self._active_screen_name()
            if name:
                await self._remove_page(name)
            return

        if bid.startswith("btn-save-screen-"):
            name = bid.removeprefix("btn-save-screen-")
            self._collect_screen(name)
            self._persist()
            return

        if bid.startswith("btn-delete-screen-"):
            await self._remove_page(bid.removeprefix("btn-delete-screen-"))
            return

        for action in ("save", "up", "down", "remove"):
            prefix = f"nav-{action}-"
            if bid.startswith(prefix):
                try:
                    index = int(bid.removeprefix(prefix))
                except ValueError:
                    return
                await self._nav_row_action(action, index)
                return

        if bid == "btn-save-article":
            self._save_article()
            return

        if bid == "btn-delete-article":
            self._delete_article()
            return

    # ------------------------------------------------------------------
    # Actions (keyboard bindings)
    # ------------------------------------------------------------------

    def action_toggle_log(self) -> None:
        try:
            self.query_one("#status-log", RichLog).toggle_class("visible")
        except NoMatches:
            pass

    def action_toggle_menu(self) -> None:
        try:
            self.query_one("#sidebar", SidebarMenu).toggle_class("-active")
        except NoMatches:
            pass

    def action_switch_to_identity(self) -> None:
        self._switch_page("page-identity")

    def action_switch_to_screens(self) -> None:
        self._switch_page("page-screens")

    def action_switch_to_articles(self) -> None:
        self._switch_page("page-article")

    def _switch_page(self, page_id: str) -> None:
        try:
            self.query_one("#page-switcher", ContentSwitcher).current = page_id
        except NoMatches:
            pass


if __name__ == "__main__":
    try:
        SiteConfiguratorApp().run()
    except ConfigError as exc:
        sys.exit(f"Cannot open siteConfig.ts: {exc}")
