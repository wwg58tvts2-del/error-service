// 📂 Datei: oidc-service.mjs
import express from 'express'
import http from 'http'
import path from 'path'
import api from './res/api.mjs'
import rout from './rout/rout.mjs'

console.clear()
// ENV laden
api.env.loadEnvFile()

// 📝 Standardwerte für ENV-Variablen setzen und als Default markieren
api.env.setEnvVar('SERVER_PORT', '8087')
api.env.setEnvDefaults('SERVER_PORT')

api.env.setEnvVar('APP_NAME', 'Default-Error')
api.env.setEnvDefaults('APP_NAME')

api.env.setEnvVar('ERROR_CONFIG_PATH', 'error.json')
api.env.setEnvDefaults('ERROR_CONFIG_PATH')

// .env Datei erstellen falls nicht vorhanden
const envPath = path.join(process.cwd(), '.env')
if (!api.env.fileExists(envPath)) {
	api.log.info('.env nicht gefunden, erstelle neue .env mit Defaults...')
	api.env.saveEnvFile(api.env.getEnvVar())
}

api.error.setCacheErrorConfig()

const app = express()
app.set('view engine', 'ejs')
app.set('views', ['views'])

app.use('/error', express.static('public'))

app.get(`/error/:code`, (req, res, next) => {
	// Wenn die Route /error/config ist, an die nächste Middleware weitergeben
	if (req.params.code === 'config') {
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

	api.log.info('Server läuft: ✅')
	api.log.info('Server Port:', process.env?.SERVER_PORT)
	api.log.info('URL:', `http://localhost:${process.env?.SERVER_PORT}/error`)
})
