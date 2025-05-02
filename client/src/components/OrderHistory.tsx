import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

type Order = {
  id: string;
  date: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'canceled';
  items: number;
};

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    // For non-authenticated users, don't show order history
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    
    // In a production app, we would fetch from the API
    // For this demo, just use sample data
    const sampleOrders: Order[] = [
      {
        id: 'ORD-001',
        date: '2023-07-15',
        total: 139.98,
        status: 'delivered',
        items: 2,
      },
      {
        id: 'ORD-002',
        date: '2023-08-02',
        total: 229.95,
        status: 'shipped',
        items: 3,
      },
    ];
    
    // Simulate API call
    setTimeout(() => {
      setOrders(sampleOrders);
      setIsLoading(false);
    }, 500);
  }, [isAuthenticated]);
  
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="border-2 border-black p-4">
      <h2 className="text-xl font-bold mb-4">Order History</h2>
      
      {isLoading ? (
        <div className="animate-pulse space-y-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 mb-2"></div>
          ))}
        </div>
      ) : orders.length > 0 ? (
        <ul className="space-y-3">
          {orders.map(order => (
            <li key={order.id} className="border-b border-gray-200 pb-2">
              <div className="flex justify-between">
                <span className="font-medium">{order.id}</span>
                <span className="capitalize">{order.status}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{order.date}</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
              <div className="mt-1">
                <Link href={`/orders/${order.id}`} className="text-sm underline">
                  View Details ({order.items} items)
                </Link>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center py-4">No orders yet</p>
      )}
      
      <div className="mt-4">
        <Link href="/orders" className="text-sm underline">
          View All Orders
        </Link>
      </div>
    </div>
  );
}