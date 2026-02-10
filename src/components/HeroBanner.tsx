import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import { useEffect, useRef } from "react";

interface HeroBannerProps {
  imageUrls: string[];
  onProductClick: () => void;
}

export function HeroBanner({ imageUrls, onProductClick }: HeroBannerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationId: number;
    let scrollPosition = 0;
    const scrollSpeed = 0.5; // pixels per frame

    const animate = () => {
      scrollPosition += scrollSpeed;

      // Reset position when we've scrolled past one set of images
      if (scrollPosition >= scrollContainer.scrollWidth / 2) {
        scrollPosition = 0;
      }

      scrollContainer.scrollLeft = scrollPosition;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    // Pause on hover
    const handleMouseEnter = () => cancelAnimationFrame(animationId);
    const handleMouseLeave = () => {
      animationId = requestAnimationFrame(animate);
    };

    scrollContainer.addEventListener("mouseenter", handleMouseEnter);
    scrollContainer.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationId);
      scrollContainer.removeEventListener("mouseenter", handleMouseEnter);
      scrollContainer.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  if (!imageUrls || imageUrls.length === 0) {
    return null;
  }

  // Create duplicate array for seamless loop
  const duplicatedImages = [...imageUrls, ...imageUrls, ...imageUrls];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative w-full overflow-hidden rounded-3xl mb-8 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 shadow-2xl"
    >
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-hidden py-8 px-8"
        style={{ scrollBehavior: "auto" }}
      >
        {duplicatedImages.map((imageUrl, index) => (
          <motion.div
            key={index}
            className="relative flex-shrink-0 group cursor-pointer"
            onClick={onProductClick}
            style={{
              width: "320px",
              // Stagger cards by moving them down based on their position
              transform: `translateY(${(index % 3) * 20}px)`,
            }}
            whileHover={{ scale: 1.05, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={imageUrl}
                  alt={`Product ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Floating CTA button on hover */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileHover={{ opacity: 1, y: 0 }}
                className="absolute bottom-4 right-4 bg-white rounded-full px-4 py-2 flex items-center gap-2 shadow-xl"
              >
                <span className="text-sm font-semibold text-gray-900">
                  View
                </span>
                <ChevronRight className="w-4 h-4 text-gray-900" />
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Gradient overlays for edges */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-purple-500 to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-orange-500 to-transparent pointer-events-none" />
    </motion.div>
  );
}
