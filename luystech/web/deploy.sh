#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# LuysTech — ավտոմատ deploy Ubuntu սերվերի վրա (դոմենով + SSL)
# Հավելվածն աշխատում է առանձին ՈՉ-root օգտատիրոջ (luystech) տակ։
# Գործարկել՝  sudo bash deploy.sh ՁԵՐԴՈՄԵՆԸ ՁԵՐ@ԷԼՓՈՍՏԸ
# Օրինակ՝     sudo bash deploy.sh luystech.am admin@luystech.am
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

DOMAIN="${1:-}"
EMAIL="${2:-admin@${DOMAIN:-example.com}}"
PORT="${PORT:-3000}"
APP_DIR="$(cd "$(dirname "$0")" && pwd)"   # այս (web) թղթապանակը
RUN_USER="luystech"                        # ՈՉ-root օգտատեր հավելվածի համար

if [ -z "$DOMAIN" ]; then
  echo "❌ Դոմեն նշված չէ։  sudo bash deploy.sh luystech.am admin@luystech.am"
  exit 1
fi
if [ "$(id -u)" -ne 0 ]; then echo "❌ Գործարկեք sudo-ով"; exit 1; fi

echo "▶ Դոմեն: $DOMAIN | Email: $EMAIL | Թղթապանակ: $APP_DIR | Port: $PORT | User: $RUN_USER"

# 1) Համակարգային փաթեթներ
echo "▶ [1/7] Փաթեթների տեղադրում…"
apt-get update -y
apt-get install -y curl ca-certificates gnupg nginx ufw

# 2) Node.js 20 (NodeSource)
if ! command -v node >/dev/null 2>&1 || [ "$(node -v | sed 's/v//' | cut -d. -f1)" -lt 20 ]; then
  echo "▶ [2/7] Node.js 20 տեղադրում…"
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
else
  echo "▶ [2/7] Node.js առկա է՝ $(node -v)"
fi
npm i -g pm2 >/dev/null 2>&1 || npm i -g pm2

# 3) ՈՉ-root օգտատեր + իրավունքներ
echo "▶ [3/7] '$RUN_USER' օգտատիրոջ ստեղծում…"
id "$RUN_USER" >/dev/null 2>&1 || useradd -r -m -d "/home/$RUN_USER" -s /bin/bash "$RUN_USER"
# SITE_URL-ը դնում ենք դոմենով (root-ով, chown-ից առաջ)
if grep -q '^NEXT_PUBLIC_SITE_URL=' "$APP_DIR/.env.local" 2>/dev/null; then
  sed -i "s#^NEXT_PUBLIC_SITE_URL=.*#NEXT_PUBLIC_SITE_URL=https://$DOMAIN#" "$APP_DIR/.env.local"
else
  echo "NEXT_PUBLIC_SITE_URL=https://$DOMAIN" >> "$APP_DIR/.env.local"
fi
chmod 600 "$APP_DIR/.env.local" || true
chown -R "$RUN_USER:$RUN_USER" "$APP_DIR"

# 4) Build + PM2 (ամբողջը '$RUN_USER'-ի տակ, ՈՉ root)
echo "▶ [4/7] npm ci + build + PM2 ('$RUN_USER'-ի տակ)…"
sudo -u "$RUN_USER" bash -lc "cd '$APP_DIR' && npm ci && npm run build && pm2 delete luystech >/dev/null 2>&1 || true && PORT=$PORT pm2 start 'npm start' --name luystech && pm2 save"
# ավտո-մեկնարկ boot-ի ժամանակ (root-ը գրանցում է systemd unit-ը luystech-ի համար)
env PATH="$PATH" pm2 startup systemd -u "$RUN_USER" --hp "/home/$RUN_USER" 2>/dev/null | tail -n 1 | bash >/dev/null 2>&1 || true

# 5) nginx reverse proxy (ԱՌԱՆՑ ուրիշ vhost-եր ջնջելու)
echo "▶ [5/7] nginx կարգավորում…"
cat > /etc/nginx/sites-available/luystech <<NGINX
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    location / {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINX
ln -sf /etc/nginx/sites-available/luystech /etc/nginx/sites-enabled/luystech
nginx -t && systemctl reload nginx

# 6) Firewall (SSH-ը թողնում ենք բաց՝ որ չկողպվեք)
echo "▶ [6/7] Firewall (ufw)…"
ufw allow OpenSSH >/dev/null 2>&1 || ufw allow 22/tcp
ufw allow 'Nginx Full' >/dev/null 2>&1 || ufw allow 80,443/tcp
ufw --force enable || true

# 7) SSL (Let's Encrypt)
echo "▶ [7/7] SSL վկայական…"
apt-get install -y certbot python3-certbot-nginx
if certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" --redirect; then
  echo "✓ SSL կարգավորված է"
else
  echo "⚠ SSL-ը չստացվեց — հավանաբar DNS-ը դեռ չի ուղղված սերվերին։"
  echo "  DNS-ը ուղղելուց հետո կրկնեք՝ sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --agree-tos -m $EMAIL --redirect"
fi

echo ""
echo "═══════════════════════════════════════════"
echo "✅ ՊԱՏՐԱՍՏ Է՝  https://$DOMAIN   (ադմին՝ /login)"
echo "   Հավելվածն աշխատում է '$RUN_USER' օգտատիրոջ տակ (ՈՉ root)"
echo "═══════════════════════════════════════════"
