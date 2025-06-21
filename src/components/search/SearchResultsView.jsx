// src/components/search/SearchResultsView.jsx
import React from 'react';
import { Search } from 'lucide-react';
import ProductCard from '../common/ProductCard';
import DealCard from '../common/DealCard';
import SupplierCard from '../common/SupplierCard';

const SearchResultsView = ({ searchTerm, isSearching, error, results, onShowProductDetails, onShowDealDetails, onShowSupplierDetails, onAddToCart, onToggleFavorite, userFavoriteProductIds }) => {
    if (isSearching) {
        return <p className="text-center text-gray-500 py-10">جاري البحث عن "{searchTerm}"...</p>;
    }
    if (error) {
        return <p className="text-center text-red-500 py-10">خطأ في البحث: {error}</p>;
    }

    const noResults = !results.products?.items?.length && !results.deals?.length && !results.suppliers?.length;

    if (noResults && searchTerm.trim().length >= 3) {
        return (
            <div className="text-center text-gray-500 py-10">
                <Search className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p className="text-lg">لا توجد نتائج لـ "{searchTerm}"</p>
                <p className="text-sm">جرب تعديل كلمة البحث.</p>
            </div>
        );
    }
 console.log('[DEBUG] Rendering SearchResults with data:', results);

    return (
        <div className="space-y-8 mt-4">
            {results.products?.items?.length > 0 && (
                <section>
                    <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-1">المنتجات ({results.products.totalItems})</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                        {results.products.items.map(product => (
                            <ProductCard key={`search-prod-${product.id}`} product={product} onShowDetails={onShowProductDetails} onAddToCart={onAddToCart} onToggleFavorite={onToggleFavorite} isFavorite={userFavoriteProductIds.has(product.id)} />
                        ))}
                    </div>
                </section>
            )}
            {results.deals?.length > 0 && (
                <section>
                    <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-1">العروض ({results.deals.length})</h3>
                    <div className="space-y-4 pt-2">
                        {results.deals.map(deal => (
                            <DealCard key={`search-deal-${deal.id}`} deal={deal} onShowDetails={onShowDealDetails} />
                        ))}
                    </div>
                </section>
            )}
            {results.suppliers?.length > 0 && (
                <section>
                    <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-1">الموردون ({results.suppliers.length})</h3>
                    <div className="space-y-4 pt-2">
                        {results.suppliers.map(supplier => (
                            <SupplierCard key={`search-supp-${supplier.id}`} supplier={supplier} onShowDetails={onShowSupplierDetails} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default SearchResultsView;