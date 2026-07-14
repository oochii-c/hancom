const express = require("express")
const app = express()

const users = [
    {id: 1, name: "Kim"},
    {id: 2, name: "Lee"},
    {id: 3, name: "Park"}
]

app.get('/api/users/:id', (req, res) => {
    const user = users.find(u => u.id === Number(req.params.id))
    if(!user) return res.status(404).json({ error: '없는 유저'})
    res.json(user)
})

app.listen(3000, () => console.log("http://localhost:3000"))