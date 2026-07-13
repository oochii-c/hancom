const Alert = ({type, text}) => {
    const map = {
        success : {icon: '🚀', color: 'green'},
        error: {icon: '😡', color: 'red'},
        caution: {icon: '🙌', color: 'yellow'}
    }
    const cfg = map[type]
    return <p style={{color:cfg.color}}>{cfg.icon} {text}</p>
}

export default Alert