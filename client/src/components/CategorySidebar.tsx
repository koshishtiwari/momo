import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

type Category = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  children?: Category[];
};

export default function CategorySidebar() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { categorySlug } = router.query;
  
  useEffect(() => {
    // In a production app, we would fetch from the API
    // For this demo, just use sample data
    const sampleCategories: Category[] = [
      { id: '1', name: 'Electronics', slug: 'electronics', parentId: null },
      { id: '2', name: 'Clothing', slug: 'clothing', parentId: null },
      { id: '3', name: 'Home & Kitchen', slug: 'home-kitchen', parentId: null },
      { id: '4', name: 'Books', slug: 'books', parentId: null },
      { id: '5', name: 'Smartphones', slug: 'smartphones', parentId: '1' },
      { id: '6', name: 'Laptops', slug: 'laptops', parentId: '1' },
      { id: '7', name: 'Audio', slug: 'audio', parentId: '1' },
      { id: '8', name: 'Men', slug: 'men', parentId: '2' },
      { id: '9', name: 'Women', slug: 'women', parentId: '2' },
      { id: '10', name: 'Kids', slug: 'kids', parentId: '2' },
    ];
    
    // Process categories to create a tree structure
    const rootCategories = sampleCategories
      .filter(cat => !cat.parentId)
      .map(rootCat => {
        return {
          ...rootCat,
          children: sampleCategories.filter(child => child.parentId === rootCat.id)
        };
      });
    
    setCategories(rootCategories);
    setIsLoading(false);
  }, []);
  
  if (isLoading) {
    return (
      <aside className="w-full md:w-48 p-4 border-r-2 border-black min-h-[calc(100vh-64px)]">
        <h2 className="text-xl font-bold mb-4">Categories</h2>
        <div className="animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-6 bg-gray-200 mb-2"></div>
          ))}
        </div>
      </aside>
    );
  }
  
  return (
    <aside className="w-full md:w-48 p-4 border-r-2 border-black min-h-[calc(100vh-64px)]">
      <h2 className="text-xl font-bold mb-4">Categories</h2>
      <nav>
        <ul className="space-y-1">
          {categories.map(category => (
            <li key={category.id}>
              <Link 
                href={`/category/${category.slug}`}
                className={`category-link ${categorySlug === category.slug ? 'category-link-active' : ''}`}
              >
                {category.name}
              </Link>
              
              {category.children && category.children.length > 0 && (
                <ul className="pl-4 space-y-1 mt-1">
                  {category.children.map(child => (
                    <li key={child.id}>
                      <Link 
                        href={`/category/${child.slug}`}
                        className={`category-link ${categorySlug === child.slug ? 'category-link-active' : ''}`}
                      >
                        {child.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}