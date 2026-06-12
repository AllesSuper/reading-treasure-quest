#!/usr/bin/env bash
# Buendelt src/* zu einer eigenstaendigen index.html (offline lauffaehig).
set -e
cd "$(dirname "$0")"

OUT=index.html
{
  echo '<!DOCTYPE html>'
  echo '<html lang="de">'
  echo '<head>'
  echo '<meta charset="UTF-8">'
  echo '<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=1.0, user-scalable=no">'
  echo '<meta name="apple-mobile-web-app-capable" content="yes">'
  echo '<meta name="apple-mobile-web-app-status-bar-style" content="default">'
  echo '<meta name="theme-color" content="#ff7a3c">'
  echo '<title>LeseAbenteuer - Lesen lernen</title>'
  echo '<style>'
  cat src/styles.css
  echo '</style>'
  echo '</head>'
  echo '<body>'
  cat src/shell.html
  echo '<script>'
  cat src/content.js
  cat src/app.js
  echo '</script>'
  echo '</body>'
  echo '</html>'
} > "$OUT"

echo "Built $OUT ($(wc -c < $OUT) bytes)"
