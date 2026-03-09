#!/bin/bash
# Launch the desktop widget
# Unset ELECTRON_RUN_AS_NODE (set by VS Code/Cursor) so Electron runs properly
cd "$(dirname "$0")"
unset ELECTRON_RUN_AS_NODE
./node_modules/.bin/electron . &
echo "Widget launched!"
