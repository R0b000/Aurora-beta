import { useEffect, useState } from "react"
import { Outlet } from "react-router-dom"

const ProductViewLayout = () => {
    const [vw, setVw] = useState<number>(0)
    const [vh, setVh] = useState<number>(0)

    useEffect(() => {
        const setViewportWidth = () => {
            const vw = window.innerWidth;
            setVw(vw)
        }

        const setViewportHeight = () => {
            const vh = window.innerHeight;
            setVh(vh)
        }
        setViewportWidth()
        setViewportHeight()
    }, [])

    return (
        <>
            <div style={{ width: `${vw}px`, height: `${vh}px` }} className={`flex flex-col`}>
                <Outlet/>
            </div>
        </>
    )
}

export default ProductViewLayout