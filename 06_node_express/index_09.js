const express = require("express")
const cors = require("cors")

const app = express()

app.use(cors())

app.use(express.json())

app.use((req, res, next) => {
    console.log(req.method, req.url)
    next()
})

app.get('/api/users', (req, res) => {
    res.json([{id: 1, name: "Rumble"}])
})

app.listen(3000, () => 
    console.log("http://localhost:5000/api/users"))