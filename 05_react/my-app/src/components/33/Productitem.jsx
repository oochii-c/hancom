import { useState} from "react";

const ProductItem = ({name}) => {
    const [count, setCount] =useState(0)
    return (
        <div>
            <div clasName="product">
                <h3>{name}</h3>
                <p>{count}개 담음</p>
            </div>
            <button onClick={() => setCount (c => c + 1)}>Product 담기</button>
        </div>
    )
} 

export default ProductItem