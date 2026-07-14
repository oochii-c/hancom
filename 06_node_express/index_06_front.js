const readline = require('readline')
const rl = readline.createInterface(
    {input: process.stdin, 
        output: process.stdout})

rl.question('메세지: ', (message) => {
    fetch('http://192.168.10.29:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'Application/json'},
        body: JSON.stringify({message })
    })
    .then(r => r.json())
    .then(console.log)
    .catch(() => console.log('서버 먼저 켜기(node index.js)'))
    .finally(() => rl.close())
})