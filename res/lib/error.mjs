// 📁 proxyConfig.mjs
import fs from 'fs'
import path from 'path'
import api from '../api.mjs'

export function load() {
	const configPath = path.resolve(
		process.cwd(),
		process.env.ERROR_CONFIG_PATH || 'error.json'
	)

	api.log.info('Config:', configPath)
	api.log.info('Pfad der Error-Konfiguration:', configPath)

	if (!configPath || !fs.existsSync(configPath)) {
		api.log.error('Konfigurationsdatei existiert nicht oder Pfad fehlt')
		throw new Error('Konfigurationsdatei existiert nicht oder Pfad fehlt')
	}

	try {
		const content = fs.readFileSync(configPath, 'utf-8')
		const json = JSON.parse(content)

		api.log.info('Konfiguration erfolgreich geladen:')
		api.log.infoTable(json)

		return json
	} catch (error) {
		api.log.error(
			'Fehler beim Laden der Error-Konfiguration:',
			error.message
		)
		process.exit(1)
	}
}

export function save(configArray) {
	const configPath = path.resolve(
		process.cwd(),
		process.env.ERROR_CONFIG_PATH || 'error.json'
	)

	if (!configPath) {
		api.log.error(
			'Pfad nicht definiert (process.env.ERROR_CONFIG_PATH fehlt)'
		)
		return false
	}

	try {
		const json = JSON.stringify(configArray, null, 4)
		fs.writeFileSync(configPath, json, 'utf-8')

		api.log.info(`Error-Konfiguration gespeichert unter: ${configPath}`)
		return true
	} catch (error) {
		api.log.error('Fehler beim Speichern:', error.message)
		return false
	}
}

export function setCacheErrorConfig() {
	process.errorConfig = load()
}

export function getCacheErrorConfig() {
	return process.errorConfig
}
