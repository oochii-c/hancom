const express = require("express")
const cors = require("cors")
const app = express()

app.use(cors())
app.use(express.json())

const TOKEN = "HANCOM"

// 반별 수강생 데이터 (메모리 저장)
const classes = {
    "전욱진": [
        { id: 0, name: "김대진" },
        { id: 1, name: "강성원" },
        { id: 2, name: "강하영" },
        { id: 3, name: "김정아" },
        { id: 4, name: "김정현" },
        { id: 5, name: "김해냄" },
        { id: 6, name: "김효인" },
        { id: 7, name: "박진" },
        { id: 8, name: "안치호" },
        { id: 9, name: "양하은" },
        { id: 10, name: "유민성" },
        { id: 11, name: "이도연" },
        { id: 12, name: "이현우" },
        { id: 13, name: "임소정" },
        { id: 14, name: "전욱진" },
        { id: 15, name: "정기준" },
        { id: 16, name: "정선민" },
        { id: 17, name: "정유진" },
        { id: 18, name: "표후동" },
        { id: 19, name: "한유진" },
        { id: 20, name: "한윤지" },
    ],
}

function requireAuth(req, res, next) {
    if (req.headers.authorization !== TOKEN) {
        return res.status(401).json({ error: "인증 필요 (토큰: HANCOM)" })
    }
    next()
}

function loadClass(req, res, next) {
    const className = decodeURIComponent(req.params.className)
    if (!classes[className]) {
        classes[className] = []
    }
    req.className = className
    req.classUsers = classes[className]
    next()
}

app.get('/hancom/:className/users', requireAuth, loadClass, (req, res) => {
    res.json(req.classUsers)
})

app.post('/hancom/:className/users', requireAuth, loadClass, (req, res) => {
    const nextId = req.classUsers.length > 0
        ? Math.max(...req.classUsers.map(u => u.id)) + 1
        : 1
    const user = { id: nextId, name: req.body.name }
    req.classUsers.push(user)
    res.status(201).json(user)
})

app.put('/hancom/:className/users/:id', requireAuth, loadClass, (req, res) => {
    const id = Number(req.params.id)
    const user = req.classUsers.find(u => u.id === id)
    if (!user) {
        return res.status(404).json({ error: '사용자를 찾을 수 없음' })
    }
    if (req.body.name !== undefined) user.name = req.body.name
    if (req.body.id !== undefined) user.id = req.body.id
    res.json(user)
})

app.delete('/hancom/:className/users/:id', requireAuth, loadClass, (req, res) => {
    const id = Number(req.params.id)
    const index = req.classUsers.findIndex(u => u.id === id)
    if (index === -1) {
        return res.status(404).json({ error: '사용자를 찾을 수 없음' })
    }
    req.classUsers.splice(index, 1)
    res.json({ message: '삭제됨' })
})

app.get('/hancom/:className', requireAuth, loadClass, (req, res) => {
    const rows = req.classUsers
        .slice()
        .sort((a, b) => a.id - b.id)
        .map(u => `<tr><td>${u.id}</td><td>${u.name}</td></tr>`)
        .join('')

    res.send(`
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8">
            <title>${req.className} 수강생 명단</title>
            <style>
                body { font-family: sans-serif; padding: 24px; }
                table { border-collapse: collapse; width: 320px; }
                th, td { border: 1px solid #ccc; padding: 8px 12px; text-align: left; }
                th { background: #f5f5f5; }
            </style>
        </head>
        <body>
            <h1>${req.className} 수강생 명단 (${req.classUsers.length}명)</h1>
            <table>
                <thead><tr><th>ID</th><th>이름</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>
        </body>
        </html>
    `)
})

app.listen(5000, () => {
    console.log('hancom 서버 시작: http://localhost:5000')
})
