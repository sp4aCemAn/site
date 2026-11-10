#!/usr/bin/env bash
# Installer for the site configurator: creates venv/, installs pinned deps,
# and writes the ./cfg launcher. No args = install; --clean removes artifacts.
set -euo pipefail

BUILD_VENV="venv"
VENV_PY="$BUILD_VENV/bin/python"

ACTION="${1:-install}"

if [ "$ACTION" = "--clean" ]; then
    echo "Removing build artifacts (keeping $BUILD_VENV/)..."
    rm -f cfg
    exit 0
fi

if ! command -v python3 &>/dev/null; then
    echo "python3 not found; install Python 3.10+." >&2
    exit 1
fi

if [ ! -x "$VENV_PY" ]; then
    echo "Creating virtual environment at $BUILD_VENV/..."
    python3 -m venv "$BUILD_VENV"
fi

echo "Installing dependencies..."
"$VENV_PY" -m pip install --upgrade pip
"$VENV_PY" -m pip install -r ./requirements.txt

echo "Writing ./cfg launcher..."
cat > cfg <<'EOF'
#!/usr/bin/env bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
"$SCRIPT_DIR/venv/bin/python" "$SCRIPT_DIR/builderScript/main.py" "$@"
EOF
chmod +x cfg

echo "Installed. Run it against the repo root (the default) or a path:"
echo "  ./cfg            # edits this repo's src/data/siteConfig.ts"
echo "  ./cfg /path/to/site"
