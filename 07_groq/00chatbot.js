require('dotenv').config()

const express = require('express')
const cors = require('cors')
const app = express()

app.use(cors())
app.use(express.json())

app.post('/api/chat', async (req, res) => {
    const key = process.env.GROQ_API_KEY
    if (!key) return res.json({ reply: '(mock) ' + req.body.prompt})

    const groqRes = await fetch('http://api.groq.com/openai/v1/chat/completions',
        {
            method: 'POST',
            headers: { 'Content':}
        }
    )
})