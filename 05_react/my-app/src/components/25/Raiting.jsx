const Rating = ({score}) => {
    return (
        <div>
            {[...Array(5)].map((_, i) => (
                <span key={i}>{i < score ? "🍔" : "🥗"}</span>
            ))}
        </div>
    )
}

export default Rating