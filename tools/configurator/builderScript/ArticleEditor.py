from __future__ import annotations

from textual.app import ComposeResult
from theme import ARTICLE_CSS
from textual.containers import Container, Horizontal, VerticalScroll
from textual.widgets import Button, Input, Label, Select, Static, TextArea

from site_config_io import blocks_to_text


class ArticleEditorTab(Container):
    """News article editor tab (writes the `articles` export)."""

    DEFAULT_CSS = ARTICLE_CSS

    def compose(self) -> ComposeResult:
        art_opts = [("* Create New Article *", "*new*")] + [
            (a.get("slug", "untitled"), a.get("slug")) for a in self.app.state.articles
        ]
        with Horizontal(id="article-toolbar"):
            yield Select(art_opts, prompt="Select Document...", id="sel-article")
            yield Button("Save Changes", id="btn-save-article", variant="success")
            yield Button("Delete", id="btn-delete-article", variant="error")
            yield Button("Open Menu", id="btn-open-articles")

        with Horizontal(id="editor-layout"):
            with VerticalScroll(id="editor-sidebar"):
                yield Static("METADATA", classes="sidebar-header")
                yield Label("TITLE")
                yield Input(placeholder="Article Title", id="art-title")
                yield Label("DATE (YYYY-MM-DD)")
                yield Input(placeholder="2026-11-05", id="art-date")
                yield Label("SUMMARY")
                yield Input(placeholder="One-line summary", id="art-summary")
                yield Label("SLUG")
                yield Input(placeholder="auto-generated", id="art-slug")
            with VerticalScroll(id="editor-main"):
                yield TextArea(id="art-content", show_line_numbers=True)

    def load_article(self, article: dict | None) -> None:
        if article is None:
            self.query_one("#art-title", Input).value = ""
            self.query_one("#art-date", Input).value = ""
            self.query_one("#art-summary", Input).value = ""
            self.query_one("#art-content", TextArea).text = ""
            self.query_one("#art-slug", Input).value = ""
            return
        self.query_one("#art-title", Input).value = str(article.get("title", ""))
        self.query_one("#art-date", Input).value = str(article.get("date", ""))
        self.query_one("#art-summary", Input).value = str(article.get("summary", ""))
        self.query_one("#art-content", TextArea).text = blocks_to_text(article.get("body", []))
        self.query_one("#art-slug", Input).value = str(article.get("slug", ""))
