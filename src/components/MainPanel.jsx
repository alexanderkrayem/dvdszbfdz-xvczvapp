// src/components/MainPanel.jsx

import React, { useState, useEffect } from 'react'; // Ensure useEffect is imported
import { Clock, MapPin, Star, ShoppingCart, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MainPanel = () => {
    const [activeSection, setActiveSection] = useState('exhibitions');
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showCart, setShowCart] = useState(false);
    const [cart, setCart] = useState([]);

    // --- State for fetched product data ---
    const [fetchedProducts, setFetchedProducts] = useState([]); // To store products from API
    const [isLoadingProducts, setIsLoadingProducts] = useState(true); // Track loading state
    const [productError, setProductError] = useState(null); // Track fetching errors
   // --- NEW: State for suppliers ---
    const [fetchedSuppliers, setFetchedSuppliers] = useState([]);
    const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(true);
    const [supplierError, setSupplierError] = useState(null);

    // --- Keep sample data for deals and suppliers for now ---
    const deals = [
        {
            id: 1,
            title: "عرض خاص على معدات الأسنان",
            discount: "25%",
            endDate: "2025-05-01",
            supplier: "Medical Equipment Co.",
            image: "linear-gradient(to right, #F59E0B, #D97706)",
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

    // --- NEW: useEffect to fetch suppliers ---
useEffect(() => {
    const fetchSuppliers = async () => {
        setIsLoadingSuppliers(true);
        setSupplierError(null);
        try {
            const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/suppliers`;
            console.log("Fetching suppliers from:", apiUrl);
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setFetchedSuppliers(data);
        } catch (error) {
            console.error("Failed to fetch suppliers:", error);
            setSupplierError(error.message);
        } finally {
            setIsLoadingSuppliers(false);
        }
    };

    fetchSuppliers();
}, []); // Empty dependency array, runs once on mount

    // --- Removed the hardcoded 'products' array ---

    // --- useEffect to fetch products from the backend ---
    useEffect(() => {
        const fetchProducts = async () => {
          setIsLoadingProducts(true);
          setProductError(null);
          try {
              // Ensure your backend server (telegram-app-backend) is running on localhost:3001
              const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
              const apiUrl = `${apiBaseUrl}/api/products`;
              console.log("Attempting to fetch products from:", apiUrl);
              const response = await fetch(apiUrl);
              
              if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
              }
              const data = await response.json();
              setFetchedProducts(data); // Update state with fetched products
          } catch (error) {
              console.error("Failed to fetch products:", error);
              setProductError(error.message); // Set error state
          } finally {
              setIsLoadingProducts(false); // Set loading false when done
          }
        };
        fetchProducts(); // Run the fetch function
    }, []); // Empty array means run once on component mount


    const addToCart = (product) => {
        if (selectedProduct) return;
        setCart(currentCart => {
            const existingItem = currentCart.find(item => item.id === product.id);
            if (existingItem) {
                return currentCart.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                return [...currentCart, { ...product, quantity: 1 }];
            }
        });
        console.log(`${product.name} added to cart.`);
    };

    // --- renderCart function remains the same ---
    const renderCart = () => (
        <motion.div
            key="cart-sidebar"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
            dir="rtl"
        >
            <div className="p-4 flex-shrink-0 border-b">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">سلة التسوق</h2>
                    <button onClick={() => setShowCart(false)} className="text-gray-500 hover:text-gray-800">
                        <X className="h-6 w-6" />
                    </button>
                </div>
            </div>
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {cart.length === 0 ? (
                    <p className="text-center text-gray-500">سلة التسوق فارغة.</p>
                ) : (
                    cart.map(item => (
                        <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                            <div
                                className="h-16 w-16 rounded-lg flex-shrink-0 bg-gray-200"
                                // Use image_url from cart item (might be different if cart item structure changes)
                                style={{ background: item.image_url || '#e5e7eb' }}
                            ></div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-medium truncate">{item.name}</h3>
                                <div className="text-blue-600">{item.discount_price || item.price} د.إ</div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button className="p-1 bg-gray-200 rounded text-gray-700 hover:bg-gray-300">-</button>
                                <span className="w-6 text-center">{item.quantity}</span>
                                <button className="p-1 bg-gray-200 rounded text-gray-700 hover:bg-gray-300">+</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
            {cart.length > 0 && (
                 <div className="p-4 mt-auto border-t flex-shrink-0">
                    <div className="flex justify-between items-center mb-4">
                        <span className="font-bold">المجموع:</span>
                        <span className="font-bold">
                            {cart.reduce((total, item) => total + (parseFloat(item.discount_price) || parseFloat(item.price)) * item.quantity, 0).toFixed(2)} د.إ {/* Added parseFloat and toFixed */}
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
        <div className="min-h-screen bg-gray-50" dir="rtl">
            {/* Header */}
            <div className="bg-white sticky top-0 z-10 shadow-sm">
                <div className="p-4 max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-xl font-bold text-gray-800">معرض المستلزمات الطبية</h1>
                        <button
                            onClick={() => setShowCart(true)}
                            className="relative p-2 text-gray-600 hover:text-blue-600"
                        >
                            <ShoppingCart className="h-6 w-6" />
                            {cart.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                                    {cart.reduce((acc, item) => acc + item.quantity, 0)}
                                </span>
                            )}
                        </button>
                    </div>
                    <div className="relative mb-4">
                        <input
                            type="text"
                            placeholder="ابحث عن منتجات أو موردين..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                        />
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                    <div className="flex gap-2 border-b border-gray-200">
                        {['exhibitions', 'products', 'suppliers'].map(section => (
                            <button
                                key={section}
                                onClick={() => setActiveSection(section)}
                                className={`flex-1 py-3 text-center text-sm font-medium transition-colors duration-200 ${
                                    activeSection === section
                                        ? 'border-b-2 border-blue-500 text-blue-600'
                                        : 'text-gray-500 hover:text-gray-700'
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
            <div className="p-4 max-w-4xl mx-auto">
                {/* Deals Section (Still uses sample data) */}
                {activeSection === 'exhibitions' && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">العروض المميزة</h2>
                        {deals.map(deal => (
                           <motion.div
                                key={deal.id}
                                className="bg-white rounded-xl shadow-md overflow-hidden"
                                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                            >
                                <div
                                    className="h-36 w-full flex items-center justify-center text-white p-4"
                                    style={{ background: deal.image }}
                                >
                                    <div className="text-center">
                                        <div className="text-3xl font-bold mb-1">خصم {deal.discount}</div>
                                        <div className="text-sm opacity-90">{deal.title}</div>
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50">
                                    <div className="flex items-center justify-between text-sm text-gray-600">
                                        <span>{deal.supplier}</span>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            <span>ينتهي في {deal.endDate}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* --- UPDATED Products Section --- */}
                {activeSection === 'products' && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">المنتجات المعروضة</h2>

                        {/* Loading State */}
                        {isLoadingProducts && <p className="text-center text-gray-500 py-10">جار تحميل المنتجات...</p>}

                        {/* Error State */}
                        {productError && <p className="text-center text-red-500 py-10">خطأ في تحميل المنتجات: {productError}</p>}

                        {/* Success State - Grid of Products */}
                        {!isLoadingProducts && !productError && fetchedProducts.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {fetchedProducts.map(product => (
                                    <motion.div
                                        key={product.id} // Use ID from fetched data
                                        className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer flex flex-col"
                                        whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
                                        onClick={() => setSelectedProduct(product)}
                                    >
                                        <div
                                            className="h-32 w-full flex items-center justify-center text-white relative bg-gray-200"
                                            // Use image_url from fetched data, fallback to gray background
                                            style={{ background: product.image_url?.includes('gradient') ? product.image_url : '#e5e7eb', backgroundImage: product.image_url && !product.image_url.includes('gradient') ? `url(${product.image_url})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}
                                        >
                                            {/* Placeholder div in case image_url is just a gradient */}
                                            {!product.image_url?.includes('gradient') && !product.image_url && <div className="h-full w-full bg-gray-200"></div>}

                                            {product.is_on_sale && (
                                                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                                                    تخفيض
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-3 flex flex-col flex-grow">
                                            <h3 className="font-semibold text-sm mb-2 text-gray-800 flex-grow">{product.name}</h3>
                                            <div className="flex items-center justify-between mt-auto">
                                                <div>
                                                    {product.is_on_sale && product.discount_price && (
                                                        <span className="text-xs line-through text-gray-400 mr-1">
                                                            {parseFloat(product.price).toFixed(2)} د.إ {/* Ensure formatting */}
                                                        </span>
                                                    )}
                                                    <div className="text-blue-600 font-bold text-sm">
                                                         {/* Use parseFloat and toFixed for price display */}
                                                        {(product.is_on_sale && product.discount_price ? parseFloat(product.discount_price) : parseFloat(product.price)).toFixed(2)} د.إ
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        addToCart(product); // Product object now comes from fetched data
                                                    }}
                                                    className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-500 hover:text-white transition-colors"
                                                    aria-label={`Add ${product.name} to cart`}
                                                >
                                                    <ShoppingCart className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* No Products Found State */}
                         {!isLoadingProducts && !productError && fetchedProducts.length === 0 && (
                            <p className="text-center text-gray-500 py-10">لا توجد منتجات لعرضها حالياً.</p>
                         )}
                    </div>
                )}


                {/* Suppliers Section (Still uses sample data) */}
                {activeSection === 'suppliers' && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">الموردون المشاركون</h2>

{/* --- 1. Show loading message --- */}
{isLoadingSuppliers && <p className="text-center text-gray-500">جار تحميل الموردين...</p>}

{/* --- 2. Show error message if fetching failed --- */}
{supplierError && <p className="text-center text-red-500">خطأ في تحميل الموردين: {supplierError}</p>}

{/* --- 3. Show suppliers list ONLY if NOT loading AND NO error --- */}
{!isLoadingSuppliers && !supplierError && (
    <> {/* Using a Fragment <>...</> allows multiple elements here */}
        {/* Map over the 'fetchedSuppliers' state variable */}
        {fetchedSuppliers.map(supplier => (
             <motion.div
                key={supplier.id} // Use the unique ID from the database
                className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer"
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                onClick={() => setSelectedSupplier(supplier)} // Keep this if you want to view details later
            >
                <div
                    className="h-24 w-full flex items-center justify-center text-white bg-gray-400" // Added a fallback background color
                    // Use the 'image_url' field from the database data
                    style={{ background: supplier.image_url || 'linear-gradient(to right, #6b7280, #4b5563)' }} // Add a default gradient if image_url is missing
                >
                    {/* Use the 'name' field from the database data */}
                    <h3 className="text-lg font-bold">{supplier.name}</h3>
                </div>
                <div className="p-4">
                    <div className="flex items-center justify-between mb-2 text-sm">
                        {/* Use the 'category' field, provide default text if missing */}
                        <span className="text-gray-600">{supplier.category || 'غير مصنف'}</span>
                        {/* Only show rating if the 'rating' field exists */}
                        {supplier.rating && (
                            <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                {/* Use the 'rating' field */}
                                <span>{supplier.rating}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 gap-1">
                        <MapPin className="h-4 w-4" />
                        {/* Use the 'location' field, provide default text if missing */}
                        <span>{supplier.location || 'غير محدد'}</span>
                    </div>
                </div>
            </motion.div>
        ))}
    </>
)}

 {/* --- 4. Show message if loading finished, no error, but no suppliers found --- */}
 {!isLoadingSuppliers && !supplierError && fetchedSuppliers.length === 0 && (
    <p className="text-center text-gray-500">لا يوجد موردون لعرضهم حالياً.</p>
 )}
                    </div>
                )}
            </div>

            {/* Cart Sidebar */}
            <AnimatePresence>
                {showCart && renderCart()}
            </AnimatePresence>

        </div>
    );
};

export default MainPanel;