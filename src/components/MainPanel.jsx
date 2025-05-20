// src/components/MainPanel.jsx

import React, { useState, useEffect, useCallback     } from 'react'; // Ensure useEffect is imported
import { Clock, MapPin, Plus, Minus, Trash2, Star, ShoppingCart, Search, X, Heart, TagIcon, ChevronLeftIcon, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MainPanel = ({ telegramUser }) => {
    const PRODUCT_LIMIT_FOR_SEARCH = 10; // Define this constant
    const [activeSection, setActiveSection] = useState('exhibitions');
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showCart, setShowCart] = useState(false);
   // Inside MainPanel component, with other useState hooks
const [selectedProductDetails, setSelectedProductDetails] = useState(null); // Stores full details of the product being viewed
const [showProductDetailModal, setShowProductDetailModal] = useState(false);
const [isLoadingProductDetail, setIsLoadingProductDetail] = useState(false);
const [productDetailError, setProductDetailError] = useState(null);
// Inside MainPanel component, with other useState hooks
const [fetchedFavoriteProducts, setFetchedFavoriteProducts] = useState([]);
const [isLoadingFavoritesTab, setIsLoadingFavoritesTab] = useState(false);
const [favoritesTabError, setFavoritesTabError] = useState(null);
     // --- NEW: State for fetched cart ---
     const [cartItems, setCartItems] = useState([]);
     const [isLoadingCart, setIsLoadingCart] = useState(false); // Initially false, load when user is known
     const [cartError, setCartError] = useState(null);
const [fetchedDeals, setFetchedDeals] = useState([]);
const [isLoadingDeals, setIsLoadingDeals] = useState(false); // Start false, fetch when tab is active or on initial load
const [dealError, setDealError] = useState(null);
// Inside MainPanel component, with other useState hooks
const [searchTerm, setSearchTerm] = useState('');
// We'll add isSearching, searchResults, etc., later
// Inside MainPanel component
const [isSearching, setIsSearching] = useState(false);
const [searchResults, setSearchResults] = useState({ products: { items: [], currentPage: 1, totalPages: 0, totalItems: 0, limit: PRODUCT_LIMIT_FOR_SEARCH  /* or your constant */ }, deals: [], suppliers: [] });
const [searchError, setSearchError] = useState(null);
const [showSearchResultsView, setShowSearchResultsView] = useState(false); // To toggle views
// Inside MainPanel component, with other useState hooks
const [fetchedOrders, setFetchedOrders] = useState([]);
const [isLoadingOrdersTab, setIsLoadingOrdersTab] = useState(false);
const [ordersTabError, setOrdersTabError] = useState(null);
// Inside MainPanel component, with other useState hooks
const [selectedDealDetails, setSelectedDealDetails] = useState(null);
const [showDealDetailModal, setShowDealDetailModal] = useState(false);
const [isLoadingDealDetail, setIsLoadingDealDetail] = useState(false);
const [dealDetailError, setDealDetailError] = useState(null);
    // --- State for fetched product data ---
    const [fetchedProducts, setFetchedProducts] = useState([]); // To store products from API
    const [isLoadingProducts, setIsLoadingProducts] = useState(false); // Track loading state
    const [productError, setProductError] = useState(null); // Track fetching errors

    // Inside MainPanel component, with other useState hooks
const [selectedSupplierDetails, setSelectedSupplierDetails] = useState(null);
const [showSupplierDetailModal, setShowSupplierDetailModal] = useState(false);
const [isLoadingSupplierDetail, setIsLoadingSupplierDetail] = useState(false);
const [supplierDetailError, setSupplierDetailError] = useState(null);

    // --- NEW: Pagination state for products ---
const [currentProductPage, setCurrentProductPage] = useState(1);
const [totalProductPages, setTotalProductPages] = useState(1);
const [isLoadingMoreProducts, setIsLoadingMoreProducts] = useState(false); // Specific loading for "load more"
const PRODUCTS_PER_PAGE = 12; // Or 20, or whatever you prefer as a default limit

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
// Inside MainPanel component, with other useState hooks
const [showOrderConfirmationModal, setShowOrderConfirmationModal] = useState(false);
const [confirmedOrderDetails, setConfirmedOrderDetails] = useState(null); // To store { orderId: ... }
    // Address Form State (inside MainPanel or a new AddressFormModal component)
    const [addressFormData, setAddressFormData] = useState({
        fullName: '',
        phoneNumber: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
    });

// Inside MainPanel component, before the return statement
const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args); // 'this' context might need care if func is a class method
        }, delay);
    };
};
// Inside MainPanel component, after debounce function
// Inside MainPanel component - replace the previous performSearch
const debouncedSearch = useCallback(
    debounce(async (currentSearchTerm, page = 1) => { // Only needs searchTerm and page
        const trimmedTerm = currentSearchTerm.trim();

        if (trimmedTerm.length < 3) {
            console.log("Search term too short, hiding results view.");
            setShowSearchResultsView(false);
            setSearchResults({ products: { items: [], currentPage: 1, totalPages: 0, totalItems: 0, limit: PRODUCT_LIMIT_FOR_SEARCH }, deals: [], suppliers: [] });
            setIsSearching(false);
            return;
        }

        console.log(`[FRONTEND DEBOUNCED SEARCH] Calling API to search for: "${trimmedTerm}" on page: ${page}`);
        setIsSearching(true);
        setSearchError(null);
        setShowSearchResultsView(true);

        // --- CONSTRUCT API URL (Simpler: only searchTerm, page, limit) ---
        let apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/search?page=${page}&limit=${PRODUCT_LIMIT_FOR_SEARCH}`;
        if (trimmedTerm) { // Always true if we pass the length check, but good practice
            apiUrl += `&searchTerm=${encodeURIComponent(trimmedTerm)}`;
        }
        
        console.log("[FRONTEND DEBOUNCED SEARCH] Constructed API URL:", apiUrl);

        try {
            const response = await fetch(apiUrl);

            if (!response.ok) {
                const errData = await response.json().catch(() => ({ message: `Search request failed: ${response.statusText}` }));
                throw new Error(errData.error || errData.message || `Search request failed: ${response.statusText}`);
            }
            const data = await response.json();
            // console.log("[FRONTEND DEBOUNCED SEARCH] API Response 'data' object:", JSON.stringify(data, null, 2));

            if (data && data.results) {
                // console.log("[FRONTEND DEBOUNCED SEARCH] Setting searchResults with data.results.products:", JSON.stringify(data.results.products, null, 2));
                setSearchResults({
                    products: data.results.products || { items: [], currentPage: 1, totalPages: 0, totalItems: 0, limit: PRODUCT_LIMIT_FOR_SEARCH },
                    deals: data.results.deals || [],
                    suppliers: data.results.suppliers || []
                });
                // If you want to store current page/total pages for product search results specifically:
                // setCurrentProductSearchPage(data.results.products?.currentPage || 1);
                // setTotalProductSearchPages(data.results.products?.totalPages || 0);
            } else {
                console.error("[FRONTEND DEBOUNCED SEARCH] Unexpected API response structure (missing data.results):", data);
                setSearchResults({ products: { items: [], currentPage: 1, totalPages: 0, totalItems: 0, limit: PRODUCT_LIMIT_FOR_SEARCH }, deals: [], suppliers: [] });
            }
        } catch (error) {
            console.error("[FRONTEND DEBOUNCED SEARCH] Global search API error:", error);
            setSearchError(error.message);
            setSearchResults({ products: { items: [], currentPage: 1, totalPages: 0, totalItems: 0, limit: PRODUCT_LIMIT_FOR_SEARCH }, deals: [], suppliers: [] });
        } finally {
            setIsSearching(false);
        }
    }, 500),
    [import.meta.env.VITE_API_BASE_URL, PRODUCT_LIMIT_FOR_SEARCH] // Dependencies
);

// Inside MainPanel component
const clearSearch = () => {
    setSearchTerm('');
    setShowSearchResultsView(false);
    setSearchResults({ products: { items: [], currentPage: 1, totalPages: 0, totalItems: 0, limit: PRODUCT_LIMIT_FOR_SEARCH /* or your constant */ }, deals: [], suppliers: [] });
    setIsSearching(false);
    // setActiveSection('products'); // Optional: Reset to default tab
};
    // --- Keep sample data for deals and suppliers for now ---
  
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

// Inside MainPanel component

// Inside MainPanel component
// Inside MainPanel component - update the "if (newSearchTerm.trim() === '')" block
const handleSearchInputChange = (e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);

    if (newSearchTerm.trim() === '') {
        // performSearch.cancel?.(); // If using lodash.debounce
        console.log("Search cleared.");
        setShowSearchResultsView(false); // Hide search results view
        setSearchResults({ products: { items: [], currentPage: 1, totalPages: 0, totalItems: 0, limit: PRODUCT_LIMIT_FOR_SEARCH /* or your constant */ }, deals: [], suppliers: [] });
        setIsSearching(false);
        // setActiveSection('products'); // Optional: reset to default tab
    } else {
        debouncedSearch(newSearchTerm, 1);
    }
};

const handleLoadMoreProducts = async () => {
    if (isLoadingMoreProducts || currentProductPage >= totalProductPages) {
        return; // Don't fetch if already loading or no more pages
    }

    setIsLoadingMoreProducts(true);
    setProductError(null); // Clear previous errors

    const nextPage = currentProductPage + 1;

    try {
        const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/products?page=${nextPage}&limit=${PRODUCTS_PER_PAGE}`;
        // TODO LATER: Add searchTerm and category params here too, consistent with initial fetch

        console.log("Loading more products from:", apiUrl);
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // --- Append new products to the existing list ---
        setFetchedProducts(prevProducts => [...prevProducts, ...data.items]);
        setCurrentProductPage(data.currentPage);
        // totalProductPages should remain the same, but good to update if backend recalculates
        setTotalProductPages(data.totalPages);

    } catch (error) {
        console.error("Failed to load more products:", error);
        setProductError(error.message); // You might want a separate error state for "load more"
    } finally {
        setIsLoadingMoreProducts(false);
    }
};
// Inside MainPanel component, with other useEffect hooks
// Inside MainPanel component, with other useEffect hooks

useEffect(() => {
    const fetchUserOrders = async () => {
        if (activeSection === 'orders' && telegramUser?.id) {
            setIsLoadingOrdersTab(true);
            setOrdersTabError(null);
            setFetchedOrders([]); // Clear previous orders

            try {
                const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/orders?userId=${telegramUser.id}`;
                console.log("Fetching user orders from:", apiUrl);
                const response = await fetch(apiUrl);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const ordersData = await response.json();
                setFetchedOrders(ordersData);
            } catch (error) {
                console.error("Failed to fetch user orders:", error);
                setOrdersTabError(error.message);
            } finally {
                setIsLoadingOrdersTab(false);
            }
        }
    };

    fetchUserOrders();
}, [activeSection, telegramUser?.id, import.meta.env.VITE_API_BASE_URL]); // Dependencies
// --- NEW: useEffect to fetch Deals when 'exhibitions' tab is active ---
useEffect(() => {
    const fetchDealsData = async () => {
        // Only fetch if the deals tab is active and we haven't already fetched (or want to re-fetch)
        if (activeSection === 'exhibitions') { // 'exhibitions' is the key for your Deals tab
            setIsLoadingDeals(true);
            setDealError(null);
            setFetchedDeals([]); // Clear previous deals before fetching new ones

            try {
                const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/deals`;
                console.log("Fetching deals from:", apiUrl);
                const response = await fetch(apiUrl);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setFetchedDeals(data); // Assuming backend returns an array of deal objects
            } catch (error) {
                console.error("Failed to fetch deals:", error);
                setDealError(error.message);
            } finally {
                setIsLoadingDeals(false);
            }
        }
    };

    fetchDealsData();

}, [activeSection, import.meta.env.VITE_API_BASE_URL]); // Re-run if activeSection changes

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
        const fetchInitialProducts = async () => {
          setIsLoadingProducts(true);
          setProductError(null);
          // Reset products when fetching initial (e.g. if filters change later)
        setFetchedProducts([]);
        setCurrentProductPage(1); // Always start at page 1 for initial load
          try {
              // Ensure your backend server (telegram-app-backend) is running on localhost:3001
              const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
              const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/products?page=1&limit=${PRODUCTS_PER_PAGE}`;
            // TODO LATER: Add searchTerm and category params here when search/filter UI is built
            // e.g., &searchTerm=${currentSearchTerm}&category=${currentCategory}
            console.log("Fetching initial products from:", apiUrl);
        
              const response = await fetch(apiUrl);
              
              if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
              }
              const data = await response.json();
              setFetchedProducts(data.items); // Update state with fetched products
              setCurrentProductPage(data.currentPage);
            setTotalProductPages(data.totalPages);
          } catch (error) {
              console.error("Failed to fetch products:", error);
              setProductError(error.message); // Set error state
          } finally {
              setIsLoadingProducts(false); // Set loading false when done
          }
        };
        fetchInitialProducts(); // Run the fetch function
    }, []); // Empty array means run once on component mount

// Inside MainPanel component
// Inside MainPanel component, with other useEffect hooks

useEffect(() => {
    const fetchFullFavoriteProducts = async () => {
        if (activeSection === 'favorites' && telegramUser?.id) {
            setIsLoadingFavoritesTab(true);
            setFavoritesTabError(null);
            setFetchedFavoriteProducts([]); // Clear previous results

            if (userFavoriteProductIds.size === 0) {
                // No product IDs favorited, so no need to fetch details
                console.log("No favorite product IDs to fetch details for.");
                setIsLoadingFavoritesTab(false);
                return;
            }

            try {
                // Convert Set of IDs to a comma-separated string for the API
                const idsString = Array.from(userFavoriteProductIds).join(',');
                const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/products/batch?ids=${idsString}`;
                
                console.log("Fetching full favorite products from:", apiUrl);
                const response = await fetch(apiUrl);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const productsData = await response.json();
                
                // The backend returns products, but not necessarily in the order of favoriting.
                // If you want to sort them (e.g., by most recently favorited),
                // you'd need to store 'added_at' in user_favorites and sort based on that,
                // or sort by product name, etc. For now, we'll use the order from the API.
                setFetchedFavoriteProducts(productsData);

            } catch (error) {
                console.error("Failed to fetch full favorite products:", error);
                setFavoritesTabError(error.message);
            } finally {
                setIsLoadingFavoritesTab(false);
            }
        }
    };

    fetchFullFavoriteProducts();

}, [activeSection, telegramUser?.id, userFavoriteProductIds, import.meta.env.VITE_API_BASE_URL]); // Dependencies

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
// Inside MainPanel component
const handleShowProductDetails = async (productId) => {
    if (!productId) return;

    console.log(`Fetching details for product ID: ${productId}`);
    setShowProductDetailModal(true);
    setIsLoadingProductDetail(true);
    setProductDetailError(null);
    setSelectedProductDetails(null); // Clear previous details

    try {
        const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/products/${productId}`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("المنتج غير موجود.");
            }
            throw new Error(`فشل تحميل تفاصيل المنتج: ${response.statusText}`);
        }
        const data = await response.json();
        setSelectedProductDetails(data);
    } catch (error) {
        console.error("Error fetching product details:", error);
        setProductDetailError(error.message);
    } finally {
        setIsLoadingProductDetail(false);
    }
};

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
// Inside MainPanel component
const handleShowDealDetails = async (dealId) => {
    if (!dealId) return;

    console.log(`Fetching details for deal ID: ${dealId}`);
    setShowDealDetailModal(true);
    setIsLoadingDealDetail(true);
    setDealDetailError(null);
    setSelectedDealDetails(null);

    try {
        const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/deals/${dealId}`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
            if (response.status === 404) throw new Error("العرض غير موجود أو لم يعد فعالاً.");
            throw new Error(`فشل تحميل تفاصيل العرض: ${response.statusText}`);
        }
        const data = await response.json();
        setSelectedDealDetails(data);
    } catch (error) {
        console.error("Error fetching deal details:", error);
        setDealDetailError(error.message);
    } finally {
        setIsLoadingDealDetail(false);
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

        setConfirmedOrderDetails(orderResult); // Store order details for the modal
setShowOrderConfirmationModal(true);  // Show the confirmation modal

setCartItems([]);       // Clear the cart in the UI
setShowCart(false);     // Close the cart sidebar
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
// Inside MainPanel component
const handleShowSupplierDetails = async (supplierId) => {
    if (!supplierId) return;

    console.log(`Fetching details for supplier ID: ${supplierId}`);
    setShowSupplierDetailModal(true);
    setIsLoadingSupplierDetail(true);
    setSupplierDetailError(null);
    setSelectedSupplierDetails(null);

    try {
        const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/suppliers/${supplierId}`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
            if (response.status === 404) throw new Error("المورد غير موجود.");
            throw new Error(`فشل تحميل تفاصيل المورد: ${response.statusText}`);
        }
        const data = await response.json();
        setSelectedSupplierDetails(data);
    } catch (error) {
        console.error("Error fetching supplier details:", error);
        setSupplierDetailError(error.message);
    } finally {
        setIsLoadingSupplierDetail(false);
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
// Inside MainPanel component
const renderSupplierDetailModal = () => {
    if (!showSupplierDetailModal) return null;

    const supplier = selectedSupplierDetails; // Full supplier details with .products array

    // Helper to render a product card (simplified for this modal context)
    // OR ideally, use your existing ProductCard component if it's flexible enough
    const renderModalProductCard = (product) => (
        <motion.div
            key={`modal-prod-${product.id}`}
            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer flex flex-col"
            whileHover={{ y: -3, boxShadow: '0 6px 12px -2px rgba(0,0,0,0.1)' }}
            onClick={() => {
                setShowSupplierDetailModal(false); // Close this modal
                handleShowProductDetails(product.id); // Open product detail modal
            }}
        >
            <div 
                className="h-28 w-full bg-gray-200" // Adjusted height
                style={product.image_url && product.image_url.startsWith('linear-gradient') ? 
                       { background: product.image_url } : 
                       { backgroundImage: `url(${product.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            >
                {/* Maybe a sale badge if product.is_on_sale */}
            </div>
            <div className="p-2.5">
                <h4 className="font-semibold text-xs text-gray-800 line-clamp-2 mb-1 h-8">{product.name}</h4>
                <div className="text-blue-600 font-bold text-sm">
                    {parseFloat(product.is_on_sale && product.discount_price ? product.discount_price : product.price).toFixed(2)} د.إ
                </div>
            </div>
        </motion.div>
    );


    return (
        <motion.div
            key="supplierDetailModal"
            initial={{ opacity: 0, x: "100vw" }} // Slide from right
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100vw" }} // Exit to right
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className="fixed inset-0 bg-gray-100 z-50 flex flex-col overflow-y-auto" // Lighter background
            dir="rtl"
        >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white p-4 shadow-md z-10 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 truncate">
                    {isLoadingSupplierDetail ? "جاري التحميل..." : (supplier ? supplier.name : "تفاصيل المورد")}
                </h2>
                <button onClick={() => setShowSupplierDetailModal(false)} className="text-gray-500 hover:text-gray-700 p-2">
                    <X className="h-6 w-6" />
                </button>
            </div>

            {/* Modal Content */}
            <div className="flex-grow"> {/* Let this part scroll */}
                {isLoadingSupplierDetail && (
                    <div className="flex justify-center items-center h-[calc(100vh-100px)]">
                        <p className="text-gray-500">جاري تحميل التفاصيل...</p>
                    </div>
                )}
                {supplierDetailError && !isLoadingSupplierDetail && (
                    <div className="text-center py-10 h-[calc(100vh-100px)] flex flex-col justify-center items-center p-4">
                        <p className="text-red-500 font-semibold text-lg">خطأ!</p>
                        <p className="text-gray-600 mt-2">{supplierDetailError}</p>
                        <button onClick={() => setShowSupplierDetailModal(false)} className="mt-6 bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300">إغلاق</button>
                    </div>
                )}
                {!isLoadingSupplierDetail && !supplierDetailError && supplier && (
                    <>
                        {/* Supplier Banner/Image */}
                        <div 
                            className="w-full h-40 md:h-56 bg-gray-300 flex items-center justify-center text-white text-3xl font-bold"
                            style={supplier.image_url && supplier.image_url.startsWith('linear-gradient') ? 
                                   { background: supplier.image_url } : 
                                   supplier.image_url ? 
                                   { backgroundImage: `url(${supplier.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } :
                                   { background: 'linear-gradient(to right, #60a5fa, #3b82f6)' }} // Default gradient if no image
                        >
                            {!supplier.image_url && supplier.name.charAt(0)} {/* Show first letter if no image */}
                        </div>
                        
                        <div className="p-4 md:p-6 space-y-5">
                            {/* Basic Info */}
                            <div className="pb-4 border-b">
                                <h3 className="text-2xl font-bold text-gray-900">{supplier.name}</h3>
                                {supplier.category && <p className="text-md text-blue-600">{supplier.category}</p>}
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                    {supplier.location && <div className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-gray-500"/> {supplier.location}</div>}
                                    {supplier.rating && <div className="flex items-center gap-1.5"><Star className="h-4 w-4 text-yellow-400 fill-current"/> {supplier.rating} نجوم</div>}
                                </div>
                            </div>

                            {/* Description (if exists) */}
                            {supplier.description && (
                                <div className="prose prose-sm max-w-none"> {/* Use Tailwind Typography for nice text formatting */}
                                    <h4 className="text-md font-semibold text-gray-700 mb-1">عن المورد:</h4>
                                    <p>{supplier.description}</p>
                                </div>
                            )}

                            {/* Products from this Supplier */}
                            {supplier.products && supplier.products.length > 0 && (
                                <div>
                                    <h4 className="text-md font-semibold text-gray-700 mb-3">منتجات من هذا المورد ({supplier.totalProductsCount || supplier.products.length}):</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                        {supplier.products.map(prod => renderModalProductCard(prod))}
                                    </div>
                                    {supplier.hasMoreProducts && (
                                        <div className="text-center mt-4">
                                            <button 
                                                onClick={() => {
                                                     // --- START OF MODIFIED CODE ---
                setShowSupplierDetailModal(false); // Close current supplier modal
                
                const supplierNameForSearch = supplier.name; // Get the supplier's name
                
                // Set the global search term to the supplier's name
                // This will update the input field in the header
                setSearchTerm(supplierNameForSearch); 
                
                // Manually trigger the debounced search.
                // Your debouncedSearch function should handle the rest:
                // - Checking term length
                // - Setting loading states (isSearching)
                // - Setting showSearchResultsView = true
                // - Calling the API (/api/search?searchTerm=...)
                // - Updating searchResults or searchError
                debouncedSearch(supplierNameForSearch); 
                // --- END OF MODIFIED CODE ---
                                                }}
                                                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                                            >
                                                عرض كل المنتجات ({supplier.totalProductsCount})
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                            {supplier.products && supplier.products.length === 0 && (
                                <p className="text-sm text-gray-500">لا توجد منتجات معروضة من هذا المورد حالياً.</p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </motion.div>
    );
};
// Inside MainPanel component
// Inside MainPanel.jsx
const renderProductDetailModal = () => {
    if (!showProductDetailModal) return null;

    const product = selectedProductDetails;

    return (
        <motion.div
            key="productDetailModal" // Good practice for AnimatePresence
            initial={{ opacity: 0, y: "100vh" }} // Start from bottom of screen (or x: "100vw" for slide from right)
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100vh" }}   // Exit to bottom (or x: "100vw")
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            // Full screen styles:
            className="fixed inset-0 bg-white z-50 flex flex-col overflow-y-auto" // Changed background, removed centering
            dir="rtl"
        >
            {/* Modal Header (Fixed or part of scroll) */}
            <div className="sticky top-0 bg-white p-4 shadow-md z-10 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 truncate">
                    {isLoadingProductDetail ? "جاري التحميل..." : (product ? product.name : "تفاصيل المنتج")}
                </h2>
                <button 
                    onClick={() => setShowProductDetailModal(false)} 
                    className="text-gray-500 hover:text-gray-700 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-400" // Added focus style
                >
                    <X className="h-6 w-6" />
                </button>
            </div>

            {/* Modal Content - takes remaining space and scrolls */}
            <div className="flex-grow p-4 md:p-6"> {/* flex-grow allows this div to take available space */}
                {isLoadingProductDetail && (
                    <div className="flex justify-center items-center h-[calc(100vh-100px)]"> {/* Adjust height based on header */}
                        <p className="text-gray-500">جاري تحميل التفاصيل...</p>
                    </div>
                )}
                {productDetailError && !isLoadingProductDetail && (
                    <div className="text-center py-10 h-[calc(100vh-100px)] flex flex-col justify-center items-center">
                        <p className="text-red-500 font-semibold text-lg">خطأ!</p>
                        <p className="text-gray-600 mt-2">{productDetailError}</p>
                        <button
                            onClick={() => setShowProductDetailModal(false)}
                            className="mt-6 bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
                        >
                            إغلاق
                        </button>
                    </div>
                )}
                {!isLoadingProductDetail && !productDetailError && product && (
                    // Using a single column layout for simplicity, can be grid for wider screens
                    <div className="space-y-6">
                        {/* Image Section */}
                        <div 
                            className="w-full h-64 sm:h-72 md:h-80 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden shadow"
                            style={product.image_url && product.image_url.startsWith('linear-gradient') ? 
                                   { background: product.image_url } : 
                                   {}} // Apply gradient to div directly
                        >
                            {product.image_url && !product.image_url.startsWith('linear-gradient') ? (
                                <img src={product.image_url} alt={product.name} className="w-full h-full object-contain md:object-cover"/> // object-contain to see full image
                            ) : !product.image_url ? (
                                <span className="inline-block bg-gray-200 text-gray-600 text-sm font-medium px-4 py-2 rounded-md">
                                    لا توجد صورة
                                </span>
                            ) : null /* Gradient handled by parent div style */}
                        </div>

                        {/* Details Section */}
                        <div className="space-y-3">
                            {/* Styled Product Name (already done, ensure it's here) */}
                             <h1 className="inline-block bg-indigo-100 text-indigo-700 text-2xl md:text-3xl font-bold px-4 py-2 rounded-lg shadow-sm">
                                {product.name}
                            </h1>
                            
                            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                                {product.is_on_sale && product.discount_price && (
                                    <p className="text-xl text-gray-500 line-through">
                                        {parseFloat(product.price).toFixed(2)} د.إ
                                    </p>
                                )}
                                <p className="text-4xl font-extrabold text-blue-600">
                                    {parseFloat(product.is_on_sale && product.discount_price ? product.discount_price : product.price).toFixed(2)} د.إ
                                </p>
                            </div>

                            {product.category && <p className="text-md text-gray-600"><span className="font-medium">الفئة:</span> {product.category}</p>}
                            {product.supplier_name && <p className="text-md text-gray-600"><span className="font-medium">المورد:</span> <span className="text-blue-600">{product.supplier_name}</span></p>}
                            
                            {product.stock_level !== null && product.stock_level > 0 && <p className="text-sm text-green-600 font-medium">متوفر ({product.stock_level} قطعة)</p>}
                            {product.stock_level !== null && product.stock_level === 0 && <p className="text-sm text-red-500 font-medium">نفذت الكمية</p>}
                        </div>
                        
                        {/* Description */}
                        {product.description && (
                            <div className="border-t pt-4">
                                <h4 className="text-lg font-semibold text-gray-700 mb-2">الوصف:</h4>
                                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                                    <p>{product.description}</p> {/* Ensure prose styles apply */}
                                _</div>
                            </div>
                        )}
                        
                        {/* TODO: Add features list here if available from product data */}

                        {/* Action Buttons (Footer of content, or could be sticky footer for modal) */}
                        <div className="pt-6 border-t flex items-center gap-3">
                            <button
                                onClick={() => addToCart(product)}
                                disabled={product.stock_level === 0}
                                className="flex-grow bg-blue-500 text-white py-3.5 px-6 rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                            >
                                <ShoppingCart className="h-5 w-5" />
                                إضافة للسلة
                            </button>
                            <button
                                onClick={() => handleToggleFavorite(product.id)}
                                className="p-3.5 border border-gray-300 rounded-lg text-gray-600 hover:border-red-500 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-300 transition-colors"
                                aria-label="Toggle Favorite"
                            >
                                <Heart className={`h-6 w-6 ${userFavoriteProductIds.has(product.id) ? 'text-red-500 fill-red-500' : ''}`} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

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
// Inside MainPanel component

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
// Inside MainPanel.jsx
const renderOrderConfirmationModal = () => {
    if (!showOrderConfirmationModal || !confirmedOrderDetails) return null;

    return (
        <motion.div
            key="orderConfirmationModal"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            // Full screen, but content centered
            className="fixed inset-0 bg-green-500 z-50 flex flex-col items-center justify-center p-4 text-white" 
            dir="rtl"
        >
            <div className="text-center space-y-6 max-w-md">
                {/* Success Icon */}
                <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
                    className="mx-auto bg-white rounded-full h-20 w-20 flex items-center justify-center shadow-lg"
                >
                    <CheckCircle className="h-12 w-12 text-green-500" /> {/* lucide-react icon */}
                </motion.div>

                <motion.h2 
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
                    className="text-3xl font-bold"
                >
                    تم استلام طلبك بنجاح!
                </motion.h2>
                
                <motion.p 
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
                    className="text-lg"
                >
                    رقم طلبك هو: <span className="font-bold text-yellow-300">#{confirmedOrderDetails.orderId}</span>
                </motion.p>

                <motion.p 
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
                    className="text-md"
                >
                    سنتواصل معك قريباً لتأكيد تفاصيل التوصيل واستلام المبلغ. يمكنك متابعة حالة طلبك من قسم "طلباتي".
                </motion.p>

                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
                    <button
                        onClick={() => {
                            setShowOrderConfirmationModal(false);
                            setConfirmedOrderDetails(null);
                            // Optional: Navigate to 'My Orders' tab or close app
                            // setActiveSection('orders'); 
                            if (window.Telegram?.WebApp) {
                                 window.Telegram.WebApp.close(); // Or just keep app open
                            }
                        }}
                        className="mt-8 bg-white text-green-600 font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-gray-100 transition-colors text-lg"
                    >
                        حسنًا، فهمت!
                    </button>
                </motion.div>
            </div>
        </motion.div>
    );
};

// Inside MainPanel component
const renderDealDetailModal = () => {
    if (!showDealDetailModal) return null;

    const deal = selectedDealDetails;

    return (
        <motion.div
            key="dealDetailModal" // Add a key for AnimatePresence if used around the call
            initial={{ opacity: 0, y: "100vh" }} // Start from bottom of screen
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100vh" }} // Exit to bottom
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            // Full screen styles:
            className="fixed inset-0 bg-white z-50 flex flex-col overflow-y-auto"
            dir="rtl"
        >
            {/* Modal Header (Fixed or part of scroll) */}
            <div className="sticky top-0 bg-white p-4 shadow-md z-10 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 truncate">
                    {isLoadingDealDetail ? "جاري التحميل..." : (deal ? deal.title : "تفاصيل العرض")}
                </h2>
                <button onClick={() => setShowDealDetailModal(false)} className="text-gray-500 hover:text-gray-700 p-2">
                    <X className="h-6 w-6" />
                </button>
            </div>

            {/* Modal Content */}
            <div className="flex-grow p-4 md:p-6">
                {isLoadingDealDetail && (
                    <div className="flex justify-center items-center h-[calc(100vh-100px)]"> {/* Adjust height based on header */}
                        <p className="text-gray-500">جاري تحميل التفاصيل...</p>
                    </div>
                )}
                {dealDetailError && !isLoadingDealDetail && (
                    <div className="text-center py-10 h-[calc(100vh-100px)] flex flex-col justify-center items-center">
                        <p className="text-red-500 font-semibold text-lg">خطأ!</p>
                        <p className="text-gray-600 mt-2">{dealDetailError}</p>
                        <button
                            onClick={() => setShowDealDetailModal(false)}
                            className="mt-6 bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
                        >
                            إغلاق
                        </button>
                    </div>
                )}
                {!isLoadingDealDetail && !dealDetailError && deal && (
                    <div className="space-y-6">
                        {/* Deal Image/Banner */}
                        <div 
                            className="w-full h-48 md:h-64 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden"
                            style={deal.image_url && deal.image_url.startsWith('linear-gradient') ? { background: deal.image_url } : {}}
                        >
                            {deal.image_url && !deal.image_url.startsWith('linear-gradient') ? (
                                <img src={deal.image_url} alt={deal.title} className="w-full h-full object-cover"/>
                            ) : !deal.image_url && ( // Only show this if no image_url and not a gradient
                                <span className="text-gray-400">لا توجد صورة للعرض</span>
                            )}
                            {/* If it's a gradient, the background is applied to the div, nothing else needed here */}
                        </div>

                        {/* Deal Info */}
                        <div>
                            {deal.discount_percentage && (
                                <p className="text-3xl font-extrabold text-red-600 mb-2">
                                    خصم {deal.discount_percentage}%
                                </p>
                            )}
                            <p className="text-gray-700 leading-relaxed mb-4">{deal.description || "لا توجد تفاصيل إضافية لهذا العرض."}</p>
                            
                            <div className="text-sm text-gray-600 space-y-1">
                                {deal.start_date && (
                                    <p>يبدأ في: <span className="font-medium">{new Date(deal.start_date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
                                )}
                                {deal.end_date && (
                                    <p>ينتهي في: <span className="font-medium">{new Date(deal.end_date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
                                )}
                            </div>
                        </div>

                        {/* Linked Product Info (if any) */}
                        {deal.product_id && deal.product_name && (
                            <div className="border-t pt-4">
                                <h4 className="text-md font-semibold text-gray-700 mb-2">المنتج المرتبط بالعرض:</h4>
                                <div 
                                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                                    onClick={() => {
                                        setShowDealDetailModal(false); // Close this modal
                                        handleShowProductDetails(deal.product_id); // Open product detail modal
                                    }}
                                >
                                    {deal.product_image_url && (
                                        <img 
                                            src={deal.product_image_url.startsWith('linear-gradient') ? undefined : deal.product_image_url}
                                            style={deal.product_image_url.startsWith('linear-gradient') ? { background: deal.product_image_url, width: '48px', height: '48px', borderRadius: '0.25rem' } : {width: '48px', height: '48px', borderRadius: '0.25rem', objectFit: 'cover'}}
                                            alt={deal.product_name}
                                            className="w-12 h-12 rounded object-cover flex-shrink-0"
                                        />
                                    )}
                                    {/* Product Name and Price Info */}
            <div className="flex-grow">
                <p className="font-semibold text-blue-700 hover:text-blue-800 text-base mb-1">{deal.product_name}</p>
                
                {/* Display product price information if available */}
                {(typeof deal.product_price !== 'undefined') && ( // Check if price info is present
                    <div className="text-xs">
                        {deal.product_is_on_sale && deal.product_discount_price && (
                            <span className="text-gray-500 line-through mr-1.5">
                                {parseFloat(deal.product_price).toFixed(2)} د.إ
                            </span>
                        )}
                        <span className="font-bold text-gray-700">
                            {parseFloat(
                                deal.product_is_on_sale && deal.product_discount_price 
                                ? deal.product_discount_price 
                                : deal.product_price
                            ).toFixed(2)} د.إ
                        </span>
                        {/* You could also add a small "View Product Details" text/icon here if the whole block isn't clickable enough */}
                    </div>
                )}
            </div>
            {/* Optional: Arrow or indicator for clickability */}
            <ChevronLeftIcon className="h-5 w-5 text-gray-400 hidden sm:block flex-shrink-0" /> {/* For LTR, use ChevronRightIcon. Adjust for RTL or use a generic "view" icon */}
    
                                </div>
                            </div>
                        )}

                        {/* Linked Supplier Info (if any) */}
                        {deal.supplier_id && deal.supplier_name && (
                            <div className="border-t pt-4">
                                <h4 className="text-md font-semibold text-gray-700 mb-2">مقدم من المورد:</h4>
                                {/* TODO: Later, make this clickable to open supplier detail modal */}
                                <p className="p-3 bg-gray-50 rounded-lg text-blue-600 font-medium">{deal.supplier_name}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
};
    return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
        {/* Header */}
        <div className="bg-white sticky top-0 z-30 shadow-sm"> {/* z-index lower for header */}
            <div className="p-4 max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold text-gray-800">معرض المستلزمات الطبية</h1>
                    {/* Shopping Cart icon in header - consider if still needed with mini cart bar */}
                    <button
                        onClick={() => setShowCart(true)}
                        className="relative p-2 text-gray-600 hover:text-blue-600"
                    >
                        <ShoppingCart className="h-6 w-6" />
                        {cartItems.length > 0 && ( // Assuming cartItems is your cart state
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                                {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                            </span>
                        )}
                    </button>
                </div>

                {/* Search Bar - Global and Interactive */}
                <div className="relative mb-4">
                    <input
                        type="text"
                        placeholder="ابحث عن منتجات, عروض, أو موردين..."
                        value={searchTerm}
                        onChange={handleSearchInputChange}
                        className="w-full pl-4 pr-16 py-2.5 border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent text-sm" // RTL: pl-4 for text, pr-16 for 2 icons
                    />
                    {searchTerm && (
                        <button
                            onClick={clearSearch}
                            className="absolute right-10 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 focus:outline-none"
                            aria-label="Clear search"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>

                {/* Navigation Tabs - Only show if NOT in search results view */}
                {!showSearchResultsView && (
                    <div className="flex gap-2 border-b border-gray-200">
                        {/* Added 'favorites' and 'orders' to the tabs array */}
                        {['exhibitions', 'products', 'suppliers', 'favorites', 'orders'].map(section => (
                            <button
                                key={section}
                                onClick={() => {
                                    setActiveSection(section);
                                    // When a tab is clicked, ensure we are not in search view
                                    // setShowSearchResultsView(false); // This might be too aggressive, let clearSearch handle it.
                                }}
                                className={`flex-1 py-3 text-center text-sm font-medium transition-colors duration-200 ${
                                    activeSection === section
                                        ? 'border-b-2 border-blue-500 text-blue-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {section === 'exhibitions' && 'العروض'}
                                {section === 'products' && 'المنتجات'}
                                {section === 'suppliers' && 'الموردون'}
                                {section === 'favorites' && 'المفضلة'}
                                {section === 'orders' && 'طلباتي'}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* Main Content Area: Conditional Rendering for Search Results or Tabbed Content */}
        <div className="p-4 max-w-4xl mx-auto pb-24">
            {showSearchResultsView ? (
                // --- Render Search Results View ---
                <div className="search-results-container mt-4">
                    {isSearching && <p className="text-center text-gray-500 py-10">جاري البحث عن "{searchTerm}"...</p>}
                    {searchError && <p className="text-center text-red-500 py-10">خطأ في البحث: {searchError}</p>}

                    {!isSearching && !searchError && (
                         ( (searchResults.products?.items?.length === 0 || !searchResults.products?.items) && // Corrected check
      (searchResults.deals?.length === 0 || !searchResults.deals) &&
      (searchResults.suppliers?.length === 0 || !searchResults.suppliers) &&
      searchTerm.trim().length >=3 
    ) ? (
        <div className="text-center text-gray-500 py-10">
            <Search className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-lg">لا توجد نتائج لـ "{searchTerm}"</p>
            <p className="text-sm">جرب تعديل كلمة البحث.</p>
        </div>
                        ) : (
                            <div className="space-y-8"> {/* Space between result categories */}
                                {/* Products Search Results */}
                               {searchResults.products && searchResults.products.items && searchResults.products.items.length > 0 ? ( // CORRECTED CONDITION
    <section>
        <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-1">
            المنتجات ({searchResults.products.totalItems || searchResults.products.items.length}) {/* CORRECTED COUNT */}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
            {searchResults.products.items.map(product => ( // CORRECTED MAP
                <motion.div
                    key={`search-prod-${product.id}`}
                    className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer flex flex-col z-0"
                    whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
                    onClick={() => handleShowProductDetails(product.id)}
                >
                    <div className="h-32 w-full flex items-center justify-center text-white relative bg-gray-200" style={{ background: product.image_url || 'linear-gradient(to right, #d1d5db, #9ca3af)' }}>
                        {product.is_on_sale && (<div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">تخفيض</div>)}
                        <button onClick={(e) => { e.stopPropagation(); handleToggleFavorite(product.id);}} className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white rounded-full shadow-sm z-10">
                            <Heart className={`h-5 w-5 ${userFavoriteProductIds.has(product.id) ? 'text-red-500 fill-red-500' : 'text-gray-400 hover:text-gray-600'}`}/>
                        </button>
                    </div>
                    <div className="p-3 flex flex-col flex-grow">
                        <h4 className="font-semibold text-sm mb-1 text-gray-800 flex-grow min-h-[2.5em] line-clamp-2">{product.name}</h4>
                        <div className="flex items-end justify-between mt-auto">
                            <div>
                                {product.is_on_sale && product.discount_price && (<span className="text-xs line-through text-gray-400 mr-1">{parseFloat(product.price).toFixed(2)} د.إ</span>)}
                                <div className="text-blue-600 font-bold text-base">{parseFloat(product.is_on_sale && product.discount_price ? product.discount_price : product.price).toFixed(2)} د.إ</div>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); addToCart(product);}} className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-500 hover:text-white">
                                <ShoppingCart className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
        {/* TODO: Add pagination controls here for searchResults.products if totalPages > 1 */}
    </section>
) : (
    // Optional: Only show "no products match" if a search was made and other results might exist
    // This condition needs to be careful not to show if deals/suppliers *were* found.
    // The outer "no results for searchTerm" handles the case where everything is empty.
    // So, if searchResults.products.items is empty, this section just won't render, which is fine.
    // If you want a specific "No products found for this search, but here are deals..." message,
    // you'd add an else here, but only if searchTerm is active.
    null 

                                )}

                                {/* Deals Search Results */}
                                {searchResults.deals.length > 0 && (
                                    <section>
                                        <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-1">العروض ({searchResults.deals.length})</h3>
                                        <div className="space-y-4 pt-2">
                                            {searchResults.deals.map(deal => (
                                                // **YOUR ACTUAL DEAL CARD COMPONENT/JSX HERE**
                                                // Example: <DealCard key={deal.id} deal={deal} />
                                                <motion.div key={`search-deal-${deal.id}`} className="bg-white rounded-xl shadow-md overflow-hidden" whileHover={{ scale: 1.02 }} onClick={() => handleShowDealDetails(deal.id)}>
                                                    <div className="h-36 w-full flex items-center justify-center text-white p-4" style={{ background: deal.image_url || 'linear-gradient(to right, #f59e0b, #d97706)' }}>
                                                        <div className="text-center">
                                                          <div className="text-3xl font-bold mb-1">{deal.discount_percentage ? `خصم ${deal.discount_percentage}%` : 'عرض خاص'}</div>
                                                          <div className="text-sm opacity-90">{deal.title}</div>
                                                        </div>
                                                    </div>
                                                     {/* You might want to add more deal info here from deal object */}
                                                </motion.div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Suppliers Search Results */}
                                {searchResults.suppliers.length > 0 && (
                                    <section>
                                        <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-1">الموردون ({searchResults.suppliers.length})</h3>
                                        <div className="space-y-4 pt-2">
                                            {searchResults.suppliers.map(supplier => (
                                                // **YOUR ACTUAL SUPPLIER CARD COMPONENT/JSX HERE**
                                                // Example: <SupplierCard key={supplier.id} supplier={supplier} />
                                                <motion.div key={`search-supp-${supplier.id}`} className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer" whileHover={{ scale: 1.02 }} onClick={() => handleShowSupplierDetails(supplier.id)}>
                                                    <div className="h-24 w-full flex items-center justify-center text-white" style={{ background: supplier.image_url || 'linear-gradient(to right, #3b82f6, #1d4ed8)' }}><h4 className="text-lg font-bold">{supplier.name}</h4></div>
                                                    <div className="p-4">
                                                        <div className="flex items-center justify-between mb-2 text-sm"><span className="text-gray-600">{supplier.category || 'غير مصنف'}</span>{supplier.rating && (<div className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-400 fill-current"/><span>{supplier.rating}</span></div>)}</div>
                                                        <div className="flex items-center text-sm text-gray-600 gap-1"><MapPin className="h-4 w-4"/><span>{supplier.location || 'غير محدد'}</span></div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </div>
                        )
                    )}
                </div>
            ) : (
                // --- Render Regular Tabbed Content ---
                <>
                    {activeSection === 'exhibitions' && (
                        <div className="space-y-4"> {/* Your Deals Tab Content */}
                            <h2 className="text-xl font-bold mb-4 text-gray-800">العروض المميزة</h2>
                            {/* TODO: Replace with fetchedDeals.map(...) when deals are fetched */}
                            {isLoadingDeals && <p className="text-center">جاري تحميل العروض ...</p>}
                            {dealError && <p className="text-center text-red-500">{dealError}</p>}
                            {!isLoadingDeals && !dealError && fetchedDeals.length === 0 && <p className="text-center">No deals available.</p>}
                            {!isLoadingDeals && !dealError && fetchedDeals.map(deal => (
                                // Your Deal Card for the Deals Tab
                                <motion.div key={`tab-deal-${deal.id}`} className="bg-white rounded-xl shadow-md overflow-hidden" whileHover={{ scale: 1.02 }}  onClick={() => handleShowDealDetails(deal.id)}>
                                    <div className="h-36 w-full flex items-center justify-center text-white p-4" style={{ background: deal.image_url || 'linear-gradient(to right, #f59e0b, #d97706)' }}>
                                         <div className="text-center">
                                            <div className="text-3xl font-bold mb-1">{deal.discount_percentage ? `خصم ${deal.discount_percentage}%` : 'عرض خاص'}</div>
                                            <div className="text-sm opacity-90">{deal.title}</div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gray-50"><div className="flex items-center justify-between text-sm text-gray-600"><span>{deal.supplier_name || 'المنصة'}</span><div className="flex items-center gap-1"><Clock className="h-4 w-4" /><span>ينتهي في {new Date(deal.end_date).toLocaleDateString()}</span></div></div></div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                    {activeSection === 'products' && (
                        // Your existing Products Tab Content (with pagination)
                        // This should be the JSX you provided earlier for the paginated product list
                        // Make sure it uses `fetchedProducts`, `handleLoadMoreProducts`, `isLoadingProducts`, etc.
                        // It starts with: <div className="space-y-4"> <h2 ...>المنتجات المعروضة</h2> ... </div>
                        <div className="space-y-4">
                             <h2 className="text-xl font-bold mb-4 text-gray-800">المنتجات المعروضة</h2>
                             {isLoadingProducts && (<div className="flex justify-center items-center h-40"><p>جار تحميل المنتجات...</p></div>)}
                             {productError && !isLoadingProducts && (<div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg text-center"><span className="font-medium">خطأ!</span> {productError}</div>)}
                             {!isLoadingProducts && !productError && (
                                 <>
                                     {fetchedProducts.length > 0 ? (
                                         <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                             {fetchedProducts.map(product => (
                                                 // Your Product Card from previous step
                                                 <motion.div key={`tab-prod-${product.id}`} className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer flex flex-col z-0" whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)' }} onClick={() => handleShowProductDetails(product.id)} // MODIFIED
>
                                                     <div className="h-32 w-full flex items-center justify-center text-white relative bg-gray-200" style={{ background: product.image_url || 'linear-gradient(to right, #d1d5db, #9ca3af)' }}>
                                                         {product.is_on_sale && (<div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">تخفيض</div>)}
                                                    
                                                         <button onClick={(e) => { e.stopPropagation(); handleToggleFavorite(product.id);}} className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white rounded-full shadow-sm z-10"><Heart className={`h-5 w-5 ${userFavoriteProductIds.has(product.id) ? 'text-red-500 fill-red-500' : 'text-gray-400 hover:text-gray-600'}`}/></button>
                                                     </div>
                                                     <div className="p-3 flex flex-col flex-grow">
                                                         <h3 className="font-semibold text-sm mb-1 text-gray-800 flex-grow min-h-[2.5em] line-clamp-2">{product.name}</h3>
                                                         <div className="flex items-end justify-between mt-auto">
                                                             <div>
                                                                 {product.is_on_sale && product.discount_price && (<span className="text-xs line-through text-gray-400 mr-1">{parseFloat(product.price).toFixed(2)} د.إ</span>)}
                                                                 <div className="text-blue-600 font-bold text-base">{parseFloat(product.is_on_sale && product.discount_price ? product.discount_price : product.price).toFixed(2)} د.إ</div>
                                                             </div>
                                                             <button onClick={(e) => { e.stopPropagation(); addToCart(product);}} className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-500 hover:text-white"><ShoppingCart className="h-4 w-4" /></button>
                                                         </div>
                                                     </div>
                                                 </motion.div>
                                             ))}
                                         </div>
                                     ) : (<div className="text-center text-gray-500 py-10"><Search className="h-12 w-12 mx-auto text-gray-400 mb-3" /><p className="text-lg">لا توجد منتجات.</p></div>)}
                                     {fetchedProducts.length > 0 && currentProductPage < totalProductPages && !isLoadingMoreProducts && (<div className="text-center mt-8 mb-4"><button onClick={handleLoadMoreProducts} className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2.5 px-8 rounded-lg">تحميل المزيد</button></div>)}
                                     {isLoadingMoreProducts && (<div className="flex justify-center items-center h-20 mt-4"><p>جاري تحميل المزيد...</p></div>)}
                                 </>
                             )}
                        </div>
                    )}
                    {activeSection === 'suppliers' && (
                        <div className="space-y-4"> {/* Your Suppliers Tab Content */}
                             <h2 className="text-xl font-bold mb-4 text-gray-800">الموردون المشاركون</h2>
                             {isLoadingSuppliers && <p className="text-center">جاري تحميل الموردين...</p>}
                             {supplierError && <p className="text-center text-red-500">{supplierError}</p>}
                             {!isLoadingSuppliers && !supplierError && fetchedSuppliers.length === 0 && <p className="text-center">No suppliers available.</p>}
                             {!isLoadingSuppliers && !supplierError && fetchedSuppliers.map(supplier => (
                                // Your Supplier Card for the Suppliers Tab
                                <motion.div key={`tab-supp-${supplier.id}`} className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer" whileHover={{ scale: 1.02 }} onClick={() => handleShowSupplierDetails(supplier.id)}>
                                    <div className="h-24 w-full flex items-center justify-center text-white" style={{ background: supplier.image_url || 'linear-gradient(to right, #3b82f6, #1d4ed8)' }}><h3 className="text-lg font-bold">{supplier.name}</h3></div>
                                    <div className="p-4">
                                         <div className="flex items-center justify-between mb-2 text-sm"><span className="text-gray-600">{supplier.category || 'غير مصنف'}</span>{supplier.rating && (<div className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-400 fill-current"/><span>{supplier.rating}</span></div>)}</div>
                                         <div className="flex items-center text-sm text-gray-600 gap-1"><MapPin className="h-4 w-4"/><span>{supplier.location || 'غير محدد'}</span></div>
                                    </div>
                                </motion.div>
                             ))}
                        </div>
                    )}
                    {activeSection === 'favorites' && ( /* Placeholder for Favorites tab */
                         <div className="space-y-4">
        <h2 className="text-xl font-bold mb-4 text-gray-800">المفضلة</h2>

        {isLoadingFavoritesTab && (
            <div className="flex justify-center items-center h-40">
                <p className="text-gray-500">جاري تحميل المفضلة...</p>
            </div>
        )}

        {favoritesTabError && !isLoadingFavoritesTab && (
            <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg text-center" role="alert">
                <span className="font-medium">خطأ!</span> لا يمكن تحميل قائمة المفضلة.
                <p className="text-xs mt-1">{favoritesTabError}</p>
            </div>
        )}

        {!isLoadingFavoritesTab && !favoritesTabError && (
            <>
                {fetchedFavoriteProducts.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {fetchedFavoriteProducts.map(product => (
                            // ** REUSE YOUR ProductCard COMPONENT/JSX HERE **
                            // Pass all necessary props: product, userFavoriteProductIds, 
                            // handleToggleFavorite, addToCart, handleShowProductDetails
                            <motion.div
                                key={`fav-prod-${product.id}`}
                                className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer flex flex-col z-0"
                                whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)' }}
                                onClick={() => handleShowProductDetails(product.id)}
                            >
                                <div className="h-32 w-full flex items-center justify-center text-white relative bg-gray-200" style={{ background: product.image_url || 'linear-gradient(to right, #d1d5db, #9ca3af)' }}>
                                    {product.is_on_sale && (<div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">تخفيض</div>)}
                                    <button onClick={(e) => { e.stopPropagation(); handleToggleFavorite(product.id);}} className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white rounded-full shadow-sm z-10"><Heart className={`h-5 w-5 ${userFavoriteProductIds.has(product.id) ? 'text-red-500 fill-red-500' : 'text-gray-400 hover:text-gray-600'}`}/></button>
                                </div>
                                <div className="p-3 flex flex-col flex-grow">
                                    <h3 className="font-semibold text-sm mb-1 text-gray-800 flex-grow min-h-[2.5em] line-clamp-2">{product.name}</h3>
                                    <div className="flex items-end justify-between mt-auto">
                                        <div>
                                            {product.is_on_sale && product.discount_price && (<span className="text-xs line-through text-gray-400 mr-1">{parseFloat(product.price).toFixed(2)} د.إ</span>)}
                                            <div className="text-blue-600 font-bold text-base">{parseFloat(product.is_on_sale && product.discount_price ? product.discount_price : product.price).toFixed(2)} د.إ</div>
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); addToCart(product);}} className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-500 hover:text-white"><ShoppingCart className="h-4 w-4" /></button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-10">
                        <Heart className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                        <p className="text-lg">قائمة المفضلة فارغة.</p>
                        <p className="text-sm">أضف منتجات تعجبك بالضغط على أيقونة القلب!</p>
                    </div>
                )}
            </>
        )}
    </div>
                
                    )}
                    {activeSection === 'orders' && ( 
                         <div className="space-y-6"> {/* Increased space between order cards */}
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">طلباتي</h2>

        {isLoadingOrdersTab && (
            <div className="flex justify-center items-center h-40">
                <p className="text-gray-500">جاري تحميل الطلبات...</p>
                {/* You can add a spinner icon here */}
            </div>
        )}

        {ordersTabError && !isLoadingOrdersTab && (
            <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg text-center" role="alert">
                <span className="font-medium">خطأ!</span> لا يمكن تحميل قائمة الطلبات.
                <p className="text-xs mt-1">{ordersTabError}</p>
            </div>
        )}

        {!isLoadingOrdersTab && !ordersTabError && (
            <>
                {fetchedOrders.length > 0 ? (
                    fetchedOrders.map(order => (
                        <div key={order.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className="bg-gray-100 p-4 border-b border-gray-200">
                                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                    <div>
                                        <p className="text-sm text-gray-500">طلب رقم: <span className="font-semibold text-gray-700">#{order.id}</span></p>
                                        <p className="text-sm text-gray-500">تاريخ الطلب: <span className="font-medium text-gray-700">{new Date(order.order_date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">الحالة:
                                            <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium
                                                ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                  order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                                  order.status === 'shipped' ? 'bg-indigo-100 text-indigo-800' :
                                                  order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                  order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                  'bg-gray-100 text-gray-800'}`}>
                                                {/* Translate status if needed */}
                                                {order.status === 'pending' ? 'قيد الانتظار' :
                                                 order.status === 'confirmed' ? 'مؤكد' :
                                                 order.status === 'shipped' ? 'تم الشحن' :
                                                 order.status === 'delivered' ? 'تم التوصيل' :
                                                 order.status === 'cancelled' ? 'ملغى' :
                                                 order.status}
                                            </span>
                                        </p>
                                        <p className="text-lg font-bold text-blue-600 mt-1">{parseFloat(order.total_amount).toFixed(2)} د.إ</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-4 space-y-3">
                                <h4 className="text-md font-semibold text-gray-700">المنتجات:</h4>
                                {order.items && order.items.length > 0 ? (
                                    <ul className="space-y-2 text-sm">
                                        {order.items.map(item => (
                                            <li key={item.product_id} className="flex justify-between items-center pb-1 border-b border-gray-100 last:border-b-0">
                                                <div className="flex items-center gap-2">
                                                    {item.product_image_url && !item.product_image_url.startsWith('linear-gradient') && (
                                                        <img src={item.product_image_url} alt={item.product_name} className="w-10 h-10 rounded object-cover" />
                                                    )}
                                                    {item.product_image_url && item.product_image_url.startsWith('linear-gradient') && (
                                                        <div className="w-10 h-10 rounded" style={{ background: item.product_image_url }}></div>
                                                    )}
                                                    {!item.product_image_url && (
                                                        <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center text-gray-400"><ShoppingCart className="w-5 h-5" /></div>
                                                    )}
                                                    <span>{item.product_name} <span className="text-gray-500">(x{item.quantity})</span></span>
                                                </div>
                                                <span className="font-medium text-gray-600">{parseFloat(item.price_at_time_of_order).toFixed(2)} د.إ</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-500">لا توجد تفاصيل للمنتجات.</p>
                                )}
                                {/* TODO LATER: Add a button/link to "View Order Details" that could open a modal with more info like delivery address used */}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-gray-500 py-10">
                        <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-3" /> {/* Or ListOrdered icon */}
                        <p className="text-lg">لا توجد لديك طلبات حتى الآن.</p>
                        <p className="text-sm">ابدأ التسوق لإضافة أول طلب لك!</p>
                    </div>
                )}
            </>
        )}
    </div>
                    )}
                </>
            )}
        </div>

        {/* Mini Cart Summary Bar */}
        <AnimatePresence>
            {renderMiniCartBar()}
        </AnimatePresence>

        {/* Full Cart Sidebar */}
        <AnimatePresence>
            {showCart && renderCart()}
        </AnimatePresence>

        {/* Address Modal - Using your provided structure */}
        {showAddressModal && (
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
                        <button onClick={() => { setShowAddressModal(false); setIsCheckingOut(false); /* Reset relevant loading state */ }} className="text-gray-500 hover:text-gray-800">
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    {profileError && <p className="text-red-500 text-sm mb-3 text-center">{profileError}</p>}
                    <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(addressFormData); }} className="space-y-4"> {/* Ensure handleSaveProfile is called with addressFormData */}
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
                            <input type="text" name="fullName" id="fullName" required value={addressFormData.fullName} onChange={handleAddressFormChange} className="w-full p-2 border border-gray-300 rounded-md"/>
                        </div>
                        <div>
                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                            <input type="tel" name="phoneNumber" id="phoneNumber" required value={addressFormData.phoneNumber} onChange={handleAddressFormChange} className="w-full p-2 border border-gray-300 rounded-md"/>
                        </div>
                        <div>
                            <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 mb-1">العنوان (سطر ١)</label>
                            <input type="text" name="addressLine1" id="addressLine1" required value={addressFormData.addressLine1} onChange={handleAddressFormChange} className="w-full p-2 border border-gray-300 rounded-md"/>
                        </div>
                        <div>
                            <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 mb-1">العنوان (سطر ٢) (اختياري)</label>
                            <input type="text" name="addressLine2" id="addressLine2" value={addressFormData.addressLine2} onChange={handleAddressFormChange} className="w-full p-2 border border-gray-300 rounded-md"/>
                        </div>
                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">المدينة</label>
                            <input type="text" name="city" id="city" required value={addressFormData.city} onChange={handleAddressFormChange} className="w-full p-2 border border-gray-300 rounded-md"/>
                        </div>
                        <button
                            type="submit"
                            disabled={isSavingProfile || isPlacingOrder /* check appropriate loading state */}
                            className="w-full bg-green-500 text-white py-2.5 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
                        >
                            {isSavingProfile ? "جار الحفظ..." : "حفظ ومتابعة"} {/* Use isSavingProfile from state */}
                        </button>
                    </form>
                </div>
            </motion.div>
            
        )}
        
{/* --- ADD THIS LINE IF IT'S MISSING --- */}
            {renderProductDetailModal()} 

 {/* --- NEW: Render Deal Detail Modal --- */}
    {renderDealDetailModal()}

    <AnimatePresence>
    {showProductDetailModal && renderProductDetailModal()}
    {showDealDetailModal && renderDealDetailModal()}
    {/* other modals with their show state */}
</AnimatePresence>

{/* --- NEW: Render Supplier Detail Modal --- */}
    {renderSupplierDetailModal()} 

    <AnimatePresence>
    {showSupplierDetailModal && renderSupplierDetailModal()}
</AnimatePresence>

 {/* --- NEW: Render Order Confirmation Modal --- */}
    <AnimatePresence>
        {showOrderConfirmationModal && renderOrderConfirmationModal()}
    </AnimatePresence>

    </div>
)};

export default MainPanel;