// 📂 Datei: oidc-service.mjs
import express from 'express'
import http from 'http'
import path from 'path'
import { fileURLToPath } from 'url'
import os from 'os'
import api from './res/api.mjs'
import rout from './rout/rout.mjs'

// 🔧 Dateipfade ermitteln
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

api.log.info('DEBUG __dirname:', __dirname)
api.log.info('DEBUG process.cwd():', process.cwd())

// Hilfsfunktion: Lokale IP-Adresse ermitteln
function getLocalIP() {
	const interfaces = os.networkInterfaces()
	for (const name of Object.keys(interfaces)) {
		for (const iface of interfaces[name]) {
			if (iface.family === 'IPv4' && !iface.internal) {
				return iface.address
			}
		}
	}
	return 'localhost'
}

console.clear()

// 📝 Standardwerte für ENV-Variablen setzen und als Default markieren
api.env.setEnvDefaults('SERVER_PORT', '8087')
api.env.setEnvDefaults('AUTH_JWT_SECRET', 'default-secret-change-in-production')
api.env.setEnvDefaults('APP_NAME', 'Default-Error')
api.env.setEnvDefaults('AUTH_ON', 'false')
api.env.setEnvDefaults('AUTH_URL', '/auth')
api.env.setEnvDefaults('ERROR_CONFIG_PATH', 'error.json')

// ENV laden
api.env.loadEnvFile(__dirname)

// .env Datei erstellen falls nicht vorhanden
const envPath = path.join(__dirname, '.env')
if (!api.env.fileExists(envPath)) {
	api.log.info('.env nicht gefunden, erstelle neue .env mit Defaults...')
	api.env.saveEnvFile(api.env.getEnvVar(), __dirname)
}

api.error.setCacheErrorConfig()

const app = express()
app.set('view engine', 'ejs')
app.set('views', ['views'])

app.use('/error', express.static('public'))

// � Redirect /error und /error/ → Vue Admin SPA
app.get(['/error', '/error/'], (req, res) => res.redirect('/error/app/'))

// �🖥️ Vue SPA Admin-Oberfläche
const vueDistPath = path.join(__dirname, 'dist')
app.use('/error/app', express.static(vueDistPath))

app.get(`/error/:code`, (req, res, next) => {
	// Diese Routen an nachfolgende Middleware weitergeben
	if (['config', 'app', 'errors', 'schema', 'env'].includes(req.params.code)) {
		return next()
	}

	const errorJson = api.error.getCacheErrorConfig()
	let code = req.params.code

	api.log.info('Fehlercode', code)
	api.log.infoTable(errorJson)

	let text = errorJson[code]

	if (!text) {
		code = 404
		text = errorJson[code]
	}

	// Content Negotiation: JSON oder HTML
	const acceptHeader = req.headers.accept || ''
	if (acceptHeader.includes('application/json')) {
		return res.status(Number(code) || 404).json({ code, text })
	}

	res.status(200).render('./error', { code, text })
})

// 🔐 Auth für OIDC
if (
	process.env?.AUTH_ON === 'true' &&
	process.env?.AUTH_JWT_SECRET &&
	process.env?.AUTH_URL
) {
	app.use(rout.auth.get())
}

app.use(`/error/config`, rout.config.get())
app.use(`/error/errors`, rout.errors.get())
app.get(`/error/env`, (req, res) => res.json(api.env.getEnvVar()))
app.get(`/error/schema`, (req, res) => res.sendFile(path.join(__dirname, 'env.schema.json')))

// SPA Fallback für /error/app/*
app.get(/^\/error\/app(\/.*)?$/, (req, res) => {
	res.sendFile(path.join(vueDistPath, 'index.html'))
})

// Fallback für nicht gefundene Routen → Fehlerseite 404
app.use((req, res) => {
	res.redirect('/error/404')
})

// 🚀 Server starten
const service = http.createServer(app)
service.listen(process.env?.SERVER_PORT, (err) => {
	if (err) {
		api.log.error('Server läuft: ❌')
		api.log.error('Fehler:', err)
		process.exit(1)
	}

	const localIP = getLocalIP()
	api.log.info('Server läuft: ✅')
	api.log.info('Server Port:', process.env?.SERVER_PORT)
	api.log.info('URL:', `http://localhost:${process.env?.SERVER_PORT}/error`)
	api.log.info('URL:', `http://${localIP}:${process.env?.SERVER_PORT}/error`)
})
