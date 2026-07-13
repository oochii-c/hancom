import { useState, useEffect } from "react";

const Weather = () => {
    const [temp, setTemp] = useState(null)
    const [isLoding, setIsLoding] = useState(true)

    useEffect(() => {
        fetch('https://api.open-meteo.com/v1/forecast?latitude=37.5&longitude=127&current_weather=true').
        then((res) => res.json()).
        then((data) => { setTemp(data.current_weather.temperature); 
            setIsLoding(false)}).
            catch((error) => {console.error("날씨는 네이버:", error); 
                setIsLoding(false)})
            },[]
        )
    return <p>
        서울 기온:
        {isLoding ? '불러오는 중.....' : (temp ? temp + 'C' :
        '불러올 수 없음')}
    </p>
}

export default Weather