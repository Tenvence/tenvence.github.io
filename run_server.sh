case "${LANG:-}" in ""|C|POSIX|US-ASCII|*.US-ASCII) export LANG="en_US.UTF-8" ;; esac
case "${LC_ALL:-}" in C|POSIX|US-ASCII|*.US-ASCII) export LC_ALL="en_US.UTF-8" ;; esac
case "${LC_CTYPE:-}" in ""|C|POSIX|US-ASCII|*.US-ASCII) export LC_CTYPE="en_US.UTF-8" ;; esac

if command -v lsof >/dev/null 2>&1; then
  for port in 4000 35729; do
    pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN)"
    if [ -n "$pids" ]; then
      echo "Port $port is already in use by PID(s): $pids"
      echo "Stop the existing local server first, or press Ctrl+C in the terminal running it."
      exit 1
    fi
  done
fi

bundle exec jekyll liveserve
