"""Centralized stylesheets for the site configurator TUI.

All Textual CSS lives here as plain string constants so the app compiles its
stylesheets from memory (one source per selector; widget DEFAULT_CSS and
App.CSS merge into a single stylesheet).

Layout convention:
  APP_CSS            -> App.CSS           (global element rules + #status-log)
  SIDEBAR_CSS        -> SidebarMenu.DEFAULT_CSS
  IDENTITY_CSS       -> IdentityTab.DEFAULT_CSS
  SCREEN_EDITOR_CSS  -> ScreensTab.DEFAULT_CSS
  ARTICLE_CSS        -> ArticleEditorTab.DEFAULT_CSS

Responsiveness:
  Textual does not support @media queries. SiteConfiguratorApp toggles a
  "compact" class on the active Screen when the terminal width drops below
  COMPACT_WIDTH; the Screen.compact rules live in App.CSS because widget
  DEFAULT_CSS cannot match ancestors outside the widget.
"""

COMPACT_WIDTH = 100

APP_CSS = """
Screen { layout: vertical; background: $background; }

TabbedContent { height: 1fr; }
TabPane { padding: 1 2; height: 1fr; }

.btn-full { width: 100%; margin-top: 1; margin-bottom: 1; }

Label { color: $text; margin-top: 1; margin-bottom: 0; }

Input, TextArea, Select {
    margin-bottom: 1;
    background: $surface;
    border: solid $secondary;
    color: $text;
    height: auto;
}
Input:focus, TextArea:focus, Select:focus { border: solid $accent; }

.section-title {
    background: $primary; color: $text-primary;
    text-style: bold; padding: 0 1; margin-bottom: 1;
    width: 100%; text-align: center;
}

#status-log {
    height: 10;
    max-height: 40%;
    border-top: solid $primary;
    background: $surface;
    dock: bottom;
    display: none;
}
#status-log.visible { display: block; }

# ------------------------------------------------------------------
# Compact mode (Screen.compact class, toggled by SiteConfiguratorApp on
# resize). Descendant Screen.compact rules MUST live in App.CSS.
# ------------------------------------------------------------------

/* Narrow terminals: shrink the log so the workspace keeps usable height. */
Screen.compact #status-log { height: 6; }

/* Narrow terminals: stack the article editor (metadata above the body). */
Screen.compact #editor-layout { layout: vertical; }
Screen.compact #editor-sidebar {
    width: 100%;
    min-width: 0;
    max-width: 100%;
    height: auto;
    max-height: 45%;
    border-right: none;
    border-bottom: solid $secondary;
}
Screen.compact #editor-main {
    width: 100%;
    height: 1fr;
    padding-left: 0;
}
"""

SIDEBAR_CSS = """
SidebarMenu {
    dock: top;
    width: 100%;
    height: auto;
    background: $surface-darken-1;
    padding: 1 2;
    display: none;
}
SidebarMenu.-active { display: block; }
SidebarMenu Button {
    width: auto;
    min-width: 12;
    margin: 0 1;
    background: $primary;
}
"""

IDENTITY_CSS = """
IdentityTab { height: 1fr; scrollbar-gutter: stable; padding: 0 2; }
"""

SCREEN_EDITOR_CSS = """
ScreensTab {
    height: 1fr;
    padding: 1 2;
    layout: vertical;
}

/* Header */
#top-bar {
    height: auto;
    margin-bottom: 1;
    align-vertical: middle;
}
#top-bar Button {
    margin-right: 2;
}
.section-heading {
    height: auto;
    color: $text-muted;
    text-style: bold;
    content-align-vertical: middle;
}

/* Per-screen controls */
.screen-action-row { height: auto; align-vertical: middle; margin-bottom: 1; }
.screen-action-row Button { width: auto; min-width: 14; margin-right: 2; }

.blurb-box {
    height: 1fr;
    min-height: 10;
    width: 100%;
}

/* Nav links + page management footer */
.divider {
    height: 1;
    border-bottom: solid $primary-darken-2;
    margin-top: 1;
    margin-bottom: 1;
}
#nav_rows { height: auto; max-height: 40%; overflow-y: auto; }
#nav_rows Label { margin: 0 1; }
.nav-row { height: auto; align-vertical: middle; }
.nav-row Input { width: 1fr; margin-right: 1; }
.nav-row Button { width: auto; min-width: 7; margin-right: 1; }

#new-page-bar {
    height: auto;
    layout: vertical;
    margin-top: 1;
}
#page-inputs {
    height: auto;
    margin-bottom: 1;
}
#page-inputs Input {
    width: 1fr;
    margin-right: 1;
}
#page-actions {
    height: auto;
}
#page-actions Button {
    width: auto;
    min-width: 12;
    margin-right: 1;
}

.editor-label { height: auto; color: $text-muted; text-style: bold; margin-bottom: 1; }
"""

ARTICLE_CSS = """
ArticleEditorTab { height: 1fr; }

#article-toolbar {
    height: auto;
    dock: top;
    background: $surface-darken-1;
    border-bottom: solid $primary;
    padding: 1 2;
    align-vertical: middle;
}
#sel-article { width: 1fr; min-width: 20; }
#article-toolbar Button { width: auto; min-width: 10; margin-left: 1; }

#editor-layout { height: 1fr; margin-top: 1; }
#editor-sidebar {
    width: 30%;
    min-width: 32;
    max-width: 44;
    height: 100%;
    background: $surface-darken-1;
    border-right: solid $secondary;
    padding: 1;
    scrollbar-gutter: stable;
}
#editor-sidebar Label { color: $text-muted; text-style: bold; margin-top: 1; margin-bottom: 0; }
#editor-sidebar Input {
    background: $surface; border: none; border-bottom: solid $secondary;
    margin-bottom: 1; height: auto;
}
#editor-sidebar Input:focus { border-bottom: solid $accent; }
.sidebar-header {
    background: $secondary; color: $text;
    text-style: bold; text-align: center;
    padding: 0 1; margin-bottom: 1;
}
#editor-main {
    width: 1fr;
    height: 100%;
    padding-left: 1;
    scrollbar-gutter: stable;
}
#art-content {
    height: auto;
    min-height: 8;
    width: 100%;
    border: none;
    background: $surface;
    padding: 0 1;
}
"""
