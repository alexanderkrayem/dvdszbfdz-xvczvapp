// src/components/MainPanel.jsx

import React, { useState, useEffect } from 'react'; // Ensure useEffect is imported
import { Clock, Plus, Minus, Trash2, MapPin, Star, ShoppingCart, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MainPanel = ({ telegramUser }) => {
    const [activeSection, setActiveSection] = useState('exhibitions');
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showCart, setShowCart] = useState(false);
    // --- NEW: State for fetched cart ---
    const [cartItems, setCartItems] = useState([]);
    const [isLoadingCart, setIsLoadingCart] = useState(false); // Initially false, load when user is known
    const [cartError, setCartError] = useState(null);

    // Inside MainPanel component

// --- NEW: useEffect to fetch cart ---
useEffect(() => {
    // Only fetch if we have a user ID
    if (!telegramUser?.id) {
        // console.log("Waiting for user info to fetch cart...");
        return; // Exit if no user ID yet
    }

    const fetchCart = async () => {
        setIsLoadingCart(true);
        setCartError(null);
        console.log(`Fetching cart for user: ${telegramUser.id}`);
        try {
            const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/cart?userId=${telegramUser.id}`;
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log("Cart data received:", data);
            setCartItems(data);
        } catch (error) {
            console.error("Failed to fetch cart:", error);
            setCartError(error.message);
        } finally {
            setIsLoadingCart(false);
        }
    };

    fetchCart();
    // This effect depends on telegramUser.id, so it runs when the ID becomes available
}, [telegramUser?.id]); // Dependency array includes user ID

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


     // Inside MainPanel component

 const addToCart = async (product) => {
    if (!telegramUser?.id) {
        alert("Cannot add to cart: User information not loaded."); // Or handle more gracefully
        return;
    }
    if (!product?.id) {
        console.error("Cannot add to cart: Invalid product data", product);
        return;
    }

    console.log(`Adding product ${product.id} to cart for user ${telegramUser.id}`);
    // Consider adding loading state for the specific button maybe?

    try {
        const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/cart`;
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: telegramUser.id,
                productId: product.id,
                quantity: 1 // Send quantity 1 to add/increment by 1
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const updatedItem = await response.json();
        console.log("Item added/updated:", updatedItem);

        // --- Update frontend state ---
        // Find if item already exists in local state
        const existingItemIndex = cartItems.findIndex(item => item.product_id === updatedItem.product_id);

        if (existingItemIndex > -1) {
            // Item exists, update its quantity
            const newCartItems = [...cartItems];
            newCartItems[existingItemIndex] = {
                ...newCartItems[existingItemIndex], // Keep existing product details
                 quantity: updatedItem.quantity // Update quantity from backend response
            };
             setCartItems(newCartItems);
        } else {
            // Item is new, add it (need to merge product details from original product)
            // The backend currently only returns the cart_item row.
            // We either need the backend GET /cart to return full product details
            // OR we merge here based on the product passed to addToCart.
             setCartItems(prevItems => [
                ...prevItems,
                {
                    product_id: updatedItem.product_id,
                    quantity: updatedItem.quantity,
                    // Add product details from the 'product' object passed in
                    name: product.name,
                    price: product.price,
                    discount_price: product.discount_price,
                    image_url: product.image_url,
                    is_on_sale: product.is_on_sale
                }
            ]);
             // Alternatively, and maybe better: Refetch the whole cart after adding
             // fetchCart(); // (fetchCart would need to be defined outside useEffect or passed)
        }


        // Optionally show notification or open cart
        setShowCart(true);

    } catch (error) {
        console.error("Failed to add item to cart:", error);
        alert(`Error adding item: ${error.message}`); // Show error to user
    }
};

    // --- renderCart function remains the same ---
      // Inside MainPanel component

  // Placeholder functions for cart actions (implement next)
  const handleIncreaseQuantity = (productId) => { console.log("Increase qty:", productId); /* TODO */ };
  const handleDecreaseQuantity = (productId) => { console.log("Decrease qty:", productId); /* TODO */ };
  const handleRemoveItem = (productId) => { console.log("Remove item:", productId); /* TODO */ };


  const renderCart = () => (
      <motion.div /* ... */ >
          {/* ... Cart Header ... */}

          <div className="flex-grow overflow-y-auto p-4 space-y-4">
              {/* --- NEW: Loading/Error for cart --- */}
              {isLoadingCart && <p className="text-center text-gray-500">جار تحميل السلة...</p>}
              {cartError && <p className="text-center text-red-500">خطأ في تحميل السلة: {cartError}</p>}

              {!isLoadingCart && !cartError && cartItems.length === 0 && (
                  <p className="text-center text-gray-500">سلة التسوق فارغة.</p>
              )}

              {!isLoadingCart && !cartError && cartItems.length > 0 && (
                  /* --- CHANGE: Map over cartItems --- */
                  cartItems.map(item => (
                      <div key={item.product_id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                          <div
                              className="h-16 w-16 rounded-lg flex-shrink-0 bg-gray-200"
                              /* --- CHANGE: Use item data --- */
                              style={{ background: item.image_url || '#e5e7eb' }}
                          ></div>
                          <div className="flex-1 min-w-0">
                              {/* --- CHANGE: Use item data --- */}
                              <h3 className="font-medium truncate">{item.name}</h3>
                              {/* --- CHANGE: Logic for price --- */}
                              <div className="text-blue-600">
                                  {item.is_on_sale && item.discount_price ? item.discount_price : item.price} د.إ
                              </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0"> {/* Reduced gap */}
                              {/* --- NEW: Buttons --- */}
                              <button
                                  onClick={() => handleDecreaseQuantity(item.product_id)}
                                  className="p-1.5 bg-gray-200 rounded text-gray-700 hover:bg-gray-300" aria-label="Decrease quantity">
                                  <Minus className="h-3 w-3" /> {/* Use icon */}
                              </button>
                              <span className="w-6 text-center font-medium">{item.quantity}</span> {/* Fixed width */}
                               <button
                                   onClick={() => handleIncreaseQuantity(item.product_id)}
                                   className="p-1.5 bg-gray-200 rounded text-gray-700 hover:bg-gray-300" aria-label="Increase quantity">
                                   <Plus className="h-3 w-3" /> {/* Use icon */}
                               </button>
                               <button
                                   onClick={() => handleRemoveItem(item.product_id)}
                                   className="p-1.5 text-red-500 hover:text-red-700" aria-label="Remove item">
                                    <Trash2 className="h-4 w-4" /> {/* Use icon */}
                                </button>
                          </div>
                      </div>
                  ))
              )}
          </div>

          {/* Cart Footer - Update total calculation */}
          {!isLoadingCart && cartItems.length > 0 && (
               <div className="p-4 mt-auto border-t flex-shrink-0">
                  <div className="flex justify-between items-center mb-4">
                      <span className="font-bold">المجموع:</span>
                      <span className="font-bold">
                          {/* --- CHANGE: Calculate total from cartItems --- */}
                          {cartItems.reduce((total, item) => {
                              const price = item.is_on_sale && item.discount_price ? item.discount_price : item.price;
                              // Ensure price is treated as a number
                              return total + (parseFloat(price) * item.quantity);
                          }, 0).toFixed(2)} د.إ {/* Format to 2 decimal places */}
                      </span>
                  </div>
                  <button className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors">
                      إتمام الشراء {/* TODO: Implement checkout logic */}
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