// src/components/modals/ProductDetailModal.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { X, ShoppingCart, Heart } from 'lucide-react';

const ProductDetailModal = ({ show, onClose, product, isLoading, error, onAddToCart, onToggleFavorite, isFavorite }) => {
    if (!show) return null;

    return (
        <motion.div
            key="productDetailModal"
            initial={{ y: "100vh" }}
            animate={{ y: 0 }}
            exit={{ y: "100vh" }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className="fixed inset-0 bg-gray-50 z-50 flex flex-col overflow-y-auto"
            dir="rtl"
        >
            <div className="sticky top-0 bg-white p-4 shadow-md z-10 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 truncate">{isLoading ? "جاري التحميل..." : (product ? product.name : "تفاصيل المنتج")}</h2>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-2 rounded-full"><X className="h-6 w-6" /></button>
            </div>
            <div className="flex-grow p-4 md:p-6">
                {isLoading && <div className="flex justify-center items-center h-full"><p>جاري تحميل التفاصيل...</p></div>}
                {error && <div className="text-center py-10"><p className="text-red-500 font-semibold text-lg">خطأ!</p><p className="text-gray-600 mt-2">{error}</p></div>}
                {!isLoading && !error && product && (
                    <div className="space-y-6">
                        <div className="w-full h-64 sm:h-80 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden shadow bg-cover bg-center" style={{ backgroundImage: `url(${product.image_url})` }}></div>
                        <div className="space-y-3">
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{product.name}</h1>
                            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                                {product.is_on_sale && product.discount_price && <p className="text-xl text-gray-500 line-through">{parseFloat(product.effective_selling_price).toFixed(2)} د.إ</p>}
                                <p className="text-4xl font-extrabold text-blue-600">{parseFloat(product.is_on_sale ? product.discount_price : product.effective_selling_price).toFixed(2)} د.إ</p>
                            </div>
                        </div>
                        {product.description && (
                            <div className="border-t pt-4">
                                <h4 className="text-lg font-semibold text-gray-700 mb-2">الوصف:</h4>
                                <p className="text-gray-700 leading-relaxed">{product.description}</p>
                            </div>
                        )}
                        <div className="pt-6 border-t flex items-center gap-3">
                            <button onClick={() => onAddToCart(product)} disabled={product.stock_level === 0} className="flex-grow bg-blue-500 text-white py-3.5 px-6 rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2 text-lg">
                                <ShoppingCart className="h-5 w-5" /> إضافة للسلة
                            </button>
                            <button onClick={() => onToggleFavorite(product.id)} className="p-3.5 border border-gray-300 rounded-lg text-gray-600 hover:border-red-500 hover:text-red-500">
                                <Heart className={`h-6 w-6 ${isFavorite ? 'text-red-500 fill-red-500' : ''}`} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default ProductDetailModal;