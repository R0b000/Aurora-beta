import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useAppContext } from "../../../context/AppContext";

const HomePageLayout = () => {
    const [_vh, setVh] = useState<Number>(0)
    const [_vw, setVw] = useState<Number>(0)
    const { menuClick } = useAppContext()
    const [isLoading, setIsLoading] = useState(true)

    function setViewportHeight() {
        setVh(window.innerHeight);
    }

    function setViewportWidth() {
        setVw(window.innerWidth)
    }

    useEffect(() => {
        setViewportHeight();
        setViewportWidth();
        setIsLoading(false)
    }, [])

    return (
        <>
            {!isLoading &&
                <div className={`flex flex-col items-center justify-center w-full h-full overflow-x-clip ${menuClick && ""}`}>
                    <Outlet/>
                </div>
            }
        </>
    )
}

export default HomePageLayout