import React, { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react"
import authSvc from "../service/auth.service"

export interface authContextProps {
    _id: string,
    name: string,
    email: string,
    role: string,
    phone: string,
    isVerified: boolean,
    isBan: boolean,
    avatar: {
        public_id: string,
        secure_url: string,
        optimizedUrl: string
    },
    sellerProfile: {
        companyName: string,
        gstNumber: string,
        bio: string,
        address: string,
        rating: number,
        totalReviews: number
    },
    addresses: {
        label: string,
        fullName: string,
        phone: number,
        line1: string,
        line2: string,
        city: string,
        state: string,
        postalCode: string,
        country: string,
        isDefault: string
    }[],
    favourites: [string]
}

interface AppContextType {
    searchClick: boolean,
    setSearchClick: React.Dispatch<React.SetStateAction<boolean>>
    antdSearchClick: boolean,
    setAntdSearchClick: React.Dispatch<React.SetStateAction<boolean>>
    searchValue: string,
    setSearchValue: React.Dispatch<React.SetStateAction<string>>
    loginClick: boolean,
    setLoginClick: React.Dispatch<React.SetStateAction<boolean>>
    menuClick: boolean,
    setMenuClick: React.Dispatch<React.SetStateAction<boolean>>
    bannerAddClick: boolean,
    setBannerAddClick: React.Dispatch<React.SetStateAction<boolean>>
    loggedInUser: authContextProps | null,
    setLoggedInUser: React.Dispatch<React.SetStateAction<authContextProps | null>>
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [searchClick, setSearchClick] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [antdSearchClick, setAntdSearchClick] = useState(false);
    const [loginClick, setLoginClick] = useState(true);
    const [menuClick, setMenuClick] = useState(false);
    const [loggedInUser, setLoggedInUser] = useState<authContextProps | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [bannerAddClick, setBannerAddClick] = useState<boolean>(false);

    const fetchUser = useCallback( async () => {
        let token = localStorage.getItem('actualToken')

        try {
            if (token) {
                let response = await authSvc.getMyProfile();
                setLoggedInUser(response);
            }
        } catch (error) {
            console.log(error)
            throw error
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchUser();
    }, [localStorage.getItem('actualToken'), fetchUser])

    return (
        <>
            {!isLoading &&
                <AppContext.Provider value={{
                    searchClick, setSearchClick,
                    searchValue, setSearchValue,
                    antdSearchClick, setAntdSearchClick,
                    loginClick, setLoginClick,
                    menuClick, setMenuClick,
                    loggedInUser, setLoggedInUser,
                    bannerAddClick, setBannerAddClick
                }}>
                    {children}
                </AppContext.Provider>
            }
        </>
    )
}

export const useAppContext = () => {
    const context = useContext(AppContext);

    if (!context) throw new Error("UserSearch must be used inside AppProvider");
    return context
}