import { ShoppingCart, Heart } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useState, useEffect } from "react";
import { motion } from "motion/react";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  description: string;
  category?: string;
  stock?: number;
  isFlashSale?: boolean;
  originalPrice?: number;
  flash?: {
    active?: boolean;
    price?: number;
    ends_at?: string;
  };
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onProductClick?: (product: Product) => void;
  brandColor: string;
}

export function ProductCard({
  product,
  onAddToCart,
  onProductClick,
  brandColor,
}: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  // Auto-slide images every 3 seconds
  useEffect(() => {
    if (product.images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [product.images.length]);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger navigation if clicking on buttons
    if (
      (e.target as HTMLElement).closest("button") ||
      (e.target as HTMLElement).tagName === "BUTTON"
    ) {
      return;
    }
    onProductClick?.(product);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.images[currentImageIndex] || product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <button
          onClick={() => setIsLiked(!isLiked)}
          className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all"
        >
          <Heart
            className={`w-5 h-5 transition-all ${
              isLiked ? "fill-red-500 text-red-500" : "text-gray-600"
            }`}
          />
        </button>

        {product.images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {product.images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentImageIndex ? "bg-white w-6" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        )}

        {product.category && (
          <Badge
            className="absolute top-3 left-3"
            style={{ backgroundColor: brandColor }}
          >
            {product.category}
          </Badge>
        )}
        {product.isFlashSale && (
          <div className="absolute top-3 left-3">
            <span className="text-xs bg-yellow-400 text-black px-2 py-1 rounded-full">
              Flash Sale
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="mb-2 line-clamp-1">{product.name}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between">
          <span className="text-2xl" style={{ color: brandColor }}>
            {product.isFlashSale &&
            product.originalPrice &&
            product.price < product.originalPrice ? (
              <>
                <span className="text-lg line-through mr-2 opacity-70">
                  ₦{product.originalPrice.toFixed(2)}
                </span>
                <span className="text-2xl font-semibold">
                  ₦{product.price.toFixed(2)}
                </span>
              </>
            ) : (
              <>₦{product.price.toFixed(2)}</>
            )}
          </span>

          <Button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="group/btn"
            style={{ backgroundColor: brandColor }}
          >
            <ShoppingCart className="w-4 h-4 mr-2 group-hover/btn:animate-bounce" />
            Add to Cart
          </Button>
        </div>

        {product.stock !== undefined && product.stock < 10 && (
          <p className="text-sm text-orange-600 mt-2">
            Only {product.stock} left in stock!
          </p>
        )}
      </div>
    </motion.div>
  );
}
