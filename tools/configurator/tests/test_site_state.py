"""Validation tests for SiteState: nav links, add/remove page, article CRUD."""

import sys
import tempfile
import unittest
from pathlib import Path

BUILDER = Path(__file__).resolve().parent.parent / "builderScript"
sys.path.insert(0, str(BUILDER))

from site_config_io import ConfigError, SiteConfigFile  # noqa: E402
from site_state import SiteState, derive_export_name  # noqa: E402

REAL = Path(__file__).resolve().parents[3] / "src" / "data" / "siteConfig.ts"


def fresh_state(tmp: str) -> SiteState:
    dest = Path(tmp) / "siteConfig.ts"
    dest.write_text(REAL.read_text(encoding="utf-8"), encoding="utf-8")
    return SiteState(SiteConfigFile(dest))


class ExportNameTests(unittest.TestCase):
    def test_camelizes_label(self):
        self.assertEqual(derive_export_name("Cool Stuff"), "coolStuffScreen")
        self.assertEqual(derive_export_name("About Me"), "aboutMeScreen")

    def test_empty_label_raises(self):
        with self.assertRaises(ConfigError):
            derive_export_name("123")


class NavTests(unittest.TestCase):
    def test_add_and_move(self):
        with tempfile.TemporaryDirectory() as td:
            s = fresh_state(td)
            s.add_nav_link("Blog", "/blog")
            self.assertEqual(s.nav_links[-1]["href"], "/blog")
            s.move_nav_link(0, 1)
            self.assertEqual(s.nav_links[1]["href"], "/")

    def test_href_must_be_absolute(self):
        with tempfile.TemporaryDirectory() as td:
            s = fresh_state(td)
            with self.assertRaises(ConfigError):
                s.add_nav_link("Blog", "blog")

    def test_duplicate_href_rejected(self):
        with tempfile.TemporaryDirectory() as td:
            s = fresh_state(td)
            with self.assertRaises(ConfigError):
                s.add_nav_link("Dup", "/news")


class PageTests(unittest.TestCase):
    def test_add_page_creates_screen_and_navlink(self):
        with tempfile.TemporaryDirectory() as td:
            s = fresh_state(td)
            export, href = s.add_page("Books", "books")
            self.assertEqual(export, "booksScreen")
            self.assertEqual(href, "/books")
            self.assertIn("booksScreen", s.models)
            self.assertEqual(s.models["booksScreen"]["title"], "Books")
            self.assertEqual(s.nav_links[-1]["href"], "/books")

    def test_add_page_persists_to_disk(self):
        with tempfile.TemporaryDirectory() as td:
            s = fresh_state(td)
            s.add_page("Books", "books")
            written = s.persist()
            self.assertIn("booksScreen", written)
            text = s.config.path.read_text(encoding="utf-8")
            self.assertIn("export const booksScreen: ScreenContent =", text)
            self.assertIn('href: "/books"', text)

    def test_invalid_slug_rejected(self):
        with tempfile.TemporaryDirectory() as td:
            s = fresh_state(td)
            with self.assertRaises(ConfigError):
                s.add_page("Books", "Bad Slug")

    def test_duplicate_screen_rejected(self):
        with tempfile.TemporaryDirectory() as td:
            s = fresh_state(td)
            s.add_page("Books", "books")
            with self.assertRaises(ConfigError):
                s.add_page("Books", "books-2")

    def test_remove_page(self):
        with tempfile.TemporaryDirectory() as td:
            s = fresh_state(td)
            s.add_page("Books", "books")
            s.persist()
            s.remove_page("booksScreen")
            s.persist()
            self.assertNotIn("booksScreen", s.config.models())
            self.assertNotIn("booksScreen", s.config.text)


class ArticleTests(unittest.TestCase):
    def test_upsert_new_and_edit(self):
        with tempfile.TemporaryDirectory() as td:
            s = fresh_state(td)
            slug = s.upsert_article(
                {"slug": "hello-world", "title": "Hello", "date": "2026-01-01",
                 "summary": "hi", "body": ["# hi"]}
            )
            self.assertEqual(slug, "hello-world")
            self.assertEqual(len(s.articles), 2)
            s.upsert_article(
                {"slug": "hello-world", "title": "Hello v2", "date": "2026-01-02",
                 "summary": "hi", "body": ["# hi2"]},
                replaces_slug="hello-world",
            )
            self.assertEqual(len(s.articles), 2)
            self.assertEqual(s.articles[1]["title"], "Hello v2")

    def test_bad_date_rejected(self):
        with tempfile.TemporaryDirectory() as td:
            s = fresh_state(td)
            with self.assertRaises(ConfigError):
                s.upsert_article(
                    {"slug": "x", "title": "X", "date": "01/02/03",
                     "summary": "", "body": []}
                )

    def test_remove_article(self):
        with tempfile.TemporaryDirectory() as td:
            s = fresh_state(td)
            if not s.articles:
                self.skipTest("real config has no articles to remove")
            victim = s.articles[0]["slug"]
            s.remove_article(victim)
            self.assertNotIn(victim, [a.get("slug") for a in s.articles])
            s.persist()
            self.assertNotIn(f'slug: "{victim}"', s.config.text)


if __name__ == "__main__":
    unittest.main()
