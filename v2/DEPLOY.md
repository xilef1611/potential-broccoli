# 🚀 CryptoMarket v2 — Deployment Guide

> Komplette Schritt-für-Schritt Anleitung für Produktions-Deployment

---

## Voraussetzungen

- **Node.js** 18+ (`node --version`)
- **PostgreSQL** 14+ (lokal oder remote, z.B. Supabase/Neon/Railway)
- **Domain** mit SSL (empfohlen: Nginx + Certbot)
- **Oxapay** Merchant Key (für Zahlungen)
- Linux-Server (Ubuntu 20.04+) oder Hosting wie Vercel/Railway

---

## SCHRITT 1 — Dateien hochladen

```bash
# Per SCP auf deinen Server:
scp -r cryptomarket-v2.zip user@dein-server.de:/var/www/

# Auf dem Server:
cd /var/www
unzip cryptomarket-v2.zip
mv cryptomarket-shop-v2 cryptomarket
cd cryptomarket
```

---

## SCHRITT 2 — Environment Variables

```bash
cp .env.local.example .env.local
nano .env.local
```

Folgende Werte eintragen:

```env
# Datenbank (PostgreSQL Connection String)
DATABASE_URL=postgresql://USERNAME:PASSWORD@HOST:5432/DATABASE_NAME

# JWT Secret (mind. 64 Zeichen, zufällig generieren!)
# Generieren: openssl rand -hex 64
JWT_SECRET=HIER_EINEN_LANGEN_ZUFAELLIGEN_STRING_EINTRAGEN

# Oxapay Merchant Key (von oxapay.com/merchant)
OXAPAY_MERCHANT_KEY=DEIN-OXAPAY-KEY

# Deine öffentliche URL (kein Trailing Slash!)
NEXT_PUBLIC_SITE_URL=https://deine-domain.de

# Optional: SSL für Datenbankverbindung (bei Remote-DB oft nötig)
DATABASE_SSL=false
```

---

## SCHRITT 3 — Datenbank migrieren

```bash
# Stellt sicher dass DATABASE_URL korrekt ist, dann:
npm run db:migrate
```

Ausgabe sollte sein:
```
Running migrations...
✅ Migrations completed successfully!
Default admin credentials:
  Email: admin@asklepi0s.top
  Password: Admin@Asklepios2024!
⚠️  CHANGE THE ADMIN PASSWORD IMMEDIATELY AFTER FIRST LOGIN!
✅ V2 migrations completed!
```

---

## SCHRITT 4 — Dependencies installieren & bauen

```bash
npm install
npm run build
```

Bei Build-Fehlern:
```bash
# TypeScript-Fehler ignorieren (für schnellen Start):
npm run build -- --no-lint || true
# ODER: 
npx next build 2>&1 | tail -20
```

---

## SCHRITT 5 — App starten

### Option A: Direkt (Test)
```bash
npm start
# App läuft auf http://localhost:3000
```

### Option B: Mit PM2 (Produktion — empfohlen)
```bash
# PM2 installieren falls nicht vorhanden:
npm install -g pm2

# Starten:
pm2 start npm --name "cryptomarket" -- start
pm2 save
pm2 startup  # Autostart beim Booten

# Status prüfen:
pm2 status
pm2 logs cryptomarket
```

---

## SCHRITT 6 — Nginx konfigurieren (Reverse Proxy)

```bash
sudo nano /etc/nginx/sites-available/cryptomarket
```

```nginx
server {
    listen 80;
    server_name deine-domain.de www.deine-domain.de;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 50M;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/cryptomarket /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### SSL mit Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d deine-domain.de -d www.deine-domain.de
```

---

## SCHRITT 7 — Oxapay Webhook einrichten

Im Oxapay Dashboard:
- **Callback URL:** `https://deine-domain.de/api/oxapay/callback`
- **Return URL:** `https://deine-domain.de/payment-success?order={ORDER_ID}`

---

## SCHRITT 8 — Admin-Passwort ändern

1. Öffne `https://deine-domain.de/account/login`
2. Login: `admin@asklepi0s.top` / `Admin@Asklepios2024!`
3. Wird automatisch zum Admin-Dashboard weitergeleitet
4. **Sofort Passwort in der Datenbank ändern:**

```sql
-- Per psql oder pgAdmin:
UPDATE users SET password_hash = '$2a$12$NEUER_HASH' WHERE email = 'admin@asklepi0s.top';

-- Oder neuen Admin anlegen:
-- Passwort-Hash generieren: node -e "const b=require('bcryptjs');b.hash('NeuesPasswort!',12).then(console.log)"
```

---

## Deployment auf Vercel (Alternative)

```bash
npm install -g vercel
vercel

# Environment Variables in Vercel Dashboard setzen:
# DATABASE_URL, JWT_SECRET, OXAPAY_MERCHANT_KEY, NEXT_PUBLIC_SITE_URL
```

---

## Deployment auf Railway (Alternative)

1. Projekt auf [railway.app](https://railway.app) erstellen
2. PostgreSQL Plugin hinzufügen
3. `DATABASE_URL` aus dem Plugin kopieren
4. Alle anderen ENV Vars setzen
5. Deploy aus GitHub oder per CLI

---

## Features — Übersicht

| Feature | Status |
|---------|--------|
| Shop Frontend (CryptoMarket Design) | ✅ |
| Anonyme Bestellungen ohne Account | ✅ |
| Oxapay Crypto-Zahlung (BTC, ETH, XMR, USDT) | ✅ |
| Admin Dashboard mit Stats | ✅ |
| Bestellverwaltung + Statusänderung | ✅ |
| Produktverwaltung + Bilder | ✅ |
| Kundenverwaltung | ✅ |
| Gutscheincode-System | ✅ |
| Support-Ticket-System | ✅ |
| Analytics (Umsatz, Bestellungen, Top-Produkte) | ✅ |
| Shop-Einstellungen (Name, Banner etc.) | ✅ |
| Bestellverfolgung | ✅ |
| Benutzerkonten (Login/Register) | ✅ |

---

## Troubleshooting

**Build-Fehler "Cannot find module 'X'":**
```bash
npm install
```

**Datenbank-Verbindungsfehler:**
```bash
# Connection testen:
node -e "const {Pool}=require('pg');const p=new Pool({connectionString:process.env.DATABASE_URL});p.query('SELECT 1').then(()=>console.log('OK')).catch(console.error)"
```

**Seite lädt nicht / 502 Bad Gateway:**
```bash
pm2 status
pm2 logs cryptomarket --lines 50
```

**Port bereits belegt:**
```bash
# Port prüfen:
lsof -i :3000
# App auf anderem Port:
PORT=3001 npm start
```

---

## Verzeichnisstruktur

```
cryptomarket/
├── src/
│   ├── app/
│   │   ├── (frontend pages)
│   │   ├── admin/         ← Admin Dashboard
│   │   └── api/           ← API Routes
│   ├── components/        ← React Komponenten
│   └── lib/               ← Utilities (db, auth, etc.)
├── scripts/
│   └── migrate.js         ← Datenbankmigrationen
├── .env.local             ← Environment Variables (NICHT committen!)
├── package.json
└── DEPLOY.md              ← Diese Datei
```

---

*CryptoMarket v2 — Gebaut mit Next.js 14, PostgreSQL, Oxapay*
