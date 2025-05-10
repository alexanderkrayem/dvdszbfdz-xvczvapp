// src/components/MainPanel.jsx

import React, { useState, useEffect } from 'react'; // Ensure useEffect is imported
import { Clock, MapPin, Plus, Minus, Trash2, Star, ShoppingCart, Search, X, Heart } from 'lucide-react';
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



    // --- State for fetched product data ---
    const [fetchedProducts, setFetchedProducts] = useState([]); // To store products from API
    const [isLoadingProducts, setIsLoadingProducts] = useState(true); // Track loading state
    const [productError, setProductError] = useState(null); // Track fetching errors
   // --- NEW: State for suppliers ---
    const [fetchedSuppliers, setFetchedSuppliers] = useState([]);
    const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(true);
    const [supplierError, setSupplierError] = useState(null);

    // --- NEW: State for Profile and Checkout Flow ---
    const [userProfile, setUserProfile] = useState(null); // Store fetched profile data
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);
    const [profileError, setProfileError] = useState(null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false); // For "Proceed to Checkout" button loading

// Inside MainPanel component
const [userFavoriteProductIds, setUserFavoriteProductIds] = useState(new Set()); // Use a Set for efficient lookups
const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);

    // Address Form State (inside MainPanel or a new AddressFormModal component)
    const [addressFormData, setAddressFormData] = useState({
        fullName: '',
        phoneNumber: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
    });


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


    const doFetchCart = async () => { // Renamed to avoid conflict if it's a prop/state
        if (!telegramUser?.id) {
            console.log("User info not available for fetching cart.");
            // Potentially set cart loading false and clear items if user becomes null
            return;
        }
        setIsLoadingCart(true);
        setCartError(null);
        try {
            const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/cart?userId=${telegramUser.id}`;
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setCartItems(data);
        } catch (error) {
            console.error("Failed to fetch cart:", error);
            setCartError(error.message);
            setCartItems([]); // Clear cart on error
        } finally {
            setIsLoadingCart(false);
        }
    };
    
    // Inside MainPanel component
// Inside MainPanel component

useEffect(() => {
    const fetchUserFavorites = async () => {
        if (!telegramUser?.id) return;

        setIsLoadingFavorites(true);
        try {
            const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/favorites?userId=${telegramUser.id}`;
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('Failed to fetch favorites');
            const favoriteIds = await response.json(); // Expecting an array of product_ids
            setUserFavoriteProductIds(new Set(favoriteIds)); // Store as a Set
        } catch (error) {
            console.error("Error fetching user favorites:", error);
            // Don't necessarily need to show error to user, can silently fail for this
        } finally {
            setIsLoadingFavorites(false);
        }
    };

    fetchUserFavorites();
}, [telegramUser?.id]); // Re-fetch if user changes

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


// --- NEW: useEffect to fetch cart ---
useEffect(() => {
    if (telegramUser?.id) {
        console.log("useEffect for cart triggered due to telegramUser.id change/presence.");
        doFetchCart(); // << CALLS THE FUNCTION ABOVE
    } else {
        setCartItems([]);
        setIsLoadingCart(false);
    }
    // The 'const fetchCart = async () => {...}' block that was previously
    // defined INSIDE this useEffect should be REMOVED.
}, [telegramUser?.id]);

// Inside MainPanel component
const handleAddressFormChange = (e) => {
    const { name, value } = e.target;
    setAddressFormData(prev => ({ ...prev, [name]: value }));
};

// Inside MainPanel component


// Inside MainPanel component

// Inside MainPanel component, before other handler functions



 // Inside MainPanel component

 const addToCart = async (product) => {
    if (!telegramUser?.id) {
        alert("Cannot add to cart: User information not loaded.");
        return;
    }
    if (!product?.id) {
        console.error("Cannot add to cart: Invalid product data", product);
        alert("Error: Could not add product to cart due to invalid product data."); // User-facing feedback
        return;
    }

    console.log(`Adding product ${product.id} (${product.name}) to cart for user ${telegramUser.id}`);
    // You could add a specific loading state for this action if you want,
    // e.g., by disabling the button or showing a spinner.
    // For now, the general cart loading state from doFetchCart will cover the refresh.

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
                quantity: 1 // Your backend POST adds this quantity
            }),
        });

        if (!response.ok) {
            // Try to get more specific error message from backend if possible
            let errorMsg = `HTTP error! status: ${response.status}`;
            try {
                const errorData = await response.json();
                if (errorData && errorData.error) {
                    errorMsg = errorData.error;
                }
            } catch (e) {
                // Ignore if response body isn't JSON or is empty
            }
            throw new Error(errorMsg);
        }

        // No need to parse updatedItem if we are refetching the whole cart
        // const updatedItem = await response.json();
        // console.log("Item added/updated via POST:", updatedItem);

        // --- IMPORTANT: Refetch the entire cart to ensure UI consistency ---
        await doFetchCart();

        // Optionally show notification or open cart after successful addition
        setShowCart(true); // Open the cart sidebar
        // You could also add a small success toast/notification here

    } catch (error) {
        console.error("Failed to add item to cart:", error);
        alert(`Error adding item to cart: ${error.message}`); // Show error to user
    } finally {
        // Reset any specific "adding to cart" loading state here if you implemented one
    }
};

// Inside MainPanel component

const handleToggleFavorite = async (productId) => {
    if (!telegramUser?.id || isLoadingFavorites) return; // Prevent action if no user or still loading initial favs

    const isCurrentlyFavorite = userFavoriteProductIds.has(productId);
    const method = isCurrentlyFavorite ? 'DELETE' : 'POST';
    // For DELETE, productId is in path; for POST, it's in body
    const apiUrl = isCurrentlyFavorite
        ? `${import.meta.env.VITE_API_BASE_URL}/api/favorites/${productId}?userId=${telegramUser.id}`
        : `${import.meta.env.VITE_API_BASE_URL}/api/favorites`;

    // Optimistically update UI first for better responsiveness
    const newFavoriteProductIds = new Set(userFavoriteProductIds);
    if (isCurrentlyFavorite) {
        newFavoriteProductIds.delete(productId);
    } else {
        newFavoriteProductIds.add(productId);
    }
    setUserFavoriteProductIds(newFavoriteProductIds);

    try {
        const body = method === 'POST' ? JSON.stringify({ userId: telegramUser.id, productId }) : null;
        const headers = method === 'POST' ? { 'Content-Type': 'application/json' } : {};

        const response = await fetch(apiUrl, { method, headers, body });

        if (!response.ok) {
            // Revert optimistic update on error
            setUserFavoriteProductIds(new Set(userFavoriteProductIds)); // Revert to original
            throw new Error(`Failed to ${isCurrentlyFavorite ? 'remove' : 'add'} favorite`);
        }
        // Backend confirmed, UI is already updated. Could log success.
        console.log(`Product ${productId} ${isCurrentlyFavorite ? 'removed from' : 'added to'} favorites successfully.`);

    } catch (error) {
        console.error("Error toggling favorite:", error);
        // Revert optimistic update on error
        setUserFavoriteProductIds(new Set(userFavoriteProductIds)); // Revert to original
        alert(`Error: ${error.message}`);
    }
};


    // --- renderCart function remains the same ---
      // Inside MainPanel component

  // Inside MainPanel component

// Function to handle increasing quantity (or adding if not present)
const handleIncreaseQuantity = async (productId) => {
    if (!telegramUser?.id) return;

    // Find the item in the current cart to get its current quantity
    const itemInCart = cartItems.find(item => item.product_id === productId);
    const currentQuantity = itemInCart ? itemInCart.quantity : 0;

    // If using POST to increment (as in original addToCart)
    // This assumes POST /api/cart with quantity:1 always means "add one more"
    // or creates the item with quantity 1 if not existing.
    // If POST always SETS quantity, then this logic changes.
    // Our current POST with ON CONFLICT adds the provided quantity.
    console.log(`Increasing quantity for product ${productId} (current: ${currentQuantity})`);
    try {
        const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/cart`;
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: telegramUser.id,
                productId: productId,
                quantity: 1 // Always add 1
            }),
        });
        if (!response.ok) throw new Error(`Failed to increase quantity: ${response.statusText}`);
        await doFetchCart(); // Refetch cart to update UI
    } catch (error) {
        console.error("Error increasing quantity:", error);
        alert(`Error: ${error.message}`);
    }
};

// Function to handle decreasing quantity
const handleDecreaseQuantity = async (productId) => {
    if (!telegramUser?.id) return;

    const itemInCart = cartItems.find(item => item.product_id === productId);
    if (!itemInCart) {
        console.warn("Attempted to decrease quantity of item not in cart.");
        return;
    }

    console.log(`Decreasing quantity for product ${productId} (current: ${itemInCart.quantity})`);

    if (itemInCart.quantity <= 1) {
        // If quantity is 1 or less, remove the item
        await handleRemoveItem(productId);
    } else {
        // Decrease quantity by 1 using the PUT endpoint
        try {
            const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/cart/item/${productId}?userId=${telegramUser.id}`;
            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newQuantity: itemInCart.quantity - 1 }),
            });
            if (!response.ok) throw new Error(`Failed to decrease quantity: ${response.statusText}`);
            await doFetchCart(); // Refetch cart
        } catch (error) {
            console.error("Error decreasing quantity:", error);
            alert(`Error: ${error.message}`);
        }
    }
};

// Function to handle removing an item completely
const handleRemoveItem = async (productId) => {
    if (!telegramUser?.id) return;

    console.log(`Removing product ${productId} from cart`);
    try {
        const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/cart/item/${productId}?userId=${telegramUser.id}`;
        const response = await fetch(apiUrl, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error(`Failed to remove item: ${response.statusText}`);
        await doFetchCart(); // Refetch cart
    } catch (error) {
        console.error("Error removing item:", error);
        alert(`Error: ${error.message}`);
    }
};

  const handleCheckout = async () => {
    if (!telegramUser?.id) {
        alert("User information not available. Please try again.");
        return;
    }
    if (cartItems.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    setIsLoadingProfile(true); // Show loading indicator for profile check
    setProfileError(null);
    setShowAddressModal(false); // Ensure modal is hidden initially

    try {
        const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/user/profile?userId=${telegramUser.id}`;
        const response = await fetch(apiUrl);

        if (response.ok) { // Profile exists
            const profileData = await response.json();
            setUserProfile(profileData);
            // Pre-fill address form state if needed, though maybe not necessary if just proceeding
            setAddressFormData({
                fullName: profileData.full_name || '',
                phoneNumber: profileData.phone_number || '',
                addressLine1: profileData.address_line1 || '',
                addressLine2: profileData.address_line2 || '',
                city: profileData.city || '',
            });
            console.log("Profile found:", profileData);
            await proceedToCreateOrder(); // Directly proceed to order creation
        } else if (response.status === 404) { // Profile not found
            console.log("Profile not found, showing address modal.");
            // Pre-fill with Telegram user's first/last name if available
            setAddressFormData(prev => ({
                ...prev,
                fullName: `${telegramUser.first_name || ''} ${telegramUser.last_name || ''}`.trim()
            }));
            setShowAddressModal(true);
        } else { // Other error
            throw new Error(`Failed to fetch profile: ${response.status}`);
        }
    } catch (error) {
        console.error("Error during profile check:", error);
        setProfileError(error.message);
        alert(`Error checking your profile: ${error.message}`);
    } finally {
        setIsLoadingProfile(false);
    }
};

const handleSaveProfile = async (e) => {
    e.preventDefault(); // Prevent default form submission
    if (!telegramUser?.id) {
        alert("User information not available.");
        return;
    }

    // Add specific loading state for profile save if 'isPlacingOrder' feels wrong
    setIsPlacingOrder(true); // Or use setIsLoadingProfile if more appropriate
    setProfileError(null); // Clear previous errors

    try {
        const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/user/profile`;
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: telegramUser.id,
                ...addressFormData // Send all form data
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: "Failed to save profile." }));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const savedProfile = await response.json();
        setUserProfile(savedProfile); // Update local profile state
        setShowAddressModal(false); // Hide modal on success
        console.log("Profile saved:", savedProfile);

        // Now that profile is saved, proceed to create the order
        await proceedToCreateOrder();

    } catch (error) {
        console.error("Error saving profile:", error);
        setProfileError(error.message); // Show error in the modal
        // alert(`Error saving profile: ${error.message}`); // Or use an alert
    } finally {
        setIsPlacingOrder(false); // Or setIsLoadingProfile(false)
    }
};

const proceedToCreateOrder = async () => {
    if (!telegramUser?.id) {
        alert("Cannot create order: User information missing.");
        return;
    }
    if (cartItems.length === 0) {
        alert("Cannot create order: Your cart is empty.");
        return;
    }

    setIsPlacingOrder(true);
    // Consider clearing profileError here if it's shared with the modal
    // setProfileError(null);

    try {
        const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/orders`;
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: telegramUser.id }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: "Failed to create order." }));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const orderResult = await response.json();
        console.log("Order created:", orderResult);

        alert(`تم إنشاء طلبك بنجاح! رقم الطلب: ${orderResult.orderId}. سنتواصل معك قريباً.`); // Success message
        setCartItems([]); // Clear the cart on the frontend
        // Optionally, close the Mini App or navigate to a success page
        // if (window.Telegram?.WebApp) {
        //     window.Telegram.WebApp.close();
        // }

    } catch (error) {
        console.error("Error creating order:", error);
        alert(`فشل في إنشاء الطلب: ${error.message}`);
    } finally {
        setIsPlacingOrder(false);
    }
};


  const renderCart = () => (
      <motion.div
      key="cart-sidebar"
      initial={{ x: '100%' }} // Assuming RTL, slides from right
      animate={{ x: 0 }}
      exit={{ x: '100%' }} // Assuming RTL, slides to right
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
      // dir="rtl" is usually set on a higher parent, but explicitly here is fine too
      // For LTR, you'd use 'left-0' and initial/exit x: '-100%'
      >
          {/* ... Cart Header ... */}
          {/* --- NEW: Cart Header with Title and Close Button --- */}
        <div className="p-4 flex-shrink-0 border-b bg-gray-50"> {/* Added a subtle background to header */}
            <div className="flex justify-between items-center"> {/* Removed mb-4 as padding is on parent */}
                <h2 className="text-xl font-semibold text-gray-800">سلة التسوق</h2> {/* Adjusted font weight */}
                <button
                    onClick={() => setShowCart(false)} // <<< THIS IS THE CRUCIAL PART
                    className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-200 transition-colors" // Added p-2 for better click area
                    aria-label="Close cart"
                >
                    <X className="h-5 w-5" /> {/* Adjusted icon size slightly */}
                </button>
            </div>
        </div>
        {/* --- END OF NEW Cart Header --- */}

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
                  <button
    onClick={handleCheckout} // Attach the handler
    disabled={isLoadingProfile || isPlacingOrder || cartItems.length === 0} // Disable if loading or cart empty
    className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
>
    {isLoadingProfile ? "جار التحقق..." : isPlacingOrder ? "جار إنشاء الطلب..." : "إتمام الشراء"}
</button>
              </div>
          )}
      </motion.div>
  );

  // --- NEW: Function to render the Mini Cart Summary Bar ---
const renderMiniCartBar = () => {
    if (isLoadingCart || cartItems.length === 0 || showCart) { // Don't show if loading, empty, or full cart is open
        return null;
    }

    const totalCartPrice = cartItems.reduce((total, item) => {
        const price = item.is_on_sale && item.discount_price ? item.discount_price : item.price;
        return total + (parseFloat(price) * item.quantity);
    }, 0).toFixed(2);

    const totalCartItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <motion.div
            initial={{ y: 100 }} // Start off-screen
            animate={{ y: 0 }}   // Animate to on-screen
            exit={{ y: 100 }}     // Animate off-screen
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 bg-white shadow-top-md p-3 z-40" // shadow-top-md is a custom class you might need to define or use existing shadow
            dir="rtl"
        >
            <div className="max-w-4xl mx-auto flex justify-between items-center">
                <div>
                    <span className="font-semibold">{totalCartItems} عنصر</span>
                    <span className="mx-2">|</span>
                    <span className="font-bold text-blue-600">{totalCartPrice} د.إ</span>
                </div>
                <button
                    onClick={() => setShowCart(true)} // This opens the full cart sidebar
                    className="bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600 text-sm"
                >
                    عرض السلة
                </button>
            </div>
        </motion.div>
    );
};
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
                            {cartItems.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                                    {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
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
            <div className="p-4 max-w-4xl mx-auto pb-24">
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
                                             {/* --- FAVORITE BUTTON --- */}
        <button
            onClick={(e) => {
                e.stopPropagation(); // Prevent card click (which opens product detail) when heart is clicked
                handleToggleFavorite(product.id);
            }}
            // For RTL, top-right is usually the spot. Adjust if needed.
            className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white rounded-full shadow-md transition-colors z-10" // Tailwind classes for styling
            aria-label={userFavoriteProductIds.has(product.id) ? "Remove from favorites" : "Add to favorites"}
        >
            <Heart
                className={`h-5 w-5 transition-all duration-150 ${
                    userFavoriteProductIds.has(product.id)
                        ? 'text-red-500 fill-red-500' // Favorited state
                        : 'text-gray-400 hover:text-red-400' // Not favorited state
                }`}
                // Optional: Add strokeWidth if you want a thicker/thinner outline
                // strokeWidth={userFavoriteProductIds.has(product.id) ? 2.5 : 2}
            />
        </button>
        {/* End of Favorite Button */}
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

{/* Section 3: Mini Cart Summary Bar (NEW) */}
<AnimatePresence>
            {/* This will call the renderMiniCartBar() function defined above */}
            {renderMiniCartBar()}
        </AnimatePresence>

            {/* Cart Sidebar */}
            <AnimatePresence>
                {showCart && renderCart()}
            </AnimatePresence>
            
{showAddressModal && (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        dir="rtl" // For RTL layout
    >
        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">تفاصيل التوصيل</h2>
                <button onClick={() => setShowAddressModal(false)} className="text-gray-500 hover:text-gray-800">
                    <X className="h-6 w-6" />
                </button>
            </div>

            {/* Display profileError specific to modal actions if any */}
            {profileError && <p className="text-red-500 text-sm mb-3">{profileError}</p>}

            <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
                    <input
                        type="text"
                        name="fullName"
                        id="fullName"
                        required
                        value={addressFormData.fullName}
                        onChange={handleAddressFormChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                    <input
                        type="tel"
                        name="phoneNumber"
                        id="phoneNumber"
                        required
                        value={addressFormData.phoneNumber}
                        onChange={handleAddressFormChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 mb-1">العنوان (سطر ١)</label>
                    <input
                        type="text"
                        name="addressLine1"
                        id="addressLine1"
                        required
                        value={addressFormData.addressLine1}
                        onChange={handleAddressFormChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 mb-1">العنوان (سطر ٢) (اختياري)</label>
                    <input
                        type="text"
                        name="addressLine2"
                        id="addressLine2"
                        value={addressFormData.addressLine2}
                        onChange={handleAddressFormChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">المدينة</label>
                    <input
                        type="text"
                        name="city"
                        id="city"
                        required
                        value={addressFormData.city}
                        onChange={handleAddressFormChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isPlacingOrder || isLoadingProfile} // Use existing loading states or add a new one for profile save
                    className="w-full bg-green-500 text-white py-2.5 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                    {isPlacingOrder ? "جار الحفظ..." : "حفظ ومتابعة"}
                </button>
            </form>
        </div>
    </motion.div>
)}

        </div>
    );
};

export default MainPanel;