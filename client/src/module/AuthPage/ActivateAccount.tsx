import { Spin } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import authSvc from "../../service/auth.service";

const ActivateAccount = () => {
    const {id} = useParams();
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const navigate = useNavigate();

    const activateAccount = useCallback(async (id:string) => {
        try {
            await authSvc.activateAccount(id)
            navigate('/auth/login')
        } catch (error) {
            throw error
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        activateAccount(id!);
    }, [id])

    return (
        <>
            {isLoading && 
                <div className="flex w-full h-full items-center justify-center">
                    <div className="flex flex-col w-full h-full items-center justify-center gap-2">
                        <Spin/>
                        <h1 className="flex text-emerald-900">
                            Activating Account Please Wait <p className="animate-pulse">...</p>
                        </h1>
                    </div>
                </div>
            }
        </>
    )
}

export default ActivateAccount