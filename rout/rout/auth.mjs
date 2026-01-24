// 📂 Datei: rout/folders-above.mjs
import { Router } from 'express'
import cookieParser from "cookie-parser"
import jwt      from "jsonwebtoken"

import api from '../../res/api.mjs';

const app = Router()

export function get(){
    return app
}

app.use(cookieParser())
app.use(async (req, res, next) => {
    const AUTH_JWT_SECRET  = process.env.AUTH_JWT_SECRET
    const AUTH_URL         = process.env.AUTH_URL
    const token = req.cookies.token

    if (!token) 
    {
        api.log.info('⚠️ Kein Token gefunden – redirect...')
        return res.redirect(`${AUTH_URL}`)
    }

    try 
    {
        const decoded = jwt.verify(token, AUTH_JWT_SECRET)
        req.user = decoded
        next()
    } 
    catch (err) 
    {
        api.log.error('❌ Token ungültig:', err.message)
        res.redirect(`${AUTH_URL}?returnTo=${req.originalUrl}`)
    }
})