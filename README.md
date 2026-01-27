# Error-Service

Zentraler HTTP-Fehlerseiten-Service mit konfigurierbaren Fehlermeldungen und EJS-Templates.

## 📋 Beschreibung

Der Error-Service bietet einheitliche, stylische Fehlerseiten für alle Makro-Services. Fehlercodes und -texte werden zentral in `error.json` verwaltet und über EJS-Templates gerendert.

## ✨ Features

- 🎨 **Custom Error-Pages**: Designte Fehlerseiten statt Browser-Defaults
- 📝 **JSON-basiert**: Fehlertexte in `error.json` konfigurierbar
- 🔄 **Cache-System**: Error-Config wird beim Start geladen
- 🖥️ **EJS-Templates**: Flexible Template-Engine für HTML
- 🌐 **Fallback**: 404 bei unbekannten Fehlercodes
- 🎯 **Universal**: Nutzbar von allen Services via Redirect

## 🚀 Installation

```bash
npm install
```

## ⚙️ Konfiguration

Erstelle eine `.env` Datei oder nutze die Standardwerte:

```env
# Server
SERVER_PORT="8087"

# Authentication (optional)
AUTH_ON="false"
AUTH_JWT_SECRET="dein_geheimer_schlüssel"
AUTH_URL="http://localhost:8083/auth"
```

### Error-Konfiguration

Bearbeite `error.json` für eigene Fehlermeldungen:

```json
{
  "401": "Login fehlgeschlagen",
  "403": "Zugriff verweigert",
  "404": "Diese Seite ist derzeit nicht erreichbar",
  "500": "Interner Serverfehler",
  "503": "Service vorübergehend nicht verfügbar"
}
```

## 🎯 Verwendung

```bash
# Development
node service.mjs

# Mit PM2
pm2 start service.mjs --name error-service
```

## 📡 API-Endpoints

### Error-Pages

#### `GET /error/:code`
Zeige Fehlerseite für HTTP-Code

**Parameter:**
- `code` - HTTP-Fehlercode (z.B. 404, 500, 401)

**Beispiele:**
- `http://localhost:8087/error/404`
- `http://localhost:8087/error/500`
- `http://localhost:8087/error/401`

**Fallback:**
Unbekannte Codes werden als 404 behandelt.

---

### Config-Management

#### `GET /start/config`
Hole aktuelle Error-Konfiguration

**Response:**
```json
{
  "401": "Login fehlgeschlagen",
  "404": "Diese Seite ist derzeit nicht erreichbar"
}
```

#### `POST /start/config`
Aktualisiere Error-Konfiguration

**Body:**
```json
{
  "500": "Etwas ist schiefgelaufen",
  "503": "Wartungsarbeiten"
}
```

## 🎨 Integration in andere Services

### Redirect bei Fehlern

```javascript
// In deinem Service
app.use((err, req, res, next) => {
  res.redirect(`http://localhost:8087/error/${err.status || 500}`)
})

// Oder bei spezifischen Fehlern
if (!authorized) {
  return res.redirect('http://localhost:8087/error/401')
}
```

### HTTP-Gateway Integration

Im `http-gateway` kann der Error-Service als Fallback konfiguriert werden:

```json
{
  "errorService": "http://localhost:8087/error"
}
```

## 📁 Projektstruktur

```
error-service/
├── service.mjs          # Hauptserver
├── error.json           # Error-Code Definitionen
├── views/
│   └── error.ejs       # EJS-Template für Fehlerseiten
├── public/             # Statische Assets (CSS, Bilder)
│   ├── style.css
│   └── logo.png
├── res/
│   ├── api.mjs         # API-Wrapper
│   └── lib/
│       ├── env.mjs     # ENV-Management
│       ├── log.mjs     # Logging
│       └── error.mjs   # Error-Cache-Logik
└── rout/
    ├── rout.mjs        # Route-Export
    └── rout/
        ├── auth.mjs    # Auth-Middleware
        └── config.mjs  # Config-Routes
```

## 🎨 Template-Anpassung

Die Fehlerseite nutzt EJS. Bearbeite `views/error.ejs`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Fehler <%= code %></title>
    <link rel="stylesheet" href="/error/style.css">
</head>
<body>
    <div class="error-container">
        <h1>Fehler <%= code %></h1>
        <p><%= text %></p>
        <a href="/">Zurück zur Startseite</a>
    </div>
</body>
</html>
```

**Verfügbare Variablen:**
- `code` - HTTP-Fehlercode (Number)
- `text` - Fehlertext aus error.json (String)

## 🔧 Cache-System

Beim Start wird `error.json` in den Cache geladen:

```javascript
// Bei Service-Start
api.error.setCacheErrorConfig()

// Abrufen im Handler
const errorJson = api.error.getCacheErrorConfig()
const text = errorJson[code]
```

**Vorteil**: Keine Disk-I/O bei jedem Request.

## 🛠️ Development

```bash
# Dev-Branch
git checkout dev

# Service starten
node service.mjs

# Fehlerseiten testen
curl http://localhost:8087/error/404
curl http://localhost:8087/error/500
```

### Deployment
```bash
git checkout main
git merge dev
git push origin main  # Auto-Deploy via Webhook
```

## ⚠️ Best Practices

- **Keine sensiblen Infos**: Fehlertexte sollten generisch bleiben
- **User-friendly**: Klare Anweisungen statt technischer Details
- **Konsistent**: Einheitliches Design über alle Codes
- **Logging**: Original-Fehler serverseitig loggen, User nur generische Meldung zeigen
- **HTTP-Codes**: Immer passende Status-Codes verwenden (401, 403, 404, 500, etc.)

## 📝 Lizenz

ISC
