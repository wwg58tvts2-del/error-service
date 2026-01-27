// 📂 Datei: oidc-service.mjs
import express from 'express'
import http    from 'http'
import api     from './res/api.mjs'
import rout    from './rout/rout.mjs'

console.clear()
api.env.load()

// 📝 Standardwerte für ENV-Variablen setzen (NACH api.env.load())
process.env.SERVER_PORT = process.env.SERVER_PORT || '8087'

api.error.setCacheErrorConfig()

const app = express()
const SERVER_PORT = parseInt(process.env.SERVER_PORT)

app.set('view engine', 'ejs')
app.set('views', ['views'])

app.use('/error', express.static("public"))

app.get(`/error/:code`, (req, res) => {
    const errorJson = api.error.getCacheErrorConfig()
    let code        = req.params.code

    api.log.info('Fehlercode', code)
    api.log.infoTable(errorJson)

    let text = errorJson[code]

    if(!text)
    {
        code = 404
        text = errorJson[code]
    }

    res.status(200).render('./error', {code, text})
})

// 🔐 Auth für OIDC
if(process.env?.AUTH_ON && process.env?.AUTH_JWT_SECRET && process.env?.AUTH_URL)
{
    app.use(rout.auth.get())
}

app.use(`/start/config`,  rout.config.get())

// 🚀 Server starten
const service = http.createServer(app)
service.listen(SERVER_PORT, (err) => {
    if (err) 
    {
        api.log.error('Server läuft: ❌')
        api.log.error('Fehler:', err)
        process.exit(1)
    }

    api.log.info('Server läuft: ✅')
    api.log.info('Server Port:', SERVER_PORT)
    api.log.info('URL:', `http://localhost:${SERVER_PORT}/error`)
})