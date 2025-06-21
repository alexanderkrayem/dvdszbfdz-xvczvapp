// src/components/cart/AddressModal.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const AddressModal = ({ show, onClose, formData, onFormChange, onFormSubmit, error, isSaving }) => {
    if (!show) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
            dir="rtl"
        >
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">تفاصيل التوصيل</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X className="h-6 w-6" /></button>
                </div>
                {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}
                <form onSubmit={onFormSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
                        <input type="text" name="fullName" id="fullName" required value={formData.fullName} onChange={onFormChange} className="w-full p-2 border border-gray-300 rounded-md"/>
                    </div>
                    <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                        <input type="tel" name="phoneNumber" id="phoneNumber" required value={formData.phoneNumber} onChange={onFormChange} className="w-full p-2 border border-gray-300 rounded-md"/>
                    </div>
                    <div>
                        <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 mb-1">العنوان (سطر ١)</label>
                        <input type="text" name="addressLine1" id="addressLine1" required value={formData.addressLine1} onChange={onFormChange} className="w-full p-2 border border-gray-300 rounded-md"/>
                    </div>
                    <div>
                        <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 mb-1">العنوان (سطر ٢) (اختياري)</label>
                        <input type="text" name="addressLine2" id="addressLine2" value={formData.addressLine2} onChange={onFormChange} className="w-full p-2 border border-gray-300 rounded-md"/>
                    </div>
                    <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">المدينة</label>
                        <input type="text" name="city" id="city" required value={formData.city} onChange={onFormChange} className="w-full p-2 border border-gray-300 rounded-md"/>
                    </div>
                    <button type="submit" disabled={isSaving} className="w-full bg-green-500 text-white py-2.5 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50">
                        {isSaving ? "جار الحفظ..." : "حفظ ومتابعة"}
                    </button>
                </form>
            </div>
        </motion.div>
    );
};

export default AddressModal;