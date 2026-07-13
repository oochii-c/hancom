import { useState, useEffect } from "react";

const Counter = () => {
    const [count, setCount] = useState(0)

    useEffect(() => {
        console.log("count바 뀜 : ", count)
    }, [count])
    return <button onClick={() => setCount(c => c + 1 )}>
        {count}
    </button>
}

export default Counter