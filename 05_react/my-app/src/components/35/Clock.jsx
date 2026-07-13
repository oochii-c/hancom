import { useState, useEffect } from "react";

const Clock = () => {
    const [time, setTime] = useState(new Date().toLocaleDateString())

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date().toLocaleDateString())
        }, 1000)
        return () => clearInterval(timer)
    })
    return <p>({"⏰" + "=>"}){time}</p>
}

export default Clock