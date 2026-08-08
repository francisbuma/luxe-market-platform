# 🏪 LuxeMarket E-Commerce Platform

Eine vollständige E-Commerce-Microservices-Plattform mit **Node.js v24 native SQLite** (`node:sqlite`).

## ⚡ Node.js v24+ Voraussetzung

Dieses Projekt verwendet die eingebaute SQLite3-Unterstützung von Node.js v24.0.0+.
Kein externes `sqlite3` npm-Paket mehr nötig!

```bash
# Prüfen Sie Ihre Node.js Version
node --version
# Muss >= v24.0.0 sein
```

## 📁 Projektstruktur

```
luxe-market-platform/
├── backend/
│   ├── gateway/              # API Gateway (Port 8080)
│   ├── services/
│   │   ├── auth-service/     # Authentifizierung (Port 3101)
│   │   ├── product-service/  # Produktkatalog (Port 3102)
│   │   ├── cart-service/     # Warenkorb (Port 3103)
│   │   ├── order-service/    # Bestellungen (Port 3104)
│   │   └── customer-service/ # Kundenverwaltung (Port 3105)
│   └── shared/
│       ├── database.js       # node:sqlite Datenbankverbindung
│       └── auth.js           # Session / Auth helper
├── frontend/                 # HTML/CSS/JS Frontend (static pages in `frontend/pages`)
├── database/                 # SQLite Datenbankdatei
├── start.js                  # Starter-Skript
└── package.json
```

## 🚀 Schnellstart

### 1. Node.js v24+ installieren

Falls Sie noch keine v24 haben:
```bash
# Mit nvm
nvm install 24
nvm use 24

# Oder direkt von nodejs.org
# https://nodejs.org/en/download
```

### 2. Abhängigkeiten installieren
```bash
npm run install:all
```

### 3. Plattform starten
```bash
npm start
```

### 4. Im Browser öffnen
```
http://localhost:8180
```

## 🔧 Services

| Service | Port | Beschreibung |
|---------|------|-------------|
| API Gateway | 8080 | Zentrale API (Gateway) und statische Dateien |
| Auth Service | 3101 | Session- und Registrierungsendpunkte |
| Product Service | 3102 | Produktkatalog, Suche, Filter |
| Cart Service | 3103 | Persistenter Warenkorb |
| Order Service | 3104 | Bestellungen, Zahlungsmock |
| Customer Service | 3105 | Profil, Adressen, Dashboard-Daten |

## 📡 API Endpoints

### Sessions / Auth
- `POST /api/session/register` - Registrierung (Gateway route)
- `POST /api/session/login` - Login (Gateway route)
- `GET /api/session/me` - Aktuelle Sitzung / eingeloggter Nutzer
- `POST /api/session/logout` - Logout
> Hinweis: Der Gateway verwendet session-basierte Endpunkte (`/api/session/*`) und leitet intern an die Services weiter.

### Produkte
- `GET /api/products` - Alle Produkte (mit Filter: ?category=electronics)
- `GET /api/products/:id` - Einzelnes Produkt

### Warenkorb
- `GET /api/cart` - Warenkorb anzeigen
- `POST /api/cart/items` - Artikel hinzufügen
- `PUT /api/cart/items/:id` - Menge ändern
- `DELETE /api/cart/items/:id` - Artikel entfernen

### Bestellungen
- `POST /api/orders` - Bestellung aufgeben
- `GET /api/orders` - Bestellhistorie
- `GET /api/orders/:id` - Bestelldetails

### Kunde
- `GET /api/customer/profile` - Profil mit Statistik
- `GET /api/customer/dashboard` - Dashboard-Daten
- `GET /api/customer/addresses` - Adressen
- `POST /api/customer/addresses` - Adresse hinzufügen
- `GET /api/customer/orders` - Bestellungen mit Details

## 🗄️ Datenbank (node:sqlite)

SQLite Datenbank wird automatisch in `database/luxe-market.db` erstellt.

**Vorteile von node:sqlite:**
- ✅ Kein native C++ Modul nötig
- ✅ Schnellere Installation
- ✅ Keine Build-Probleme
- ✅ Direkt in Node.js integriert
- ✅ Synchrones API für einfacheren Code

Tabellen:
- `users` - Benutzerkonten
- `addresses` - Lieferadressen
- `products` - Produkte
- `orders` - Bestellungen
- `order_items` - Bestellpositionen
- `cart_items` - Warenkorb (persistent)
- `sessions` - Aktive Sitzungen

## 🔒 Sicherheit

- Passwörter mit bcrypt gehasht
- JWT Token-basierte Authentifizierung
- Session-Management in Datenbank
- CORS aktiviert

## 🆕 Node.js v24 Upgrade

```javascript
// Alt (sqlite3 npm package):
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('file.db');

// Neu (node:sqlite native):
const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('file.db');

// Alt (callbacks):
db.get("SELECT * FROM users", [], (err, row) => { ... });

// Neu (synchron):
const stmt = db.prepare("SELECT * FROM users");
const row = stmt.get();
stmt.finalize();
```

## ✅ Quick Test Guide

Kurze Prüfungen, um die wichtigsten Flows lokal zu verifizieren.

1) Plattform starten (Gateway + Services):

```bash
npm start
```

2) App im Browser öffnen (Gateway läuft standardmäßig auf Port 8080 in dieser Arbeitskopie):

```
http://localhost:8180
```

3) Login → Dashboard (funktionaler Test):

- Öffne `/pages/login.html`.
- Verwende (falls vorhanden) den Test-Account:

```
Email: verify@example.com
Password: Verify123!
```

- Erwartetes Verhalten: Login liefert HTTP 200, setzt die Session und leitet auf `/pages/dashboard.html` weiter.

4) Produktseite - schnelle Prüfung (Erfolg + Fehler):

- Öffne `/pages/products.html`.
- Bei verfügbaren Services zeigt die Seite Produkt-Karten. Während des Ladens werden Skeleton-Placeholder angezeigt.
- Bei Serverfehlern (z. B. Product Service offline oder 500) zeigt die Seite eine klare Fehler-UI mit Retry-Button.

5) Nützliche Curl-Checks (optional):

```bash
# Registrierung (nur wenn benötigt)
curl -i -X POST http://localhost:8180/api/session/register \
	-H 'Content-Type: application/json' \
	-d '{"email":"verify@example.com","password":"Verify123!","firstName":"Verify","lastName":"User"}'

# Login (serverseitig - browser session bildet Cookie ab)
curl -i -X POST http://localhost:8180/api/session/login \
	-H 'Content-Type: application/json' \
	-d '{"email":"verify@example.com","password":"Verify123!"}'

# Session prüfen (benötigt Browser-Cookie oder manuelle Cookie-Weitergabe)
curl -i http://localhost:8180/api/session/me
```

6) Logs & Test-Outputs

- Während meiner Tests habe ich Konsolen- und Snapshot-Logs gesammelt und in `logs/products-console.log` abgelegt.
- Wenn du komplette (ungekürzte) Snapshots oder Playwright-Logs möchtest, kann ich sie ebenfalls ins `logs/` Verzeichnis exportieren.

Hinweis: Viele Frontend-Seiten enthalten defensive Fallbacks (z. B. `FALLBACK_I18N`, `SafeDOM.escapeHtml`) um Probleme zu vermeiden, falls `/assets/i18n.js` blockiert ist oder externe Bilder geblockt werden.

```
