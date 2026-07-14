const express = require("express") //express 모듈 꺼내기
const app = express() //서버 생성

app.get('/api/users', (req, res) => {
    res.json([
        {id: 1, name: "Kim"},
        {id: 2, name: "Lee"},
        {id: 3, name: "Park"}
    ])
})

//문 열기
app.listen(3000, () => console.log("http://localhost:3000"))