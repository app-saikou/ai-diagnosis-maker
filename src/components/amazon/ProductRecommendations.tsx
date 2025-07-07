import { useEffect, useState } from 'react';
import { ShoppingBag, Loader2, AlertCircle } from 'lucide-react';

interface Product {
  title: string;
  image: string;
  url: string;
  price: string;
}

interface ProductRecommendationsProps {
  keywords: string;
}

const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({ keywords }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      console.log('Fetching products with keywords:', keywords);
      setIsLoading(true);
      setError(null);

      try {
        const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-amazon-products?keywords=${encodeURIComponent(keywords)}`;
        console.log('API URL:', apiUrl);

        const response = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('API response:', data);

        if (data.error) {
          throw new Error(data.error);
        }

        if (data.items) {
          console.log('Found products:', data.items.length);
          setProducts(data.items);
        } else {
          console.warn('No items in response');
          setProducts([]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setError(error instanceof Error ? error.message : '商品の取得中にエラーが発生しました');
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (keywords) {
      fetchProducts();
    }
  }, [keywords]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden mt-8">
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
            <span className="ml-3 text-gray-600">関連商品を検索中...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden mt-8">
        <div className="p-6">
          <div className="flex items-center justify-center py-8 text-red-600">
            <AlertCircle className="h-6 w-6 mr-2" />
            <span>{error}</span>
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden mt-8">
        <div className="p-6">
          <div className="flex items-center justify-center py-8 text-gray-600">
            <ShoppingBag className="h-6 w-6 mr-2" />
            <span>関連商品が見つかりませんでした</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mt-8">
      <div className="p-6">
        <div className="flex items-center mb-6">
          <ShoppingBag className="h-5 w-5 text-primary-600 mr-2" />
          <h3 className="text-lg font-semibold">そんなあなたにおすすめのアイテム</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <a
              key={index}
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block bg-gray-50 rounded-lg p-4 transition-transform hover:-translate-y-1"
            >
              <div className="aspect-square rounded-lg overflow-hidden bg-white mb-4">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-contain"
                />
              </div>
              <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 group-hover:text-primary-600">
                {product.title}
              </h4>
              <p className="text-primary-600 font-semibold">
                {product.price}
              </p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductRecommendations;