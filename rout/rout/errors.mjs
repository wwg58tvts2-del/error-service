// 📂 Datei: rout/rout/errors.mjs
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
	if (!acceptHeader.includes('application/json')) {
		return next('router')
	}
	next()
})

// 👉 GET / → Alle Fehler als Array [{code, text}]
app.get('/', (req, res) => {
	const errors = api.error.getCacheErrorConfig()
	const list = Object.entries(errors).map(([code, text]) => ({ code, text }))
	res.json(list)
})

// 👉 POST / → Neuen Fehler anlegen
app.post('/', (req, res) => {
	const { code, text } = req.body
	if (!code || !text) {
		return res.status(400).json({ error: 'code und text sind erforderlich' })
	}
	const errors = api.error.getCacheErrorConfig()
	if (errors[String(code)] !== undefined) {
		return res.status(409).json({ error: `Fehlercode ${code} existiert bereits` })
	}
	errors[String(code)] = text
	api.error.save(errors)
	api.error.setCacheErrorConfig()
	res.status(201).json({ code: String(code), text })
})

// 👉 PUT /:code → Fehler aktualisieren
app.put('/:code', (req, res) => {
	const { code } = req.params
	const { text, newCode } = req.body
	if (!text) {
		return res.status(400).json({ error: 'text ist erforderlich' })
	}
	const errors = api.error.getCacheErrorConfig()
	if (errors[code] === undefined) {
		return res.status(404).json({ error: `Fehlercode ${code} nicht gefunden` })
	}
	// Code umbenennen (alten löschen, neuen anlegen)
	if (newCode && newCode !== code) {
		delete errors[code]
		errors[String(newCode)] = text
	} else {
		errors[code] = text
	}
	api.error.save(errors)
	api.error.setCacheErrorConfig()
	res.json({ code: newCode || code, text })
})

// 👉 DELETE /:code → Fehler löschen
app.delete('/:code', (req, res) => {
	const { code } = req.params
	const errors = api.error.getCacheErrorConfig()
	if (errors[code] === undefined) {
		return res.status(404).json({ error: `Fehlercode ${code} nicht gefunden` })
	}
	delete errors[code]
	api.error.save(errors)
	api.error.setCacheErrorConfig()
	res.json({ success: true })
})
