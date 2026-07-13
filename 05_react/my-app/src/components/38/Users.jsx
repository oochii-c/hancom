import { useState, useEffect } from "react";

const Users = () => {
    const [user, setUsers] = useState([])

    useEffect(() => {
        fetch('https://jsonplaceholder.typicode.com/users').
        then((res) => res.json()).then((data) => 
            setUsers(data)).catch((error) => 
                console.error("데이터 없음 :", error))
    return (
        <>
        <ul>
            {users.map((u) => ())}
            </ul></>
    )

})}

export default Users