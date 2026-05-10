# Deploy

Production runs on Proxmox LXC 100 (`triexpert`, 10.0.0.30) inside Docker.
The container is built from this repo at `/home/` and exposed via the
Pangolin reverse proxy on Hetzner.

## Auto-deploy on push to `main`

Every merge to `main` triggers `.github/workflows/deploy.yml`, which:

1. SSH-jumps from GitHub runner → Hetzner (`5.161.71.133`) → Proxmox (`10.0.0.2`)
2. Runs `pct exec 100 -- /usr/local/bin/triexpert-deploy`
3. The deploy script does `git pull → docker compose build → up -d` and waits
   for the healthcheck. The full logic lives in `scripts/deploy.sh`.

Deploys are serialised by a `concurrency: deploy-prod` group, so two
overlapping pushes can't race.

## One-time setup

### 1 — Generate a dedicated deploy SSH key (on the operator's Mac)

```bash
ssh-keygen -t ed25519 -N '' \
  -C 'deploy@github-actions/triexpert-home' \
  -f ~/.ssh/triexpert_deploy_ed25519
```

Yields two files:

- `~/.ssh/triexpert_deploy_ed25519` (private key — goes to GitHub secret)
- `~/.ssh/triexpert_deploy_ed25519.pub` (public key — goes to both servers)

### 2 — Install the public key on Hetzner and Proxmox

```bash
# Hetzner (jump host)
ssh-copy-id -i ~/.ssh/triexpert_deploy_ed25519.pub root@5.161.71.133

# Proxmox (target — reached over WG via ProxyJump)
ssh -J root@5.161.71.133 root@10.0.0.2 \
  "tee -a ~/.ssh/authorized_keys" < ~/.ssh/triexpert_deploy_ed25519.pub
```

### 3 — Add GitHub Actions secrets

In <https://github.com/TriExpert-Services/home/settings/secrets/actions>
add:

| Secret | Value |
|--------|-------|
| `DEPLOY_SSH_KEY` | full contents of `~/.ssh/triexpert_deploy_ed25519` (including the `BEGIN/END` lines) |
| `HETZNER_HOST` | `5.161.71.133` |
| `PROXMOX_HOST` | `10.0.0.2` |
| `LXC_ID` | `100` |

### 4 — Bootstrap the LXC

Once the new branch is merged to `main` and the LXC has the new
`compose.yaml` / `scripts/` / `.env`, install the shim once:

```bash
ssh root@10.0.0.2 \
  "pct exec 100 -- bash /home/scripts/install-deploy.sh"
```

After that, every push to `main` redeploys automatically. You can also
trigger a manual run from the **Actions → deploy → Run workflow** button
in GitHub.

### 5 — Restrict the deploy key to the deploy command (optional, recommended)

Once the workflow is verified working, on Hetzner edit
`~/.ssh/authorized_keys` and prefix the deploy public key with

```
command="ssh -J root@5.161.71.133 root@10.0.0.2 'pct exec 100 -- /usr/local/bin/triexpert-deploy'",no-port-forwarding,no-X11-forwarding,no-agent-forwarding,no-pty
```

so the GitHub key can only run the deploy, not open an interactive shell.
The same lock can be applied on Proxmox using
`pct exec 100 -- /usr/local/bin/triexpert-deploy` directly. Defer this
hardening until after the first successful deploy.

## Manual deploy

```bash
ssh root@10.0.0.2 "pct exec 100 -- /usr/local/bin/triexpert-deploy"
```

Or trigger the GitHub Action manually from the **Actions** tab.

## Rollback

The deploy script does `git reset --hard origin/main`. To roll back:

```bash
# 1. Find a known-good SHA
ssh root@10.0.0.2 "pct exec 100 -- bash -c 'cd /home && git log --oneline -10'"

# 2. Reset and rebuild
ssh root@10.0.0.2 "pct exec 100 -- bash -c '
  cd /home &&
  git reset --hard <SHA> &&
  docker compose build --pull &&
  docker compose up -d
'"
```

If the LXC itself is broken, restore from the most recent vzdump in
`/mnt/backups/dump/` on the Proxmox host:

```bash
pct stop 100
pct restore 100 /mnt/backups/dump/vzdump-lxc-100-<timestamp>.tar.zst \
  --storage local-lvm --force
```

## Required env on the LXC

`/home/.env` must define:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_N8N_WEBHOOK_URL` (translation form)
- `VITE_N8N_CONTACT_WEBHOOK_URL` (contact form)
- `HOST_PORT` (default `80`)
- `CONTAINER_PORT` (default `80`)

See `.env.example` for the canonical list.

The chatbot no longer needs anything in `.env` — it goes through the
`chatbot-relay` Supabase edge function. That function reads
`N8N_CHAT_WEBHOOK_URL`, `N8N_HMAC_SECRET`, and `ALLOWED_ORIGINS` from
Supabase secrets (`supabase secrets set ...`).
