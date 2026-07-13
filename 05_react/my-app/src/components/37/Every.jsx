import { useState, useEffect } from "react";


const Every = () => {
    const [count, setCount] = useState(0)

    useEffect(() => {
        setCount(c => c + 1)
        console.log("렌더링 될 때마다 실행")
    })
    return (
        <button onClick={() => setCount(c => c + 1)}>
        {count}
        </button>
    )
}

export default Every