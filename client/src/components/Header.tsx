import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function Header() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAuthenticated, logout } = useAuth();
  
  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };
  
  return (
    <header className="border-b-2 border-black py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link href="/" className="font-bold text-2xl no-underline">
            MOMO
          </Link>
          
          {/* Search form */}
          <form onSubmit={handleSearch} className="flex">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="input w-64"
              aria-label="Search products"
            />
            <button type="submit" className="btn ml-2">
              Search
            </button>
          </form>
        </div>
        
        {/* Auth */}
        <div>
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="font-bold">
                {user?.name || user?.email}
              </span>
              <button onClick={logout} className="btn">
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login" className="btn">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}