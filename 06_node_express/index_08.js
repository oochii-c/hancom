const express = require("express")
const app = express()

let users = [
    {id: 1, name: "Messi"},
    {id: 2, name: "Bellingham"},
    {id: 3, name: "Haaland"}
]

app.delete('/api/users/:id', (req, res) => {
    users = users.filter(u => u.id !== Number(req.params.id))
    res.json({ok: true, 남은: users}) 
})

app.listen(3000, async () => {
    const res = await fetch("http://localhost:3000/api/users/2", {
        method: "DELETE"
    })
    console.log(await res.json())
})