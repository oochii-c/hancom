const Avatar = ({name, online}) => {
    return (
    <>
    <p>
        <h1>{name}</h1>
        {online && <span>👌</span>}
    </p>
    </>
    )
}



export default Avatar