// 📁 proxyConfig.mjs
import fs from 'fs'
import api from '../api.mjs'

export function load()
{
    const path = process.env.ERROR_ROUT_PATH

    api.log.info('Config:', path)
    api.log.info('Pfad der Error-Konfiguration:', path)

    if (!path || !fs.existsSync(path))
    {
        api.log.error('Konfigurationsdatei existiert nicht oder Pfad fehlt')
        throw new Error('Konfigurationsdatei existiert nicht oder Pfad fehlt')        
    }

    try 
    {
        const content = fs.readFileSync(path, 'utf-8')
        const json    = JSON.parse(content)

        api.log.info('Konfiguration erfolgreich geladen:')
        api.log.infoTable(json)

        return json
    }
    catch (error)
    {
        api.log.error('Fehler beim Laden der Error-Konfiguration:', error.message)
        process.exit(1)
    }
}

export function save(configArray)
{
    const path = process.env.PROXY_ROUT_PATH

    if (!path)
    {
        api.log.error('Pfad nicht definiert (process.env.PROXY_ROUT_PATH fehlt)')
        return false
    }

    try 
    {
        const json = JSON.stringify(configArray, null, 4)
        fs.writeFileSync(path, json, 'utf-8')

        api.log.info(`Error-Konfiguration gespeichert unter: ${path}`)
        return true
    }
    catch (error)
    {
        api.log.error('Fehler beim Speichern:', error.message)
        return false
    }
}

export function setCacheErrorConfig()
{
    process.errorConfig = load()
}

export function getCacheErrorConfig()
{
    return process.errorConfig
}