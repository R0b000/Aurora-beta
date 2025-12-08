import { useNavigate } from 'react-router-dom';

const PageNotFound = () => {
    const navigate = useNavigate(); 

    const handleGoHome = () => {
        navigate('/')
    };

    return (
        // Full screen container with a clean light background
        <div className="flex w-screen h-screen items-center justify-center bg-gray-50 text-gray-800">
            <div className="flex flex-col items-center justify-center p-8 text-center max-w-lg">
                
                {/* 404 Header - large and eye-catching */}
                <h1 className="text-9xl font-extrabold text-red-600 tracking-wider">
                    404
                </h1>
                
                {/* Divider/Separator */}
                <hr className="w-20 my-6 border-t-4 border-gray-300" />

                {/* Main Message */}
                <p className="text-3xl font-semibold mb-4">
                    Page Not Found
                </p>
                <p className="text-lg text-gray-600 mb-8">
                    Oops! It looks like you've followed a broken link or entered a URL that doesn't exist on our site.
                </p>

                {/* Back to Home Button */}
                <button
                    onClick={handleGoHome}
                    className="
                        px-6 py-3 
                        bg-black text-white 
                        font-medium text-lg 
                        rounded-lg 
                        shadow-lg 
                        hover:bg-gray-700 
                        transition duration-300 
                        focus:outline-none focus:ring-4 focus:ring-black focus:ring-opacity-50
                        cursor-pointer
                    "
                >
                    Go Back To Home
                </button>
            </div>
        </div>
    );
}

export default PageNotFound;