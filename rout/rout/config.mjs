// 📂 Datei: rout/proxy.mjs
import { Router } from 'express'
import express from 'express'
import api from '../../res/api.mjs'

const app = Router()

export const get = function () {
	return app
}

app.use(express.json())

// Content Negotiation Middleware
app.use((req, res, next) => {
	const acceptHeader = req.headers.accept || ''

	// Wenn kein JSON gewünscht → überspringe diesen Router komplett
	if (!acceptHeader.includes('application/json')) {
		return next('router')
	}

	next()
})

// 👉 GET /config
app.get('/', (req, res) => {
	try {
		api.log.info('Laden der Server-Konfiguartion...')

		const result = api.env.getEnvVar()

		api.log.info('Server-Konfiguartion wurde geladen')
		api.log.debug('Konfiguration:', result)

		res.json(result)
	} catch (err) {
		api.log.error('❌ Fehler beim Laden der Server-Konfiguration:', err)
		res.status(500).json({
			error: 'Konfiguration konnte nicht geladen werden',
		})
	}
})

// 👉 POST /config
app.post('/', async (req, res) => {
	api.log.info('################################################')
	let mgsText = ''
	var result = {}

	try {
		const newConfig = req.body

		api.log.info('Neue Server-Konfiguartion...')
		api.log.debug('Neue Daten:', newConfig)

		if (!typeof newConfig === 'object') {
			mgsText = 'Erwartet wird ein Obejkt von Konfigurationseinträgen'
			api.log.info(mgsText)

			return res.status(400).json({ error: mgsText })
		}

		api.log.info('Speichern der neuen Server-Konfiguartion...')
		api.env.saveEnvFile(newConfig)

		mgsText = 'Server-Konfiguration wurde erfolgreich gespeichert'
		result = { message: mgsText }
		api.log.info(mgsText)

		res.json(result)
	} catch (err) {
		mgsText = '❌ Fehler beim Speichern der Proxy-Konfiguration:'
		api.log.error(mgsText, err)
		res.status(500).json({ error: mgsText })
	}
})
