// src/components/MainPanel.jsx

import React, { useState } from 'react';
import { Clock, MapPin, Star, ShoppingCart, Search, X } from 'lucide-react'; // Import specific icons
import { motion, AnimatePresence } from 'framer-motion'; // Import framer-motion components

// Renamed component to follow standard naming conventions (PascalCase)
const MainPanel = () => {
    // Use standard useState hook
    const [activeSection, setActiveSection] = useState('exhibitions');
    const [selectedExpo, setSelectedExpo] = useState(null); // Keep these if you plan to use them later
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showCart, setShowCart] = useState(false);
    const [cart, setCart] = useState([]);

    // Sample data (remains the same)
    const deals = [
        {
            id: 1,
            title: "عرض خاص على معدات الأسنان",
            discount: "25%",
            endDate: "2025-05-01",
            supplier: "Medical Equipment Co.",
            image: "linear-gradient(to right, #F59E0B, #D97706)", // Using gradient as background style
        },
        {
            id: 2,
            title: "صفقة حصرية للمعرض",
            discount: "30%",
            endDate: "2025-05-03",
            supplier: "Dental Supplies Ltd",
            image: "linear-gradient(to right, #EC4899, #BE185D)",
        }
    ];

    const suppliers = [
        {
            id: 1,
            name: "شركة المعدات الطبية",
            category: "معدات طبية",
            location: "دبي",
            rating: 4.8,
            image: "linear-gradient(to right, #3B82F6, #1D4ED8)",
            description: "موزع رئيسي للمعدات الطبية وأدوات طب الأسنان",
            products: [1, 2, 3],
            contact: {
                phone: "+971 XX XXX XXXX",
                email: "info@medical-equipment.com",
                website: "www.medical-equipment.com"
            }
        },
        {
            id: 2,
            name: "مستلزمات طب الأسنان المتحدة",
            category: "مستلزمات طبية",
            location: "أبو ظبي",
            rating: 4.6,
            image: "linear-gradient(to right, #10B981, #059669)",
            description: "متخصصون في توريد أحدث مستلزمات طب الأسنان",
            products: [4, 5, 6],
            contact: {
                phone: "+971 XX XXX XXXX",
                email: "info@dental-supplies.com",
                website: "www.dental-supplies.com"
            }
        }
    ];

    const products = [
        {
            id: 1,
            name: "كرسي طب أسنان متطور",
            supplier: 1,
            price: 15000,
            discountPrice: 12750,
            category: "معدات",
            image: "linear-gradient(to right, #3B82F6, #1D4ED8)", // Background for product card
            description: "كرسي طب أسنان حديث مع جميع الملحقات",
            features: [
                "تحكم إلكتروني كامل",
                "إضاءة LED متطورة",
                "ضمان 3 سنوات"
            ],
            isOnSale: true
        },
        {
            id: 2,
            name: "جهاز تعقيم ديجيتال",
            supplier: 1,
            price: 8000,
            discountPrice: 6800,
            category: "معدات",
            image: "linear-gradient(to right, #10B981, #059669)", // Background for product card
            description: "جهاز تعقيم رقمي متطور",
            features: [
                "سعة كبيرة",
                "شاشة تحكم رقمية",
                "توفير الطاقة"
            ],
            isOnSale: true
        }
        // Add more sample products if needed
    ];

    const addToCart = (product) => {
        // Prevent adding if details are shown or if it's already processing
        if (selectedProduct) return;

        setCart(currentCart => {
            const existingItem = currentCart.find(item => item.id === product.id);
            if (existingItem) {
                // Increase quantity
                return currentCart.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                // Add new item
                return [...currentCart, { ...product, quantity: 1 }];
            }
        });
        // Optionally open the cart or give feedback
        // setShowCart(true);
        console.log(`${product.name} added to cart.`);
    };

    // Removed redundant render functions for sections, using direct JSX below

    const renderCart = () => (
        <motion.div
            key="cart-sidebar" // Added key for AnimatePresence
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }} // Smoother animation
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl z-50 flex flex-col" // Added flex-col
            dir="rtl" // Ensure direction is RTL for the cart itself
        >
            <div className="p-4 flex-shrink-0 border-b"> {/* Added border */}
                <div className="flex justify-between items-center mb-4"> {/* Reduced margin */}
                    <h2 className="text-xl font-bold">سلة التسوق</h2>
                    <button onClick={() => setShowCart(false)} className="text-gray-500 hover:text-gray-800">
                        <X className="h-6 w-6" /> {/* Use Icon */}
                    </button>
                </div>
            </div>

            {/* Cart Items - Scrollable */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4"> {/* Make this part scroll */}
                {cart.length === 0 ? (
                    <p className="text-center text-gray-500">سلة التسوق فارغة.</p>
                ) : (
                    cart.map(item => (
                        <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"> {/* Reduced padding */}
                            <div
                                className="h-16 w-16 rounded-lg flex-shrink-0 bg-gray-200" // Added flex-shrink-0
                                style={{ background: item.image || '#e5e7eb' }} // Fallback background
                            ></div>
                            <div className="flex-1 min-w-0"> {/* Added min-w-0 for text wrap */}
                                <h3 className="font-medium truncate">{item.name}</h3> {/* Added truncate */}
                                <div className="text-blue-600">{item.discountPrice || item.price} د.إ</div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0"> {/* Added flex-shrink-0 */}
                                <button className="p-1 bg-gray-200 rounded text-gray-700 hover:bg-gray-300">-</button>
                                <span className="w-6 text-center">{item.quantity}</span> {/* Fixed width */}
                                <button className="p-1 bg-gray-200 rounded text-gray-700 hover:bg-gray-300">+</button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
                 <div className="p-4 mt-auto border-t flex-shrink-0"> {/* Added border */}
                    <div className="flex justify-between items-center mb-4">
                        <span className="font-bold">المجموع:</span>
                        <span className="font-bold">
                            {cart.reduce((total, item) => total + (item.discountPrice || item.price) * item.quantity, 0)} د.إ
                        </span>
                    </div>
                    <button className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors">
                        إتمام الشراء
                    </button>
                </div>
            )}
        </motion.div>
    );

    return (
        // Main container div needs direction set for the overall layout
        <div className="min-h-screen bg-gray-50" dir="rtl">
            {/* Header */}
            <div className="bg-white sticky top-0 z-10 shadow-sm">
                <div className="p-4 max-w-4xl mx-auto"> {/* Added max-width and center */}
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-xl font-bold text-gray-800">معرض المستلزمات الطبية</h1>
                        <button
                            onClick={() => setShowCart(true)}
                            className="relative p-2 text-gray-600 hover:text-blue-600"
                        >
                            <ShoppingCart className="h-6 w-6" />
                            {cart.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                                    {cart.reduce((acc, item) => acc + item.quantity, 0)} {/* Show total quantity */}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative mb-4">
                        <input
                            type="text"
                            placeholder="ابحث عن منتجات أو موردين..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent" // Improved styling
                        />
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" /> {/* Changed to right for RTL */}
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex gap-2 border-b border-gray-200"> {/* Add border bottom */}
                        {['exhibitions', 'products', 'suppliers'].map(section => (
                            <button
                                key={section}
                                onClick={() => setActiveSection(section)}
                                className={`flex-1 py-3 text-center text-sm font-medium transition-colors duration-200 ${ // Adjusted padding/size
                                    activeSection === section
                                        ? 'border-b-2 border-blue-500 text-blue-600' // Active state style
                                        : 'text-gray-500 hover:text-gray-700' // Inactive state style
                                    }`}
                            >
                                {section === 'exhibitions' && 'العروض'}
                                {section === 'products' && 'المنتجات'}
                                {section === 'suppliers' && 'الموردون'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 max-w-4xl mx-auto"> {/* Added max-width and center */}
                {/* Deals Section */}
                {activeSection === 'exhibitions' && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">العروض المميزة</h2>
                        {deals.map(deal => (
                            <motion.div
                                key={deal.id}
                                className="bg-white rounded-xl shadow-md overflow-hidden" // Slightly reduced shadow
                                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                            >
                                <div
                                    className="h-36 w-full flex items-center justify-center text-white p-4" // Increased height
                                    style={{ background: deal.image }}
                                >
                                    <div className="text-center">
                                        <div className="text-3xl font-bold mb-1">خصم {deal.discount}</div>
                                        <div className="text-sm opacity-90">{deal.title}</div>
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50"> {/* Added subtle background */}
                                    <div className="flex items-center justify-between text-sm text-gray-600">
                                        <span>{deal.supplier}</span>
                                        <div className="flex items-center gap-1"> {/* Added gap */}
                                            <Clock className="h-4 w-4" />
                                            <span>ينتهي في {deal.endDate}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Products Section */}
                {activeSection === 'products' && (
                     <div className="space-y-4">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">المنتجات المعروضة</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4"> {/* Responsive grid */}
                            {products.map(product => (
                                <motion.div
                                    key={product.id}
                                    className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer flex flex-col" // Added flex-col
                                    whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }} // Lift effect
                                    onClick={() => setSelectedProduct(product)} // Placeholder for potential detail view
                                >
                                    <div
                                        className="h-32 w-full flex items-center justify-center text-white relative bg-gray-200" // Added relative and fallback bg
                                        style={{ background: product.image }}
                                    >
                                        {product.isOnSale && (
                                            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                                                تخفيض {/* Changed position to left for RTL */}
                                            </div>
                                        )}
                                        {/* Placeholder for actual image if available */}
                                    </div>
                                    <div className="p-3 flex flex-col flex-grow"> {/* Added flex-grow */}
                                        <h3 className="font-semibold text-sm mb-2 text-gray-800 flex-grow">{product.name}</h3> {/* Added flex-grow */}
                                        <div className="flex items-center justify-between mt-auto"> {/* Added mt-auto */}
                                            <div>
                                                {product.isOnSale && (
                                                    <span className="text-xs line-through text-gray-400 mr-1">
                                                        {product.price} د.إ
                                                    </span>
                                                )}
                                                <div className="text-blue-600 font-bold text-sm">
                                                    {product.discountPrice || product.price} د.إ
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Prevent card click when clicking button
                                                    addToCart(product);
                                                }}
                                                className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-500 hover:text-white transition-colors" // Improved styling
                                                aria-label={`Add ${product.name} to cart`} // Accessibility
                                            >
                                                <ShoppingCart className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Suppliers Section */}
                {activeSection === 'suppliers' && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">الموردون المشاركون</h2>
                        {suppliers.map(supplier => (
                             <motion.div
                                key={supplier.id}
                                className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer"
                                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                                onClick={() => setSelectedSupplier(supplier)} // Placeholder for potential detail view
                            >
                                <div
                                    className="h-24 w-full flex items-center justify-center text-white"
                                    style={{ background: supplier.image }}
                                >
                                    <h3 className="text-lg font-bold">{supplier.name}</h3>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-center justify-between mb-2 text-sm">
                                        <span className="text-gray-600">{supplier.category}</span>
                                        <div className="flex items-center gap-1">
                                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                            <span>{supplier.rating}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600 gap-1">
                                        <MapPin className="h-4 w-4" />
                                        <span>{supplier.location}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Cart Sidebar */}
            {/* AnimatePresence allows the exit animation */}
            <AnimatePresence>
                {showCart && renderCart()}
            </AnimatePresence>

             {/* TODO: Add Modals for Product Details / Supplier Details later if needed */}

        </div>
    );
};

export default MainPanel; // Use standard export default