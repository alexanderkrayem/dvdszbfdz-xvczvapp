// src/components/common/CityChangePopover.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

const CityChangePopover = ({ onCitySelect, currentCityId, apiBaseUrl, onClose }) => {
    const [availableCities, setAvailableCities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCities = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`${apiBaseUrl}/api/cities`);
                const data = await response.json();
                setAvailableCities(data);
            } catch (err) {
                console.error("Failed to fetch cities for popover:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCities();
    }, [apiBaseUrl]);

    const handleSelect = (city) => {
        onCitySelect(city);
        onClose(); // Close the popover after selection
    };

    return (
        <>
            {/* Backdrop to close the popover when clicking outside */}
            <div onClick={onClose} className="fixed inset-0 z-30"></div>
            
            <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-40"
            >
                <div className="p-2">
                    <h3 className="px-3 py-2 text-sm font-semibold text-gray-500">اختر مدينتك</h3>
                    <div className="max-h-60 overflow-y-auto">
                        {isLoading ? (
                            <div className="p-3 text-sm text-gray-400">...جاري التحميل</div>
                        ) : (
                            availableCities.map(city => (
                                <button
                                    key={city.id}
                                    onClick={() => handleSelect(city)}
                                    className="w-full text-right flex items-center justify-between px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                                >
                                    <span>{city.name}</span>
                                    {currentCityId === city.id && (
                                        <Check className="h-4 w-4 text-blue-600" />
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </motion.div>
        </>
    );
};

export default CityChangePopover;