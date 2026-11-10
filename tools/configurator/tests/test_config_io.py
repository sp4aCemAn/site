"""Round-trip + splice tests for site_config_io against the REAL siteConfig.ts.

    python -m unittest discover -s tools/configurator/tests
"""

import copy
import sys
import tempfile
import unittest
from pathlib import Path

BUILDER = Path(__file__).resolve().parent.parent / "builderScript"
sys.path.insert(0, str(BUILDER))

from site_config_io import (  # noqa: E402
    ConfigError,
    Raw,
    SiteConfigFile,
    blocks_to_text,
    emit,
    text_to_blocks,
)

REAL = Path(__file__).resolve().parents[3] / "src" / "data" / "siteConfig.ts"


def load_real() -> SiteConfigFile:
    return SiteConfigFile(REAL)


class LoadTests(unittest.TestCase):
    def test_finds_all_managed_blocks(self):
        cfg = load_real()
        self.assertIn("site", cfg.order)
        self.assertIn("socials", cfg.order)
        self.assertIn("articles", cfg.order)
        for s in ("homeScreen", "newsScreen", "projectsScreen", "coolStuffScreen"):
            self.assertIn(s, cfg.order)

    def test_site_scalar_and_navlinks(self):
        cfg = load_real()
        site = cfg.blocks["site"].model
        self.assertEqual(site["name"], "spaceman")
        self.assertIsInstance(site["navLinks"], list)
        self.assertEqual(site["navLinks"][0]["href"], "/")

    def test_blurb_keeps_identifier_raw(self):
        cfg = load_real()
        blurb = cfg.blocks["homeScreen"].model["blurb"]
        self.assertIsInstance(blurb[0], Raw)
        self.assertEqual(blurb[0].text, "site.tagline")

    def test_satisfies_suffix_recorded(self):
        cfg = load_real()
        self.assertEqual(cfg.blocks["site"].suffixes.get("navLinks"), "satisfies NavLink[]")


class CleanSaveTests(unittest.TestCase):
    def test_unchanged_save_is_byte_identical(self):
        original = REAL.read_text(encoding="utf-8")
        cfg = load_real()
        with tempfile.TemporaryDirectory() as td:
            dest = Path(td) / "siteConfig.ts"
            dest.write_text(original, encoding="utf-8")
            cfg2 = SiteConfigFile(dest)
            written = cfg2.save(copy.deepcopy(cfg2.models()))
            self.assertEqual(written, [])
            self.assertEqual(dest.read_text(encoding="utf-8"), original)

    def test_dirty_scalar_splices_only_that_block(self):
        original = REAL.read_text(encoding="utf-8")
        with tempfile.TemporaryDirectory() as td:
            dest = Path(td) / "siteConfig.ts"
            dest.write_text(original, encoding="utf-8")
            cfg = SiteConfigFile(dest)
            cfg.blocks["socials"].model["email"] = "changed@example.com"
            written = cfg.save(cfg.models())
            self.assertEqual(written, ["socials"])
            text = dest.read_text(encoding="utf-8")
        self.assertIn("changed@example.com", text)
        self.assertNotIn("jamesshufeltiii@gmail.com", text)
        self.assertIn(original.split("export const socials")[0], text)


class RebuildBlockTests(unittest.TestCase):
    def test_render_changed_preserves_satisfies(self):
        cfg = load_real()
        model = copy.deepcopy(cfg.blocks["site"].model)
        model["navLinks"].append({"label": "Test", "href": "/test"})
        rendered = cfg._render_changed("site", model)
        self.assertIn("satisfies NavLink[]", rendered)

    def test_render_changed_preserves_raw_identifier(self):
        cfg = load_real()
        model = copy.deepcopy(cfg.blocks["homeScreen"].model)
        model["blurb"].append("appended")
        rendered = cfg._render_changed("homeScreen", model)
        self.assertIn("site.tagline", rendered)
        self.assertNotIn('"site.tagline"', rendered)

    def test_new_screen_renders_with_annotation(self):
        cfg = load_real()
        model = {"title": "Demo", "blurb": ["hello"]}
        rendered = cfg._render_changed("demoScreen", model)
        self.assertTrue(rendered.startswith("export const demoScreen: ScreenContent ="))

    def test_emit_string_uses_json_escaping(self):
        self.assertEqual(emit('a "b"\nc', ""), json_dumps_eq('a "b"\nc'))

    def test_emit_raw_verbatim(self):
        self.assertEqual(emit(Raw("site.tagline"), ""), "site.tagline")


class BlockTextTests(unittest.TestCase):
    def test_blocks_roundtrip_strips_blanks(self):
        blocks = ["one", "two three", "four"]
        text = blocks_to_text(blocks)
        self.assertEqual(text_to_blocks([], text), ["one", "two three", "four"])

    def test_raw_preserved_when_line_unchanged(self):
        old = [Raw("site.tagline"), "hello"]
        text = blocks_to_text(old)
        self.assertEqual(text_to_blocks(old, text), old)

    def test_edited_raw_line_becomes_string(self):
        old = [Raw("site.tagline"), "hello"]
        text = "changed\n\nanother"
        self.assertEqual(text_to_blocks(old, text), ["changed", "another"])

    def test_blank_lines_split_blocks(self):
        text = "first\nsecond\n\nthird"
        self.assertEqual(text_to_blocks([], text), ["first\nsecond", "third"])

    def test_internal_single_newlines_are_kept(self):
        blocks = ["list:\n- one\n- two", "para"]
        self.assertEqual(text_to_blocks([], blocks_to_text(blocks)), blocks)


def json_dumps_eq(value: str) -> str:
    import json

    return json.dumps(value, ensure_ascii=False)


class GuardTests(unittest.TestCase):
    def test_missing_required_block_raises(self):
        with tempfile.TemporaryDirectory() as td:
            dest = Path(td) / "siteConfig.ts"
            dest.write_text("export const socials: Socials = {};\n", encoding="utf-8")
            with self.assertRaises(ConfigError):
                SiteConfigFile(dest)

    def test_unterminated_export_raises(self):
        with tempfile.TemporaryDirectory() as td:
            dest = Path(td) / "siteConfig.ts"
            dest.write_text(
                'export const site: Site = {\n  name: "x"\n}\n', encoding="utf-8"
            )
            with self.assertRaises(ConfigError):
                SiteConfigFile(dest)


if __name__ == "__main__":
    unittest.main()
