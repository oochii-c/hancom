import { useState } from "react";

const Counter = () => {
    const [count, setCount] = useState(0)
    return (
        <button onClick={() => setCount(c => c + 1)}>
            {count} 번 눌렀어요
        </button>
    )
}
export default Counter