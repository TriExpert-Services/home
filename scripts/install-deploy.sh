#!/usr/bin/env bash
#
# One-time bootstrap, run inside LXC 100 as root.
# Installs a stable shim at /usr/local/bin/triexpert-deploy that calls
# the in-repo deploy script. The shim almost never changes; the real
# logic lives in scripts/deploy.sh and updates with every git pull.
#
set -euo pipefail

cat > /usr/local/bin/triexpert-deploy <<'SHIM'
#!/usr/bin/env bash
exec bash /home/scripts/deploy.sh "$@"
SHIM

chmod +x /usr/local/bin/triexpert-deploy

echo "✅ /usr/local/bin/triexpert-deploy installed"
echo
echo "Test it:"
echo "  /usr/local/bin/triexpert-deploy"
