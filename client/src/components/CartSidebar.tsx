import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

type CartItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
};

export default function CartSidebar() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  
  // Calculate total price
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity, 
    0
  );
  
  useEffect(() => {
    // In a production app, we would fetch from the API
    // For this demo, just use sample data
    const sampleCartItems: CartItem[] = [
      {
        id: '1',
        productId: '101',
        name: 'Mechanical Keyboard',
        price: 89.99,
        quantity: 1,
        imageUrl: '/placeholder.jpg',
      },
      {
        id: '2',
        productId: '102',
        name: 'Wireless Mouse',
        price: 49.99,
        quantity: 1,
        imageUrl: '/placeholder.jpg',
      },
    ];
    
    // Simulate API call
    setTimeout(() => {
      setCartItems(sampleCartItems);
      setIsLoading(false);
    }, 500);
  }, []);
  
  // Remove item from cart
  const removeItem = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };
  
  // Update item quantity
  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };
  
  return (
    <div className="border-2 border-black p-4 mb-4">
      <h2 className="text-xl font-bold mb-4">Cart</h2>
      
      {isLoading ? (
        <div className="animate-pulse space-y-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 mb-2"></div>
          ))}
        </div>
      ) : cartItems.length > 0 ? (
        <>
          <ul className="space-y-4 mb-4">
            {cartItems.map(item => (
              <li key={item.id} className="flex items-start border-b border-gray-200 pb-2">
                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <div className="text-sm">${item.price.toFixed(2)}</div>
                  <div className="flex items-center mt-1">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 border border-black flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="mx-2">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 border border-black flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button 
                  onClick={() => removeItem(item.id)}
                  className="text-sm underline ml-2"
                  aria-label="Remove item"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <div className="flex justify-between font-bold mb-4">
            <span>Total:</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <Link href="/checkout" className="btn block text-center w-full">
            Checkout
          </Link>
        </>
      ) : (
        <p className="text-center py-4">Your cart is empty</p>
      )}
    </div>
  );
}