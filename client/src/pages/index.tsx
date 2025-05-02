import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Link from 'next/link';
import { GetStaticProps } from 'next';

type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  categoryId: string;
};

type CategoryWithProducts = {
  id: string;
  name: string;
  slug: string;
  products: Product[];
};

// This would normally come from getStaticProps or getServerSideProps
const SAMPLE_CATEGORIES: CategoryWithProducts[] = [
  {
    id: '1',
    name: 'Electronics',
    slug: 'electronics',
    products: [
      { id: '101', name: 'Wireless Earbuds', price: 79.99, imageUrl: '/placeholder.jpg', categoryId: '1' },
      { id: '102', name: 'Smart Watch', price: 149.99, imageUrl: '/placeholder.jpg', categoryId: '1' },
      { id: '103', name: 'Bluetooth Speaker', price: 89.99, imageUrl: '/placeholder.jpg', categoryId: '1' },
      { id: '104', name: '4K Webcam', price: 129.99, imageUrl: '/placeholder.jpg', categoryId: '1' },
    ],
  },
  {
    id: '2',
    name: 'Clothing',
    slug: 'clothing',
    products: [
      { id: '201', name: 'Cotton T-Shirt', price: 24.99, imageUrl: '/placeholder.jpg', categoryId: '2' },
      { id: '202', name: 'Slim Fit Jeans', price: 59.99, imageUrl: '/placeholder.jpg', categoryId: '2' },
      { id: '203', name: 'Hooded Sweatshirt', price: 49.99, imageUrl: '/placeholder.jpg', categoryId: '2' },
      { id: '204', name: 'Leather Jacket', price: 199.99, imageUrl: '/placeholder.jpg', categoryId: '2' },
    ],
  },
];

export default function Home() {
  const [featuredCategories, setFeaturedCategories] = useState<CategoryWithProducts[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setFeaturedCategories(SAMPLE_CATEGORIES);
      setIsLoading(false);
    }, 300);
  }, []);

  return (
    <Layout title="Momo Ecommerce - Blazingly Fast Shopping">
      <h1 className="text-3xl font-bold mb-6">Featured Products</h1>

      {isLoading ? (
        <div className="animate-pulse space-y-8">
          {[...Array(2)].map((_, i) => (
            <div key={i}>
              <div className="h-8 bg-gray-200 w-1/4 mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="h-64 bg-gray-200"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-10">
          {featuredCategories.map((category) => (
            <section key={category.id} className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{category.name}</h2>
                <Link href={`/category/${category.slug}`} className="text-sm underline">
                  View all
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {category.products.map((product) => (
                  <Link 
                    href={`/product/${product.id}`} 
                    key={product.id}
                    className="card hover:shadow-md transition-shadow group"
                  >
                    <div className="aspect-square bg-gray-100 mb-2 flex items-center justify-center">
                      {/* Product image would go here */}
                      <div className="text-gray-400">Image</div>
                    </div>
                    <h3 className="font-medium group-hover:underline">{product.name}</h3>
                    <p className="font-bold mt-1">${product.price.toFixed(2)}</p>
                    <button className="btn w-full mt-2">Add to Cart</button>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </Layout>
  );
}

// In a real application, we would fetch this data from our API
export const getStaticProps: GetStaticProps = async () => {
  // For demo purposes, this is simplified
  return {
    props: {
      featuredCategories: SAMPLE_CATEGORIES,
    },
    // Revalidate every hour
    revalidate: 3600,
  };
};