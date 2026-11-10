"""Tests for route_scaffold: page generation + ownership-marker delete safety."""

import sys
import tempfile
import unittest
from pathlib import Path

BUILDER = Path(__file__).resolve().parent.parent / "builderScript"
sys.path.insert(0, str(BUILDER))

from route_scaffold import (  # noqa: E402
    PAGE_MARKER,
    component_name,
    create_page,
    delete_page_for_screen,
    page_is_generated,
    page_source,
)
from site_config_io import ConfigError  # noqa: E402


class PageSourceTests(unittest.TestCase):
    def test_marker_and_pattern(self):
        src = page_source("books", "booksScreen", "Books")
        self.assertIn(PAGE_MARKER, src)
        self.assertIn("Screen: booksScreen", src)
        self.assertIn("import { booksScreen, site }", src)
        self.assertIn("export default function BooksPage()", src)
        self.assertIn('prefix="books"', src)

    def test_label_dollar_escaped_in_template(self):
        src = page_source("x", "xScreen", "Save $100")
        self.assertIn("Save \\$100", src)

    def test_invalid_slug_rejected(self):
        with self.assertRaises(ConfigError):
            page_source("../evil", "evilScreen", "Evil")

    def test_invalid_export_rejected(self):
        with self.assertRaises(ConfigError):
            page_source("ok", "bad name", "OK")

    def test_component_name_pascals(self):
        self.assertEqual(component_name("Cool Stuff"), "CoolStuff")


class CreateDeleteTests(unittest.TestCase):
    def test_create_then_delete_for_screen(self):
        with tempfile.TemporaryDirectory() as td:
            app = Path(td)
            create_page(app, "books", page_source("books", "booksScreen", "Books"))
            page = app / "books" / "page.tsx"
            self.assertTrue(page.is_file())
            self.assertTrue(page_is_generated(page))
            deleted = delete_page_for_screen(app, "booksScreen")
            self.assertEqual(deleted, ["books"])
            self.assertFalse(page.exists())

    def test_refuses_overwrite_handwritten(self):
        with tempfile.TemporaryDirectory() as td:
            app = Path(td)
            (app / "blog").mkdir()
            (app / "blog" / "page.tsx").write_text("hand written", encoding="utf-8")
            with self.assertRaises(ConfigError):
                create_page(app, "blog", page_source("blog", "blogScreen", "Blog"))
            self.assertEqual((app / "blog" / "page.tsx").read_text(encoding="utf-8"),
                             "hand written")

    def test_delete_ignores_handwritten_dirs(self):
        with tempfile.TemporaryDirectory() as td:
            app = Path(td)
            (app / "blog").mkdir()
            (app / "blog" / "page.tsx").write_text("hand written", encoding="utf-8")
            deleted = delete_page_for_screen(app, "blogScreen")
            self.assertEqual(deleted, [])
            self.assertTrue((app / "blog" / "page.tsx").exists())


if __name__ == "__main__":
    unittest.main()
