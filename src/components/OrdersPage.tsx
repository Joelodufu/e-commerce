import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Package, MapPin, Clock, CheckCircle, Truck } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { projectId } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  images: string[];
}

interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: string;
  deliveryAddress: string;
  createdAt: string;
  location?: {
    lat: number;
    lng: number;
  };
}

interface OrdersPageProps {
  onBack: () => void;
  accessToken: string;
  onTrackOrder: (orderId: string) => void;
  brandColor: string;
}

export function OrdersPage({
  onBack,
  accessToken,
  onTrackOrder,
  brandColor,
}: OrdersPageProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f4cf61aa/orders`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data.sort((a: Order, b: Order) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5" />;
      case 'processing':
        return <Package className="w-5 h-5" />;
      case 'in_transit':
        return <Truck className="w-5 h-5" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'processing':
        return 'bg-blue-500';
      case 'in_transit':
        return 'bg-purple-500';
      case 'delivered':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-5 h-5" />
            Back
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl mb-8">My Orders</h1>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-current" style={{ borderColor: brandColor }} />
            </div>
          ) : orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-12 text-center shadow-lg"
            >
              <Package className="w-20 h-20 mx-auto mb-4 text-gray-400" />
              <h2 className="text-2xl mb-2">No orders yet</h2>
              <p className="text-gray-600 mb-6">
                Start shopping to see your orders here!
              </p>
              <Button onClick={onBack} style={{ backgroundColor: brandColor }}>
                Start Shopping
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg"
                >
                  {/* Order Header */}
                  <div className="p-6 bg-gray-50 border-b">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl">Order #{order.id.slice(0, 8).toUpperCase()}</h3>
                          <Badge
                            className={`${getStatusColor(order.status)} text-white`}
                          >
                            <span className="flex items-center gap-1">
                              {getStatusIcon(order.status)}
                              {order.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Placed on {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600 mb-1">Total Amount</div>
                        <div className="text-2xl" style={{ color: brandColor }}>
                          ₦{order.total.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <div className="space-y-4 mb-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex gap-4">
                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <img
                              src={item.images[0]}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="mb-1 line-clamp-1">{item.name}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>Qty: {item.quantity}</span>
                              <span>₦{item.price.toFixed(2)}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              ₦{(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-4" />

                    {/* Delivery Address */}
                    <div className="flex items-start gap-3 mb-4">
                      <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Delivery Address</p>
                        <p className="text-gray-900">{order.deliveryAddress}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      {order.status !== 'delivered' && (
                        <Button
                          onClick={() => onTrackOrder(order.id)}
                          className="flex-1"
                          style={{ backgroundColor: brandColor }}
                        >
                          <MapPin className="w-4 h-4 mr-2" />
                          Track Order
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() =>
                          setSelectedOrder(
                            selectedOrder === order.id ? null : order.id
                          )
                        }
                      >
                        {selectedOrder === order.id ? 'Hide' : 'View'} Details
                      </Button>
                    </div>

                    {/* Expanded Details */}
                    {selectedOrder === order.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t"
                      >
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Order ID:</span>
                            <span className="font-mono">{order.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Items:</span>
                            <span>{order.items.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal:</span>
                            <span>₦{order.total.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Shipping:</span>
                            <span className="text-green-600">Free</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between">
                            <span>Total:</span>
                            <span style={{ color: brandColor }}>
                              ₦{order.total.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
