import React, { useCallback, useEffect, useState } from "react";
import { FaTimes, FaSearch } from "react-icons/fa";
import { useAppContext } from "../context/AppContext";
import publicSvc from "../service/public.service";
import type { ListProductDetails } from "../module/HomePage/homepage.validation";
import { Empty, Input } from "antd";

const SearchModal = () => {
    const { searchClick, setSearchClick, searchValue, setSearchValue } = useAppContext();
    const [searchResults, setSearchResults] = useState<ListProductDetails[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchSearchResults = useCallback(async (title: string, signal?: AbortSignal) => {
        if (!title) {
            setSearchResults([]);
            setIsLoading(false);
            return;
        }
        try {
            setIsLoading(true);
            const response = await publicSvc.searchProduct(title, signal);
            setSearchResults(response.data.data || []);
        } catch (error) {
            if ((error as any)?.name === 'CanceledError') return;
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (searchValue) {
            const controller = new AbortController();
            const timer = setTimeout(() => {
                fetchSearchResults(searchValue, controller.signal);
            }, 300);
            return () => {
                clearTimeout(timer);
                controller.abort();
            };
        }
    }, [searchValue, fetchSearchResults]);

    if (!searchClick) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto mt-20">
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-2 flex-1">
                        <FaSearch className="text-gray-400" />
                        <Input
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            placeholder="Search products..."
                            className="border-none focus:ring-0"
                            autoFocus
                        />
                    </div>
                    <FaTimes 
                        onClick={() => {
                            setSearchClick(false);
                            setSearchValue('');
                        }} 
                        className="text-gray-500 cursor-pointer hover:text-gray-700 ml-4" 
                    />
                </div>
                
                {isLoading ? (
                    <div className="p-8 text-center">Loading...</div>
                ) : searchResults.length > 0 ? (
                    <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                        {searchResults.map((item) => (
                            <div 
                                key={item._id} 
                                className="border border-gray-200 rounded-lg p-2 cursor-pointer hover:border-blue-300"
                                onClick={() => {
                                    window.location.href = `/product/${item._id}`;
                                    setSearchClick(false);
                                    setSearchValue('');
                                }}
                            >
                                <img 
                                    src={item.images?.[0]?.secure_url || '/placeholder-product.png'} 
                                    alt={item.title}
                                    className="w-full h-24 object-cover rounded-md mb-2"
                                />
                                <p className="text-xs font-medium">{item.title}</p>
                                <p className="text-xs text-gray-600">${item.price}</p>
                            </div>
                        ))}
                    </div>
                ) : searchValue ? (
                    <div className="p-8">
                        <Empty description="No products found" />
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default SearchModal;