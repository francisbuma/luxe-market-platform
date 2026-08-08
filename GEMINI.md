## Für die Erstellung einer Microservice Plattform sollen Anforderungen gelten. Es verwendet HTML5/CSS3/Javascript / Node v24.16.0 und Express für Frontend und Backend. Weitere Modullen oder Bibliotheken können auch ergänzt werden

## Komplette Dateiliste

luxe-market-platform/
├── backend/
│   ├── gateway/server.js              # API Gateway (Port 8080)
│   ├── services/
│   │   ├── auth-service/server.js     # Login/Register (Port 3001)
│   │   ├── product-service/server.js  # Produkte mit Bildern (Port 3002)
│   │   ├── cart-service/server.js     # Warenkorb (Port 3003)
│   │   ├── order-service/server.js    # Bestellungen (Port 3004)
│   │   └── customer-service/server.js # Dashboard/Profile (Port 3005)
│   └── shared/
│       ├── database.js                # node:sqlite + image_url
│       └── auth.js                    # JWT Middleware
├── frontend/
│   ├── index.html                     # Home mit Bildern + i18n
│   ├── pages/
│   │   ├── login.html                 # Robustes Login + Server-Check
│   │   ├── register.html              # Robustes Register + Validierung
│   │   ├── products.html              # Produkte mit Bildern + Suche
│   │   └── dashboard.html             # Dashboard mit Server-Check
│   └── assets/
│       └── i18n.js                    # 5-Sprachen-System
├── database/                          # SQLite DB (automatisch erstellt)
├── start.js                           # Starter für alle Services
├── package.json                       # Root package
└── README.md                          # Dokumentation

## Die Architektur ist wie folgt:
| Service              | Port | Beschreibung                       |
| -------------------- | ---- | ---------------------------------- |
| **API Gateway**      | 8080 | Zentrale API, statische Dateien    |
| **Auth Service**     | 3001 | Login, Register, JWT, Sessions     |
| **Product Service**  | 3002 | Produktkatalog, Filter, Suche      |
| **Cart Service**     | 3003 | Persistenter Warenkorb (SQLite)    |
| **Order Service**    | 3004 | Bestellungen, Zahlung, Stornierung |
| **Customer Service** | 3005 | Profil, Adressen, Dashboard-Stats  |

| Layer        | Technologie                       |
| ------------ | --------------------------------- |
| **Frontend** | Vanilla HTML/CSS/JS + i18n Engine |
| **Backend**  | Node.js v24 + Express             |
| **Database** | `node:sqlite` (native, kein npm)  |
| **Auth**     | JWT + bcrypt                      |
| **Gateway**  | http-proxy-middleware             |


## Es wird die native SQLite-Datenbank gebraucht
users – Kundenkonten (Passwörter bcrypt-gehasht)
addresses – Lieferadressen mit Standard-Flag
products – Produkte mit Preis, Stock, Badges
orders – Bestellungen mit Status-Tracking
order_items – Bestellpositionen
cart_items – Persistenter Warenkorb pro User
sessions – JWT-Token-Verwaltung

## Enthaltene Seiten
| Seite             | URL                     | Funktion                              |
| ----------------- | ----------------------- | ------------------------------------- |
| **Home/Shop**     | `/`                     | Produktübersicht, Warenkorb, Checkout |
| **Produkte**      | `/pages/products.html`  | Erweiterte Produktsuche mit Filter    |
| **Login**         | `/pages/login.html`     | Anmeldung + Gast-Warenkorb-Sync       |
| **Registrierung** | `/pages/register.html`  | Konto erstellen                       |
| **Dashboard**     | `/pages/dashboard.html` | Profil, Bestellungen, Adressen, Stats |

## 🏗️ Architektur

| Service | Port | Beschreibung |
|---------|------|-------------|
| **API Gateway** | 8080 | Zentrale API, statische Dateien |
| **Auth Service** | 3001 | Login, Register, JWT, Sessions |
| **Product Service** | 3002 | Produktkatalog, Filter, Suche |
| **Cart Service** | 3003 | Persistenter Warenkorb (SQLite) |
| **Order Service** | 3004 | Bestellungen, Zahlung, Stornierung |
| **Customer Service** | 3005 | Profil, Adressen, Dashboard-Stats |

---

## 🗄️ SQLite Datenbank (`database/luxe-market.db`)

- **`users`** – Kundenkonten (Passwörter bcrypt-gehasht)
- **`addresses`** – Lieferadressen mit Standard-Flag
- **`products`** – Produkte mit Preis, Stock, Badges
- **`orders`** – Bestellungen mit Status-Tracking
- **`order_items`** – Bestellpositionen
- **`cart_items`** – Persistenter Warenkorb pro User
- **`sessions`** – JWT-Token-Verwaltung

## node:sqlite statt sqlite3 npm-Paket

| Vorher (`sqlite3`)                | Nachher (`node:sqlite`)                       |
| --------------------------------- | --------------------------------------------- |
| `npm install sqlite3` (C++ Build) | ✅ Direkt in Node.js integriert                |
| Asynchrone Callbacks              | ✅ Synchrones API (`stmt.get()`, `stmt.all()`) |
| `new sqlite3.Database()`          | ✅ `new DatabaseSync()`                        |
| `db.run("CREATE...", callback)`   | ✅ `db.exec("CREATE...")`                      |
| `stmt.get(params, callback)`      | ✅ `stmt.get(...params)`                       |
| `stmt.all(params, callback)`      | ✅ `stmt.all(...params)`                       |

## Services 

| Service                      | Version | Änderung                              |
| ---------------------------- | ------- | ------------------------------------- |
| `backend/shared/database.js` | v2.0    | `node:sqlite` statt `sqlite3`         |
| `auth-service`               | v2.0    | Synchrones SQLite API                 |
| `product-service`            | v2.0    | Synchrones SQLite API                 |
| `cart-service`               | v2.0    | Synchrones SQLite API                 |
| `order-service`              | v2.0    | Synchrones SQLite API + Transaktionen |
| `customer-service`           | v2.0    | Synchrones SQLite API                 |
| `root package.json`          | v2.0    | `engines: { "node": ">=24.0.0" }`     |

## Vorteile der Version v2.0
---
# Kein npm install sqlite3 mehr – spart Build-Zeit und vermeidet native Kompilierungsfehler
# Schnellere Datenbankoperationen – synchrones API ohne Callback-Overhead
# Einfacherer Code – kein Promise-Wrapping für SQLite nötig
# Zukunftssicher – Offizielles Node.js Core-Modul
---


---

## 🚀 Schnellstart

```bash
# ZIP entpacken
cd luxe-market-platform

# Alle Abhängigkeiten installieren
npm run install:all

# Plattform starten (startet alle 6 Services automatisch)
npm start

# Browser öffnen
http://localhost:8080
```

---

## 📄 Enthaltene Seiten

| Seite | URL | Funktion |
|-------|-----|----------|
| **Home/Shop** | `/` | Produktübersicht, Warenkorb, Checkout |
| **Produkte** | `/pages/products.html` | Erweiterte Produktsuche mit Filter |
| **Login** | `/pages/login.html` | Anmeldung + Gast-Warenkorb-Sync |
| **Registrierung** | `/pages/register.html` | Konto erstellen |
| **Dashboard** | `/pages/dashboard.html` | Profil, Bestellungen, Adressen, Stats |

---

## 🔧 Features
- **Login/Register** mit JWT-Authentifizierung
- **Customer Dashboard** mit echten Daten aus SQLite:
  - Statistikkarten (Bestellungen, Ausgaben, Adressen, Warenkorb)
  - Bestellhistorie mit Status-Tracking
  - Adressverwaltung (Hinzufügen, Bearbeiten, Löschen, Standard setzen)
  - Profil bearbeiten
- **Persistenter Warenkorb** – auch nach Logout erhalten
- **Gast-Warenkorb-Sync** beim Login
- **Checkout** mit Adressauswahl und Bestellabschluss
- **Bestellstornierung** für ausstehende Bestellungen

## Neue Features: Mehrsprachigkeit (i18n)

| Sprache      | Code | Flag | Abdeckung     |
| ------------ | ---- | ---- | ------------- |
| **English**  | `en` | 🇬🇧 | Vollständig   |
| **Deutsch**  | `de` | 🇩🇪 | Vollständig   |
| **Français** | `fr` | 🇫🇷 | Kern-Features |
| **Español**  | `es` | 🇪🇸 | Kern-Features |
| **Italiano** | `it` | 🇮🇹 | Kern-Features |

# Sprachauswahl
Header-Dropdown (🏴 Flaggen) auf allen Seiten
Login/Register haben zusätzliche Sprach-Chips
Dashboard hat kompakte Sprach-Chips in der Top-Bar
Sprache wird in localStorage gespeichert – bleibt beim Neuladen erhalten

# Übersetzte Inhalte
✅ Navigation (Home, Products, Dashboard, Login, Cart)
✅ Hero-Bereich (Titel, Subtitle, CTA)
✅ Produkt-Filter (All, Electronics, Fashion, Home)
✅ Warenkorb (leer, Gesamt, Checkout)
✅ Checkout (Adressen, Zahlung, Bezahlen)
✅ Login/Register (alle Formularfelder)
✅ Dashboard (Sidebar, Statistiken, Bestellungen, Adressen)
✅ Bestellstatus (Pending, Processing, Shipped, Delivered, Cancelled)
✅ Footer (About, Links, Service, Contact)
✅ Toast-Meldungen (Erfolg, Fehler, Server)
✅ Länderauswahl (Deutschland, Österreich, Schweiz, USA, UK, FR, ES, IT)

## Sprachauswahl

# Jede Seite hat eine Flaggen-Auswahl in der Navigation:
- 🇬🇧 English (Default)
- 🇩🇪 Deutsch
- 🇫🇷 Français
- 🇪🇸 Español
- 🇮🇹 Italiano
# Sprache wird in localStorage gespeichert und bleibt erhalten