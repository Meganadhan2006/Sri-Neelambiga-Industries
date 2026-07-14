import { useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { getOptimizedImageUrl } from '../../utils/imageOptimizer';
import { useSyncRefetch } from '../../utils/sync';

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useSyncRefetch(fetchProducts, 'products_updated');

  const filteredProducts = products.filter(product => {
    return (
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.material.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-primary py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-extrabold text-text-main mb-3 tracking-tight">
            Our Products
          </h1>
          <div className="w-16 h-1 bg-brand-accent mx-auto rounded-full mb-4"></div>
          <p className="text-base text-text-muted max-w-xl mx-auto leading-relaxed">
            Explore our extensive range of high-quality stainless steel products designed for durability and elegance.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-10 items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted h-5 w-5" />
            <input
              type="text"
              placeholder="Search products by name, description, material..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-pill"
            />
          </div>
          <div className="text-xs text-text-muted font-medium">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-accent"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-border-main p-8">
            <p className="text-text-muted mb-2">No products found matching your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="card-premium card-premium-hover flex flex-col group overflow-hidden"
              >
                <div className="relative h-56 overflow-hidden bg-secondary">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={getOptimizedImageUrl(product.images[0].secure_url, 600)}
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted text-sm">
                      No Image Available
                    </div>
                  )}
                </div>
                <div className="p-5 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-text-main mb-1.5 line-clamp-1 group-hover:text-brand-accent transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-text-muted text-xs mb-4 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                  <div>
                    <div className="space-y-1.5 mb-5 text-xs">
                      <div className="flex justify-between border-b border-border-main/50 pb-1.5">
                        <span className="text-text-muted">Material</span>
                        <span className="font-semibold text-text-main">{product.material}</span>
                      </div>
                      <div className="flex justify-between pb-1">
                        <span className="text-text-muted">Finish</span>
                        <span className="font-semibold text-text-main">{product.finish}</span>
                      </div>
                      {product.dimensions && (
                        <div className="flex justify-between pt-1 border-t border-border-main/30">
                          <span className="text-text-muted">Dimensions</span>
                          <span className="font-medium text-text-main truncate max-w-[120px]">{product.dimensions}</span>
                        </div>
                      )}
                    </div>
                    <Link
                      to={`/contact?product=${encodeURIComponent(product.name)}`}
                      className="flex w-full justify-center items-center btn-pill-secondary shadow-xs"
                    >
                      Request Quote
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;