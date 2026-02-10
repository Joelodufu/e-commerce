import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, SlidersHorizontal, Tag } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  maxPrice: number;
  showSpecialOnly: boolean;
  onSpecialOnlyChange: (value: boolean) => void;
  brandColor: string;
}

export function FilterSidebar({
  isOpen,
  onClose,
  categories,
  selectedCategories,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  maxPrice,
  showSpecialOnly,
  onSpecialOnlyChange,
  brandColor,
}: FilterSidebarProps) {
  const handleCategoryToggle = (category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoryChange(selectedCategories.filter((c) => c !== category));
    } else {
      onCategoryChange([...selectedCategories, category]);
    }
  };

  const clearAllFilters = () => {
    onCategoryChange([]);
    onPriceRangeChange([0, maxPrice]);
    onSpecialOnlyChange(false);
  };

  const activeFiltersCount =
    selectedCategories.length + (showSpecialOnly ? 1 : 0) + (priceRange[1] < maxPrice ? 1 : 0);

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-50 overflow-y-auto lg:relative lg:w-full lg:shadow-none"
          >
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${brandColor}20` }}
                  >
                    <SlidersHorizontal className="w-5 h-5" style={{ color: brandColor }} />
                  </div>
                  <div>
                    <h2 className="text-xl">Filters</h2>
                    {activeFiltersCount > 0 && (
                      <Badge
                        className="mt-1"
                        style={{ backgroundColor: brandColor, color: 'white' }}
                      >
                        {activeFiltersCount} active
                      </Badge>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Special Products */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Tag className="w-4 h-4" style={{ color: brandColor }} />
                  Special Offers
                </Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="special-only"
                    checked={showSpecialOnly}
                    onCheckedChange={(checked) => onSpecialOnlyChange(checked as boolean)}
                  />
                  <label
                    htmlFor="special-only"
                    className="text-sm cursor-pointer select-none"
                  >
                    Show special products only
                  </label>
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-3">
                <Label>Categories</Label>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={category}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() => handleCategoryToggle(category)}
                      />
                      <label
                        htmlFor={category}
                        className="text-sm cursor-pointer select-none capitalize"
                      >
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Price Range</Label>
                  <span className="text-sm" style={{ color: brandColor }}>
                    ₦{priceRange[0]} - ₦{priceRange[1]}
                  </span>
                </div>
                <Slider
                  min={0}
                  max={maxPrice}
                  step={100}
                  value={priceRange}
                  onValueChange={(value) => onPriceRangeChange(value as [number, number])}
                  className="w-full"
                />
              </div>

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={clearAllFilters}
                  style={{ borderColor: brandColor, color: brandColor }}
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
