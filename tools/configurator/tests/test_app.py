"""End-to-end TUI tests via Textual's headless pilot (skipped if textual absent).

These drive the real buttons against a THROWAWAY copy of the project so the
live src/data/siteConfig.ts is never touched.
"""

import shutil
import sys
import tempfile
import unittest
from pathlib import Path

BUILDER = Path(__file__).resolve().parent.parent / "builderScript"
sys.path.insert(0, str(BUILDER))

try:
    from textual.widgets import Input  # noqa: F401
    HAVE_TEXTUAL = True
except ImportError:
    HAVE_TEXTUAL = False

REAL = Path(__file__).resolve().parents[3] / "src" / "data" / "siteConfig.ts"


@unittest.skipUnless(HAVE_TEXTUAL, "textual not installed")
class AppPilotTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, self.tmp, True)
        proj = Path(self.tmp)
        (proj / "src" / "data").mkdir(parents=True)
        (proj / "src" / "app").mkdir(parents=True)
        shutil.copy(REAL, proj / "src" / "data" / "siteConfig.ts")
        self._argv = list(sys.argv)
        sys.argv = ["main.py", str(proj)]

        import importlib
        import main as main_mod
        importlib.reload(main_mod)
        self.main = main_mod
        self.proj = proj

    def tearDown(self):
        sys.argv = self._argv

    def _run(self, coro):
        import asyncio

        return asyncio.run(coro)

    async def _press(self, app, pilot, selector):
        app.set_focus(app.query_one(selector))
        await pilot.press("enter")
        await pilot.pause()

    async def _scenario(self):
        from textual.widgets import TextArea

        app = self.main.SiteConfiguratorApp()
        async with app.run_test() as pilot:
            # Identity: edit tagline and save -> writes siteConfig.ts
            await pilot.press("1")
            app.query_one("#global-site-tagline", Input).value = "edited tagline"
            await self._press(app, pilot, "#btn-save-identity")
            cfg_text = (self.proj / "src/data/siteConfig.ts").read_text()
            assert "edited tagline" in cfg_text, cfg_text

            # Screens: add a page -> new export + navlink + route file
            await pilot.press("2")
            app.query_one("#new-page-label", Input).value = "Books"
            app.query_one("#new-page-slug", Input).value = "books"
            await self._press(app, pilot, "#btn-add-page")
            cfg_text = (self.proj / "src/data/siteConfig.ts").read_text()
            assert "export const booksScreen: ScreenContent =" in cfg_text
            assert 'href: "/books"' in cfg_text
            assert (self.proj / "src/app/books/page.tsx").is_file()

            # Screen blurb edit round-trips through the TextArea
            blurb = app.query_one("#screen-blurb-booksScreen", TextArea)
            blurb.text = "## Books\n\nreading list"
            await self._press(app, pilot, "#btn-save-screen-booksScreen")
            cfg_text = (self.proj / "src/data/siteConfig.ts").read_text()
            assert "reading list" in cfg_text

            # Articles: create an article -> written to the articles export
            await pilot.press("3")
            app.query_one("#art-title", Input).value = "My Post"
            app.query_one("#art-date", Input).value = "2026-11-08"
            app.query_one("#art-summary", Input).value = "summary here"
            app.query_one("#art-content", TextArea).text = "Hello body"
            await self._press(app, pilot, "#btn-save-article")
            cfg_text = (self.proj / "src/data/siteConfig.ts").read_text()
            assert "my-post" in cfg_text
            assert "Hello body" in cfg_text

    def test_end_to_end(self):
        self._run(self._scenario())


if __name__ == "__main__":
    unittest.main()
