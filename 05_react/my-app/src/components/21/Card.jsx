const Card = ({title, desc, emoji}) => {
    return (
        <div>
            <span>{title}</span>
            <h3>{desc}</h3>
            <p>{emoji}</p>
        </div>
    )
}

export default Card