require('dotenv').config() //환경변수 가져오기
const key = process.env.GROQ_API_KEY

const main = async () => {
  // 어디로 보낼지 (주소) — Groq는 OpenAI 호환 형식
  const groqRes = await fetch(
    'https://api.groq.com/openai/v1/chat/completions', {
        method: "POST",        
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + "" + key
        },
        body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [{role: "user", content: "groq이라는 회사는 어떤회사야?"}]
        })
    })
    const data = await groqRes.json()
    console.log(data.choices?.[0]?.message?.content || data)
}

main()