import fs   from 'fs'
import path from 'path'

import api from '../api.mjs'

export function load(filename = '.env', override = true)
{
    const envVars = getEnvVar(filename)

    for (const key of Object.keys(envVars))
    {
        const value = envVars[key]

        if (override || !(key in process.env))
        {
            process.env[key] = value
        }
    }

    api.log.debug(`.env wurde manuell geladen aus`)
    api.log.debug(`override= ist ${override})`)

}

export function getEnvVar(filename = '.env')
{
    const envPath = path.resolve(process.cwd(), filename)
    const result  = {}

    if (!fs.existsSync(envPath))
    {
        api.log.info(`.env-Datei nicht gefunden: ${envPath}`)
        return
    }

    const content = fs.readFileSync(envPath, 'utf-8')
    const lines   = content.split(/\r?\n/)

    for (const line of lines)
    {
        const trimmed = line.trim()

        // Leere Zeilen oder Kommentare überspringen
        if (trimmed === '' || trimmed.startsWith('#'))
        {
            continue
        }

        const [key, ...rest] = trimmed.split('=')
        if (!key) continue

        const value = rest.join('=').trim().replace(/^['"]|['"]$/g, '')

        result[key] = value
    }

    api.log.debug(`.env manuell geladen aus: ${envPath}`)
    return result
}

export function save(config = {}, filename = '.env')
{
    const envPath = path.resolve(process.cwd(), filename)

    if (typeof config !== 'object' || config === null)
    {
        throw new Error('config muss ein Objekt sein')
    }

    const lines = []

    for (const key of Object.keys(config))
    {
        let value = config[key]

        if (value === undefined || value === null)
        {
            value = ''
        }

        value = String(value)

    // Werte mit Leerzeichen oder Sonderzeichen quoten
    if (new RegExp("[ \\t\\r\\n\"'=]").test(value))
    {
        value = `"${value.replace(/"/g, '\\"')}"`
    }

        lines.push(`${key}="${value}"`)
    }

    const content = lines.join('\n') + '\n'

    fs.writeFileSync(envPath, content, 'utf-8')

}