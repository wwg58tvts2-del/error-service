// =============================================================
// ENV-Tools für error-service (User-Muster, mit Absätzen)
// =============================================================

import fs from 'fs'
import path from 'path'
import api from '../api.mjs'

const defaultEnvFile = []

// -------------------------------------------------------------
// ENV-Datei laden und in process.env schreiben
// -------------------------------------------------------------
export function loadEnvFile(filename = '.env') {
	const envPath = path.resolve(process.cwd(), filename)
	if (!fs.existsSync(envPath)) {
		api.log.info(`.env-Datei nicht gefunden: ${envPath}`)
		return
	}
	const lines = fs.readFileSync(envPath, 'utf-8').split(/\r?\n/)
	for (const line of lines) {
		const trimmed = line.trim()
		if (!trimmed || trimmed.startsWith('#')) continue
		const idx = trimmed.indexOf('=')
		if (idx === -1) continue
		const key = trimmed.slice(0, idx).trim()
		const value = trimmed
			.slice(idx + 1)
			.trim()
			.replace(/^['"]|['"]$/g, '')
		process.env[key] = value
	}
	api.log.info(`.env wurde geladen: ${envPath}`)
}

// -------------------------------------------------------------
// ENV-Datei speichern (Objekt -> Datei)
// -------------------------------------------------------------
export function saveEnvFile(config = {}, filename = '.env') {
	const envPath = path.resolve(process.cwd(), filename)
	if (typeof config !== 'object' || config === null) {
		throw new Error('config muss ein Objekt sein')
	}
	const dir = path.dirname(envPath)
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true })
	}
	const lines = []
	for (const key of Object.keys(config)) {
		let value = config[key]
		if (value === undefined || value === null) value = ''
		value = String(value)
		if (/[ \t\r\n"'=]/.test(value)) {
			value = `"${value.replace(/"/g, '\"')}"`
		}
		lines.push(`${key}=${value}`)
	}
	const content = lines.join('\n') + '\n'
	fs.writeFileSync(envPath, content, 'utf-8')
	api.log.info(`.env wurde gespeichert: ${envPath}`)
}

// -------------------------------------------------------------
// ENV-Variablen als Objekt zurückgeben
// -------------------------------------------------------------
// Gibt nur die als Default markierten ENV-Variablen als Objekt zurück
export function getEnvVar() {
	const result = {}
	for (const key of defaultEnvFile) {
		if (typeof process.env[key] !== 'undefined') {
			result[key] = process.env[key]
		}
	}
	return result
}

// -------------------------------------------------------------
// ENV-Variable auf Default setzen, falls nicht vorhanden
// -------------------------------------------------------------
export function setEnvVar(key, value) {
	if (typeof process.env[key] === 'undefined' || process.env[key] === '') {
		process.env[key] = value
	}
}

// -------------------------------------------------------------
// ENV-Variable auf Default setzen, falls nicht vorhanden
// -------------------------------------------------------------
export function setEnvDefaults(key) {
	defaultEnvFile.push(key)
}
