#!/bin/bash

# Exit if no package name is provided
if [ -z "$1" ]; then
  echo "Error: No package name provided."
  exit 1
fi

PACKAGE_NAME=$1
echo "[sandbox] Starting analysis for: $PACKAGE_NAME"

# We run npm install using strace to monitor system calls across all child processes (-f).
# We filter for 'network' and 'file' classes to detect suspicious activity.
# Output is saved to /sandbox/strace.log

echo "[sandbox] Tracing execution..."
# To ensure the package actually downloads if it hasn't, we will run the install.
# Since npm does a lot of network/file calls inherently, we could also trace just a specific run script if needed.
# For now, tracing the entire install catches malicious postinstall scripts.

strace -f -e trace=%file,%network -s 500 -o /sandbox/strace.log npm install $PACKAGE_NAME --no-audit --no-fund --loglevel=error

# Print a marker so the orchestrator knows when strace output begins
echo "===STRACE_DUMP_START==="
cat /sandbox/strace.log
echo "===STRACE_DUMP_END==="

# Cleanup to ensure ephemeral state
rm -rf node_modules package.json package-lock.json /sandbox/strace.log

echo "[sandbox] Analysis complete."
