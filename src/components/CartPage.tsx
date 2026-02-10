import { motion } from 'motion/react';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { toast } from 'sonner@2.0.3';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  description: string;
  category?: string;
  stock?: number;
}

interface CartItem extends Product {
  quantity: number;
}

interface CartPageProps {
  items: CartItem[];
  onBack: () => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
  brandColor: string;
}

export function CartPage({
  items,
  onBack,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  brandColor,
}: CartPageProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  const handleQuantityChange = (id: string, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return;
    onUpdateQuantity(id, newQuantity);
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
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl mb-8">Shopping Cart</h1>

          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-12 text-center shadow-lg"
            >
              <ShoppingBag className="w-20 h-20 mx-auto mb-4 text-gray-400" />
              <h2 className="text-2xl mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">
                Add some products to get started!
              </p>
              <Button onClick={onBack} style={{ backgroundColor: brandColor }}>
                Continue Shopping
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-lg"
                  >
                    <div className="flex gap-6">
                      {/* Product Image */}
                      <div className="w-32 h-32 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-xl mb-1 line-clamp-1">{item.name}</h3>
                            {item.category && (
                              <span className="text-sm text-gray-600">{item.category}</span>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onRemoveItem(item.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </div>

                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {item.description}
                        </p>

                        <div className="flex items-center justify-between">
                          {/* Quantity Controls */}
                          <div className="flex items-center border rounded-lg">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity, -1)
                              }
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="px-6 py-2 min-w-[60px] text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity, 1)
                              }
                              disabled={
                                item.stock !== undefined &&
                                item.quantity >= item.stock
                              }
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <div className="text-sm text-gray-600">
                              ₦{item.price.toFixed(2)} each
                            </div>
                            <div className="text-xl" style={{ color: brandColor }}>
                              ₦{(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Order Summary */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="lg:col-span-1"
              >
                <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-24">
                  <h2 className="text-2xl mb-6">Order Summary</h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal ({items.length} items)</span>
                      <span>₦{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span className="text-green-600">Free</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-xl">
                      <span>Total</span>
                      <span style={{ color: brandColor }}>₦{total.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    onClick={onCheckout}
                    size="lg"
                    className="w-full text-white"
                    style={{ backgroundColor: brandColor }}
                  >
                    Proceed to Checkout
                  </Button>

                  <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 text-center">
                      🔒 Secure checkout with wallet payment
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
