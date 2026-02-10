import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Badge } from './ui/badge';
import { Package, Truck, CheckCircle, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { projectId } from '../utils/supabase/info';

interface Order {
  id: string;
  status: string;
  location: { lat: number; lng: number };
  deliveryAddress: string;
  phoneNumber?: string;
  items: any[];
  total: number;
  createdAt: string;
}

interface OrderTrackingModalProps {
  open: boolean;
  onClose: () => void;
  orderId: string;
  accessToken: string;
  brandColor: string;
}

export function OrderTrackingModal({
  open,
  onClose,
  orderId,
  accessToken,
  brandColor,
}: OrderTrackingModalProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!open || !orderId) return;

    const fetchOrder = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-f4cf61aa/orders/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const data = await response.json();
        if (response.ok) {
          setOrder(data);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();

    // Simulate location updates (in production, use real-time updates)
    const interval = setInterval(() => {
      fetchOrder();
    }, 5000);

    return () => clearInterval(interval);
  }, [open, orderId, accessToken]);

  const statusSteps = [
    { key: 'pending', label: 'Order Placed', icon: Package },
    { key: 'processing', label: 'Processing', icon: Package },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle },
  ];

  const currentStepIndex = statusSteps.findIndex((s) => s.key === order?.status);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Order Tracking</DialogTitle>
          <DialogDescription>Track your order in real-time</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-12 text-center text-gray-500">Loading order details...</div>
        ) : order ? (
          <div className="space-y-6 mt-4">
            {/* Order Status */}
            <div className="space-y-4">
              {statusSteps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;

                return (
                  <div key={step.key} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isActive ? 'text-white' : 'bg-gray-200 text-gray-400'
                        }`}
                        style={isActive ? { backgroundColor: brandColor } : {}}
                      >
                        <Icon className="w-5 h-5" />
                      </motion.div>
                      {index < statusSteps.length - 1 && (
                        <div
                          className={`w-0.5 h-12 ${
                            isActive ? 'bg-current' : 'bg-gray-200'
                          }`}
                          style={isActive ? { color: brandColor } : {}}
                        />
                      )}
                    </div>

                    <div className="flex-1 pb-8">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={isCurrent ? '' : 'text-gray-600'}>
                          {step.label}
                        </span>
                        {isCurrent && (
                          <Badge style={{ backgroundColor: brandColor }}>Current</Badge>
                        )}
                      </div>
                      {isCurrent && (
                        <p className="text-sm text-gray-500">
                          Your order is currently being {step.label.toLowerCase()}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live Map Placeholder */}
            <div className="border rounded-xl overflow-hidden">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 h-64 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 mx-auto mb-2" style={{ color: brandColor }} />
                    <p className="text-gray-600">Live Tracking Map</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Delivery to: {order.deliveryAddress}
                    </p>
                  </div>
                </div>

                {/* Animated delivery marker */}
                <motion.div
                  className="absolute w-3 h-3 rounded-full"
                  style={{ backgroundColor: brandColor }}
                  animate={{
                    top: ['20%', '80%'],
                    left: ['20%', '80%'],
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    repeatType: 'reverse',
                  }}
                />
              </div>
            </div>

            {/* Order Details */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-2">Order ID: {order.id}</p>
              <p className="text-sm text-gray-600 mb-2">
                Items: {order.items.length} product(s)
              </p>
              <p className="text-sm text-gray-600">
                Total: <span style={{ color: brandColor }}>₦{order.total.toFixed(2)}</span>
              </p>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-gray-500">Order not found</div>
        )}
      </DialogContent>
    </Dialog>
  );
}