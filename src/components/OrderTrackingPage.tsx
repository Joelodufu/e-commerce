import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Package, MapPin, Clock, CheckCircle, Truck, Home } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { projectId } from '../utils/supabase/info';

interface OrderTrackingPageProps {
  onBack: () => void;
  accessToken: string;
  brandColor: string;
}

export function OrderTrackingPage({
  onBack,
  accessToken,
  brandColor,
}: OrderTrackingPageProps) {
  const [orderId, setOrderId] = useState('');
  const [orderData, setOrderData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const trackOrder = async () => {
    if (!orderId.trim()) {
      toast.error('Please enter an order ID');
      return;
    }

    setIsLoading(true);
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

      if (!response.ok) {
        throw new Error(data.error || 'Order not found');
      }

      setOrderData(data);
    } catch (error: any) {
      console.error('Track order error:', error);
      toast.error(error.message || 'Failed to track order');
      setOrderData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-6 h-6" />;
      case 'confirmed':
        return <CheckCircle className="w-6 h-6" />;
      case 'preparing':
        return <Package className="w-6 h-6" />;
      case 'out_for_delivery':
        return <Truck className="w-6 h-6" />;
      case 'delivered':
        return <Home className="w-6 h-6" />;
      default:
        return <Package className="w-6 h-6" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600';
      case 'confirmed':
        return 'text-blue-600';
      case 'preparing':
        return 'text-purple-600';
      case 'out_for_delivery':
        return 'text-orange-600';
      case 'delivered':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const statusSteps = [
    { key: 'pending', label: 'Order Placed', icon: Clock },
    { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
    { key: 'preparing', label: 'Preparing', icon: Package },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: Home },
  ];

  const getCurrentStepIndex = (status: string) => {
    return statusSteps.findIndex((step) => step.key === status);
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          {/* Search Section */}
          <div className="bg-white rounded-3xl p-8 shadow-lg mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${brandColor}20` }}
              >
                <Package className="w-6 h-6" style={{ color: brandColor }} />
              </div>
              <div>
                <h1 className="text-2xl">Track Your Order</h1>
                <p className="text-gray-600">Enter your order ID to track your delivery</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Input
                placeholder="Enter Order ID"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && trackOrder()}
                className="flex-1"
              />
              <Button
                onClick={trackOrder}
                disabled={isLoading}
                style={{ backgroundColor: brandColor }}
                className="text-white"
              >
                {isLoading ? 'Tracking...' : 'Track Order'}
              </Button>
            </div>
          </div>

          {/* Order Details */}
          {orderData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Order Info */}
              <div className="bg-white rounded-3xl p-8 shadow-lg">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-xl mb-2">Order #{orderData.id.slice(0, 8)}</h2>
                    <p className="text-gray-600">
                      Placed on {new Date(orderData.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    className={`${getStatusColor(orderData.status)} bg-opacity-10`}
                    variant="outline"
                  >
                    {orderData.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>

                {/* Delivery Address */}
                {orderData.delivery_address && (
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl mb-6">
                    <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Delivery Address</p>
                      <p>{orderData.delivery_address}</p>
                      {orderData.phone_number && (
                        <p className="text-gray-600 mt-1">Phone: {orderData.phone_number}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div className="border-t pt-6">
                  <h3 className="mb-4">Order Items</h3>
                  <div className="space-y-3">
                    {orderData.items?.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <p>{item.name}</p>
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <p style={{ color: brandColor }}>₦{item.price.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="border-t mt-4 pt-4 flex justify-between items-center">
                    <span>Total</span>
                    <span className="text-xl" style={{ color: brandColor }}>
                      ₦{orderData.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tracking Timeline */}
              <div className="bg-white rounded-3xl p-8 shadow-lg">
                <h2 className="text-xl mb-6">Order Status</h2>

                <div className="relative">
                  {statusSteps.map((step, index) => {
                    const currentIndex = getCurrentStepIndex(orderData.status);
                    const isCompleted = index <= currentIndex;
                    const isCurrent = index === currentIndex;
                    const StepIcon = step.icon;

                    return (
                      <div key={step.key} className="relative">
                        {index < statusSteps.length - 1 && (
                          <div
                            className={`absolute left-6 top-12 w-0.5 h-16 ${
                              isCompleted ? 'bg-green-500' : 'bg-gray-200'
                            }`}
                          />
                        )}

                        <div className="flex items-start gap-4 pb-8">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                              isCompleted
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-100 text-gray-400'
                            } ${isCurrent ? 'ring-4 ring-green-200' : ''}`}
                          >
                            <StepIcon className="w-6 h-6" />
                          </div>
                          <div className="flex-1 pt-2">
                            <p
                              className={`${
                                isCompleted ? 'text-gray-900' : 'text-gray-500'
                              }`}
                            >
                              {step.label}
                            </p>
                            {isCurrent && (
                              <p className="text-sm text-gray-600 mt-1">Current Status</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Live Map Placeholder */}
                {orderData.status === 'out_for_delivery' && (
                  <div className="mt-6 p-6 bg-gray-100 rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <Truck className="w-6 h-6" style={{ color: brandColor }} />
                      <div>
                        <p>Driver on the way</p>
                        <p className="text-sm text-gray-600">Estimated arrival: 20-30 minutes</p>
                      </div>
                    </div>
                    <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">Live tracking map</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {!orderData && !isLoading && (
            <div className="bg-white rounded-3xl p-12 shadow-lg text-center">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${brandColor}10` }}
              >
                <Package className="w-10 h-10" style={{ color: brandColor }} />
              </div>
              <h3 className="text-xl mb-2">Track Your Order</h3>
              <p className="text-gray-600">
                Enter your order ID above to see the status and location of your delivery
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
