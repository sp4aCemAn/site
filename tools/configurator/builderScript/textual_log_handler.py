"""Bridges stdlib logging into a Textual RichLog widget.

Fixes two problems at once:
- site_generator / component_registry writing print() to stdout, corrupting the
  live TUI screen (stdout is the render surface)
- messages emitted before the log widget exists (App.__init__, config load)
  silently vanishing; here they are buffered and flushed on attach
"""

from __future__ import annotations

import logging
from collections import deque

from rich.text import Text
from textual.widgets import RichLog

LEVEL_STYLES: dict[int, str] = {
    logging.DEBUG: "dim",
    logging.INFO: "",
    logging.WARNING: "yellow",
    logging.ERROR: "bold red",
    logging.CRITICAL: "bold white on red",
}


class ShortNameFilter(logging.Filter):
    """Trim dotted logger names to their last component ('configurator.site_generator' -> 'site_generator')."""

    def filter(self, record: logging.LogRecord) -> bool:
        record.name = record.name.rsplit(".", 1)[-1]
        return True


class RichLogHandler(logging.Handler):
    """logging.Handler that renders records into a RichLog widget.

    Records emitted before attach() are buffered (up to maxlen) and flushed
    when the log widget becomes available.
    """

    def __init__(self, level: int = logging.NOTSET, maxlen: int = 500) -> None:
        super().__init__(level=level)
        self.addFilter(ShortNameFilter())
        self._log: RichLog | None = None
        self._pending: deque[Text] = deque(maxlen=maxlen)

    @property
    def pending(self) -> list[str]:
        """Snapshot of buffered messages (mostly for tests/diagnostics)."""
        return [str(t) for t in self._pending]

    def attach(self, log_widget: RichLog) -> None:
        self._log = log_widget
        while self._pending:
            log_widget.write(self._pending.popleft())

    def emit(self, record: logging.LogRecord) -> None:
        try:
            msg = self.format(record)
            style = LEVEL_STYLES.get(record.levelno, "")
            text = Text(msg, style=style) if style else Text(msg)
            if self._log is None:
                self._pending.append(text)
            else:
                self._log.write(text)
        except Exception:
            self.handleError(record)
