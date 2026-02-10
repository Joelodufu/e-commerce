import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, Heart, ArrowLeft, Star, Minus, Plus, Share2 } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
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

interface ProductDetailsPageProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  brandColor: string;
}

export function ProductDetailsPage({
  product,
  onBack,
  onAddToCart,
  brandColor,
}: ProductDetailsPageProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    toast.success(`Added ${quantity} item(s) to cart!`);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled share or permission denied
        if (error instanceof Error && error.name !== 'AbortError') {
          // Fallback: try clipboard, then show message
          copyToClipboardFallback(window.location.href);
        }
      }
    } else {
      // Fallback: try clipboard, then show message
      copyToClipboardFallback(window.location.href);
    }
  };

  const copyToClipboardFallback = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Link copied to clipboard!');
    } catch {
      // If clipboard API fails, use the old-school method
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (successful) {
          toast.success('Link copied to clipboard!');
        } else {
          toast.info('Share feature unavailable. Link: ' + text.substring(0, 30) + '...');
        }
      } catch {
        toast.info('Share feature unavailable. Link: ' + text.substring(0, 30) + '...');
      }
    }
  };

  const incrementQuantity = () => {
    if (product.stock && quantity >= product.stock) {
      toast.error('Maximum stock reached');
      return;
    }
    setQuantity(quantity + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </Button>
        </div>
      </header>

      {/* Product Details */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-3xl overflow-hidden shadow-lg">
              <div className="relative aspect-square bg-gray-100">
                <img
                  src={product.images[currentImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all shadow-lg"
                >
                  <Heart
                    className={`w-6 h-6 transition-all ${
                      isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'
                    }`}
                  />
                </button>

                <button
                  onClick={handleShare}
                  className="absolute top-4 left-4 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all shadow-lg"
                >
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>

                {product.category && (
                  <Badge
                    className="absolute bottom-4 left-4 text-white"
                    style={{ backgroundColor: brandColor }}
                  >
                    {product.category}
                  </Badge>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {product.images.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex
                          ? 'border-current scale-105'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={
                        index === currentImageIndex
                          ? { borderColor: brandColor }
                          : {}
                      }
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <h1 className="text-4xl mb-4">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <span className="text-gray-600">(4.8 out of 5)</span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <span
                  className="text-5xl"
                  style={{ color: brandColor }}
                >
                  ₦{product.price.toFixed(2)}
                </span>
              </div>

              {/* Stock Status */}
              {product.stock !== undefined && (
                <div className="mb-6">
                  {product.stock > 0 ? (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      In Stock ({product.stock} available)
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-red-600 border-red-600">
                      Out of Stock
                    </Badge>
                  )}
                </div>
              )}

              {/* Description */}
              <div className="mb-8">
                <h3 className="text-xl mb-3">Description</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>

              {/* Quantity Selector */}
              <div className="mb-8">
                <label className="block mb-3">Quantity</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border rounded-lg">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="px-8 py-2 min-w-[80px] text-center">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={incrementQuantity}
                      disabled={product.stock !== undefined && quantity >= product.stock}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <span className="text-gray-600">
                    Total: <span style={{ color: brandColor }}>₦{(product.price * quantity).toFixed(2)}</span>
                  </span>
                </div>
              </div>

              {/* Add to Cart Button */}
              <Button
                onClick={handleAddToCart}
                size="lg"
                className="w-full text-white"
                style={{ backgroundColor: brandColor }}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
            </div>

            {/* Additional Info */}
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <h3 className="text-xl mb-4">Product Details</h3>
              <div className="space-y-3 text-gray-600">
                <div className="flex justify-between">
                  <span>Product ID:</span>
                  <span className="text-gray-900">{product.id.slice(0, 8)}</span>
                </div>
                {product.category && (
                  <div className="flex justify-between">
                    <span>Category:</span>
                    <span className="text-gray-900">{product.category}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span className="text-gray-900">Free Delivery</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Delivery:</span>
                  <span className="text-gray-900">2-5 Business Days</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}