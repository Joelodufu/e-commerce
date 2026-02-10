import { motion } from 'motion/react';
import { Sparkles, Tag, TrendingUp, Star } from 'lucide-react';

interface CategoryTabsProps {
  categories: string[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  brandColor: string;
  showAll?: boolean;
  showFlashSales?: boolean;
  showSpecial?: boolean;
}

export function CategoryTabs({
  categories,
  selectedCategory,
  onCategorySelect,
  brandColor,
  showAll = true,
  showFlashSales = true,
  showSpecial = true,
}: CategoryTabsProps) {
  const specialTabs = [
    ...(showAll ? [{ id: 'all', label: 'All Products', icon: Tag }] : []),
    ...(showFlashSales ? [{ id: 'flash', label: 'Flash Sales', icon: TrendingUp }] : []),
    ...(showSpecial ? [{ id: 'special', label: 'Special Offers', icon: Star }] : []),
  ];

  const allTabs = [
    ...specialTabs,
    ...categories.map((cat) => ({ id: cat, label: cat, icon: Sparkles })),
  ];

  return (
    <div className="relative">
      {/* Gradient fade on edges */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

      <div className="overflow-x-auto hide-scrollbar">
        <div className="flex gap-3 px-1 py-2 min-w-max">
          {allTabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = selectedCategory === tab.id;

            return (
              <motion.button
                key={tab.id}
                onClick={() => onCategorySelect(tab.id)}
                className="relative px-6 py-3 rounded-2xl transition-all whitespace-nowrap flex items-center gap-2"
                style={{
                  backgroundColor: isSelected ? brandColor : '#f3f4f6',
                  color: isSelected ? 'white' : '#6b7280',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="w-4 h-4" />
                <span className="capitalize">{tab.label}</span>

                {isSelected && (
                  <motion.div
                    layoutId="category-indicator"
                    className="absolute inset-0 rounded-2xl ring-4 ring-opacity-30"
                    style={{ ringColor: brandColor }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}

                {/* Special glow for flash sales */}
                {tab.id === 'flash' && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [1, 0.5, 1],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                    }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
