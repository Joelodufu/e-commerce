import { useState, useEffect } from "react";
import { SplashScreen } from "./components/SplashScreen";
import { ProductCard } from "./components/ProductCard";
import { ProductDetailsPage } from "./components/ProductDetailsPage";
import { CartPage } from "./components/CartPage";
import { OrdersPage } from "./components/OrdersPage";
import { OrderTrackingPage } from "./components/OrderTrackingPage";
import { ProfilePage } from "./components/ProfilePage";
import { WalletPage } from "./components/WalletPage";
import { AuthModal } from "./components/AuthModal";
import { CartDrawer } from "./components/CartDrawer";
import { CheckoutModal } from "./components/CheckoutModal";
import { WalletModal } from "./components/WalletModal";
import { OrderTrackingModal } from "./components/OrderTrackingModal";
import { FlashSalesBanner } from "./components/FlashSalesBanner";
import { CategoryTabs } from "./components/CategoryTabs";
import { FilterSidebar } from "./components/FilterSidebar";
import { AdminPanel } from "./components/admin/AdminPanel";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { Input } from "./components/ui/input";
import { Toaster } from "./components/ui/sonner";
import {
  ShoppingCart,
  User,
  Wallet,
  Package,
  Search,
  Menu,
  Shield,
  MapPin,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import { createClient } from "./utils/supabase/client";
import { projectId, publicAnonKey } from "./utils/supabase/info";
import { toast } from "sonner@2.0.3";
import { motion } from "motion/react";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  description: string;
  category?: string;
  stock?: number;
  isSpecial?: boolean;
  isFlashSale?: boolean;
  originalPrice?: number;
  discount?: number;
  flashEndsAt?: string; // ISO date string for flash end
  flash?: {
    active?: boolean;
    price?: number;
    ends_at?: string;
  };
}

interface CartItem extends Product {
  quantity: number;
}

type PageView =
  | "home"
  | "product-details"
  | "cart"
  | "orders"
  | "order-tracking"
  | "profile"
  | "wallet";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageView>("home");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter and category states
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [showSpecialOnly, setShowSpecialOnly] = useState(false);

  // Modal states
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showOrderTracking, setShowOrderTracking] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState("");

  // Brand settings
  const [brandSettings, setBrandSettings] = useState({
    color: "#6366f1",
    logo: "",
    name: "COK Mall",
  });
  const [brandLoading, setBrandLoading] = useState(true);

  useEffect(() => {
    checkSession();
    fetchProducts();
    fetchBrandSettings();
  }, []);

  useEffect(() => {
    if (user && accessToken) {
      fetchWalletBalance();
    }
  }, [user, accessToken]);

  const checkSession = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Session error:", error);
        return;
      }
      if (data.session) {
        setUser(data.session.user);
        setAccessToken(data.session.access_token);
      }
    } catch (error) {
      console.error("Error checking session:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f4cf61aa/products`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      // Map backend product shape to frontend fields used across the app
      const mapped = (data || []).map((p: any) => {
        // Treat a product as flash if `flash.active` is true.
        // If an ends_at exists, ensure it's in the future.
        const activeFlag = !!p?.flash?.active;
        const hasValidEnd = p?.flash?.ends_at
          ? new Date(p.flash.ends_at) > new Date()
          : true;
        const hasFlash = activeFlag && hasValidEnd;

        if (hasFlash) {
          return {
            ...p,
            isFlashSale: true,
            originalPrice: p.price,
            price: p.flash?.price ?? p.price,
            flashEndsAt: p.flash?.ends_at,
            flash: p.flash,
          };
        }

        return { ...p, isFlashSale: false };
      });

      setProducts(mapped);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f4cf61aa/wallet`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = await response.json();
      setWalletBalance(data.balance || 0);
    } catch (error) {
      console.error("Error fetching wallet:", error);
    }
  };

  const fetchBrandSettings = async () => {
    try {
      // Try to read cached settings first
      const cached = localStorage.getItem("brandSettings");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (!parsed.expires || Date.now() < parsed.expires) {
            setBrandSettings(parsed.value);
            setBrandLoading(false);
          } else {
            localStorage.removeItem("brandSettings");
          }
        } catch (e) {
          localStorage.removeItem("brandSettings");
        }
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f4cf61aa/admin/settings`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      if (data && data.brand) {
        const brand = {
          color: data.brand.color || brandSettings.color,
          logo: data.brand.logo || brandSettings.logo,
          name: data.brand.companyName || data.brand.name || brandSettings.name,
        };
        setBrandSettings(brand);
        // cache for 10 minutes
        localStorage.setItem(
          "brandSettings",
          JSON.stringify({ value: brand, expires: Date.now() + 10 * 60 * 1000 })
        );
      }
      setBrandLoading(false);
    } catch (error) {
      console.error("Error fetching brand settings:", error);
      setBrandLoading(false);
    }
  };

  const handleAuth = (token: string, userData: any) => {
    setAccessToken(token);
    setUser(userData);
    fetchWalletBalance();
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setAccessToken("");
    setWalletBalance(0);
    setCart([]);
    setIsAdminMode(false);
    setCurrentPage("home");
    toast.success("Logged out successfully");
  };

  const handleAddToCart = (product: Product, quantity: number = 1) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity }]);
    }
    toast.success("Added to cart!");
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    setCart(
      cart.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const handleRemoveFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
    toast.success("Removed from cart");
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setShowCartDrawer(false);
    setCurrentPage("home");
    setShowCheckoutModal(true);
  };

  const handleOrderSuccess = (orderId: string) => {
    setCurrentOrderId(orderId);
    setCart([]);
    setShowCheckoutModal(false);
    fetchWalletBalance();
    setTimeout(() => {
      setShowOrderTracking(true);
    }, 500);
  };

  const handleBrandUpdate = (settings: any) => {
    setBrandSettings(settings.brand);
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setCurrentPage("product-details");
  };

  const handleNavigateToOrders = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setCurrentPage("orders");
  };

  const handleNavigateToProfile = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setCurrentPage("profile");
  };

  const handleNavigateToWallet = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setCurrentPage("wallet");
  };

  const handleNavigateToCart = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setCurrentPage("cart");
  };

  const handleBackToHome = () => {
    setCurrentPage("home");
    setSelectedProduct(null);
  };

  const handleTrackOrder = (orderId: string) => {
    setCurrentOrderId(orderId);
    setShowOrderTracking(true);
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Get unique categories from products
  const categories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean))
  ) as string[];

  // Calculate max price for slider
  const maxPrice = Math.max(...products.map((p) => p.price), 1000000);

  // Update price range when products change
  useEffect(() => {
    if (products.length > 0) {
      const max = Math.max(...products.map((p) => p.price), 100000);
      setPriceRange([0, max]);
    }
  }, [products]);

  // Filter products based on all criteria
  const filteredProducts = products.filter((product) => {
    // Search filter
    if (
      searchQuery &&
      !product.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Category tab filter
    if (selectedCategory === "flash" && !product.isFlashSale) {
      return false;
    }
    if (selectedCategory === "special" && !product.isSpecial) {
      return false;
    }
    if (
      selectedCategory !== "all" &&
      selectedCategory !== "flash" &&
      selectedCategory !== "special"
    ) {
      if (product.category !== selectedCategory) {
        return false;
      }
    }

    // Sidebar category filter
    if (selectedCategories.length > 0 && product.category) {
      if (!selectedCategories.includes(product.category)) {
        return false;
      }
    }

    // Price range filter
    if (product.price < priceRange[0] || product.price > priceRange[1]) {
      return false;
    }

    // Special only filter
    if (showSpecialOnly && !product.isSpecial) {
      return false;
    }

    return true;
  });

  // Get flash sale products
  const flashSaleProducts = products.filter((p) => p.isFlashSale);
  const specialProducts = products.filter((p) => p.isSpecial && !p.isFlashSale);

  // Flash sale end time: earliest active flash end among products, fallback to 24 hours from now
  const flashSaleEndTime = (() => {
    const ends = flashSaleProducts
      .map((p) =>
        p.flashEndsAt ? new Date(p.flashEndsAt).getTime() : Infinity
      )
      .filter((t) => isFinite(t));
    if (ends.length === 0) return new Date(Date.now() + 24 * 60 * 60 * 1000);
    return new Date(Math.min(...ends));
  })();

  if (showSplash) {
    return (
      <SplashScreen
        onComplete={() => setShowSplash(false)}
        brandColor={brandSettings.color}
        logo={brandSettings.logo}
        brandName={brandSettings.name}
      />
    );
  }

  if (isAdminMode) {
    console.log(
      "Admin mode - Access token status:",
      accessToken ? "Present" : "Missing"
    );
    console.log(
      "Admin mode - User status:",
      user ? "Logged in" : "Not logged in"
    );

    return (
      <AdminPanel
        accessToken={accessToken}
        onLogout={() => {
          setIsAdminMode(false);
          handleLogout();
        }}
        brandColor={brandSettings.color}
        brandName={brandSettings.name}
        onBrandUpdate={handleBrandUpdate}
      />
    );
  }

  // Render different pages based on currentPage state
  if (currentPage === "product-details" && selectedProduct) {
    return (
      <>
        <Toaster />
        <ProductDetailsPage
          product={selectedProduct}
          onBack={handleBackToHome}
          onAddToCart={handleAddToCart}
          brandColor={brandSettings.color}
        />
      </>
    );
  }

  if (currentPage === "cart") {
    return (
      <>
        <Toaster />
        <CartPage
          items={cart}
          onBack={handleBackToHome}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveFromCart}
          onCheckout={handleCheckout}
          brandColor={brandSettings.color}
        />
        <CheckoutModal
          open={showCheckoutModal}
          onClose={() => setShowCheckoutModal(false)}
          total={cartTotal}
          walletBalance={walletBalance}
          accessToken={accessToken}
          onSuccess={handleOrderSuccess}
          onAddFunds={() => {
            setShowCheckoutModal(false);
            setShowWalletModal(true);
          }}
          items={cart}
          brandColor={brandSettings.color}
        />
        <OrderTrackingModal
          open={showOrderTracking}
          onClose={() => setShowOrderTracking(false)}
          orderId={currentOrderId}
          accessToken={accessToken}
          brandColor={brandSettings.color}
        />
      </>
    );
  }

  if (currentPage === "orders") {
    return (
      <>
        <Toaster />
        <OrdersPage
          onBack={handleBackToHome}
          accessToken={accessToken}
          onTrackOrder={handleTrackOrder}
          brandColor={brandSettings.color}
        />
        <OrderTrackingModal
          open={showOrderTracking}
          onClose={() => setShowOrderTracking(false)}
          orderId={currentOrderId}
          accessToken={accessToken}
          brandColor={brandSettings.color}
        />
      </>
    );
  }

  if (currentPage === "order-tracking") {
    return (
      <>
        <Toaster />
        <OrderTrackingPage
          onBack={handleBackToHome}
          accessToken={accessToken}
          brandColor={brandSettings.color}
        />
      </>
    );
  }

  if (currentPage === "profile") {
    return (
      <>
        <Toaster />
        <ProfilePage
          user={user}
          onBack={handleBackToHome}
          onLogout={handleLogout}
          walletBalance={walletBalance}
          onOpenWallet={handleNavigateToWallet}
          brandColor={brandSettings.color}
        />
      </>
    );
  }

  if (currentPage === "wallet") {
    return (
      <>
        <Toaster />
        <WalletPage
          onBack={handleBackToHome}
          balance={walletBalance}
          accessToken={accessToken}
          onBalanceUpdate={setWalletBalance}
          brandColor={brandSettings.color}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Toaster />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              {brandSettings.logo ? (
                <img
                  src={brandSettings.logo}
                  alt={brandSettings.name || "COK Mall"}
                  className="w-10 h-10 object-contain"
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: brandSettings.color }}
                >
                  <span className="text-lg">
                    {(brandSettings.name || "COK Mall")
                      .split(" ")
                      .map((s) => s[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                </div>
              )}
              <h1 className="text-2xl hidden sm:block">
                {brandSettings.name || "COK Mall"}
              </h1>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-md hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {user && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNavigateToOrders}
                    className="relative"
                    title="My Orders"
                  >
                    <Package className="w-5 h-5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentPage("order-tracking")}
                    className="relative"
                    title="Track Order"
                  >
                    <MapPin className="w-5 h-5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNavigateToWallet}
                    className="relative"
                    title="Wallet"
                  >
                    <Wallet className="w-5 h-5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNavigateToCart}
                    className="relative"
                    title="Cart"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {cart.length > 0 && (
                      <Badge
                        className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0"
                        style={{ backgroundColor: brandSettings.color }}
                      >
                        {cart.length}
                      </Badge>
                    )}
                  </Button>
                </>
              )}

              {user ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNavigateToProfile}
                  >
                    <User className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsAdminMode(true)}
                    title="Admin Panel"
                    disabled={!user}
                  >
                    <Shield className="w-5 h-5" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setShowAuthModal(true)}
                  style={{ backgroundColor: brandSettings.color }}
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Flash Sales Banner */}
        {flashSaleProducts.length > 0 && (
          <FlashSalesBanner
            endTime={flashSaleEndTime}
            onViewDeals={() => setSelectedCategory("flash")}
            brandColor={brandSettings.color}
          />
        )}

        {/* Category Tabs */}
        {products.length > 0 && (
          <CategoryTabs
            categories={categories}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
            brandColor={brandSettings.color}
          />
        )}

        {/* Filter Button & Results Count */}
        <div className="flex items-center justify-between mt-6 mb-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilterSidebar(!showFilterSidebar)}
              className="gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {(selectedCategories.length > 0 || showSpecialOnly) && (
                <Badge
                  style={{
                    backgroundColor: brandSettings.color,
                    color: "white",
                  }}
                  className="ml-1"
                >
                  {selectedCategories.length + (showSpecialOnly ? 1 : 0)}
                </Badge>
              )}
            </Button>
          </div>
          <p className="text-gray-600">
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "product" : "products"} found
          </p>
        </div>

        {/* Main Content with Sidebar */}
        <div className="flex gap-6">
          {/* Filter Sidebar - Desktop */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-3xl shadow-lg overflow-hidden">
              <FilterSidebar
                isOpen={true}
                onClose={() => {}}
                categories={categories}
                selectedCategories={selectedCategories}
                onCategoryChange={setSelectedCategories}
                priceRange={priceRange}
                onPriceRangeChange={setPriceRange}
                maxPrice={maxPrice}
                showSpecialOnly={showSpecialOnly}
                onSpecialOnlyChange={setShowSpecialOnly}
                brandColor={brandSettings.color}
              />
            </div>
          </div>

          {/* Mobile Filter Sidebar */}
          <FilterSidebar
            isOpen={showFilterSidebar}
            onClose={() => setShowFilterSidebar(false)}
            categories={categories}
            selectedCategories={selectedCategories}
            onCategoryChange={setSelectedCategories}
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
            maxPrice={maxPrice}
            showSpecialOnly={showSpecialOnly}
            onSpecialOnlyChange={setShowSpecialOnly}
            brandColor={brandSettings.color}
          />

          {/* Products Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl shadow-lg">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">
                  {products.length === 0
                    ? user
                      ? "Check back soon for new products!"
                      : "Sign in and visit the admin panel to add products"
                    : "Try adjusting your filters or search query"}
                </p>
                {user && products.length === 0 && (
                  <Button
                    onClick={() => setIsAdminMode(true)}
                    style={{ backgroundColor: brandSettings.color }}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Go to Admin Panel
                  </Button>
                )}
              </div>
            ) : (
              <>
                {/* Hero Section */}
                {selectedCategory === "all" && (
                  <div
                    className="rounded-3xl p-12 mb-8 text-white relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${brandSettings.color} 0%, ${brandSettings.color}DD 100%)`,
                    }}
                  >
                    <div className="relative z-10 max-w-2xl">
                      <h2 className="text-4xl md:text-5xl mb-4">
                        Welcome to {brandSettings.name || "COK Mall"}
                      </h2>
                      <p className="text-xl text-white/90 mb-6">
                        Discover amazing products at great prices
                      </p>
                      {!user && (
                        <Button
                          onClick={() => setShowAuthModal(true)}
                          size="lg"
                          className="bg-white hover:bg-gray-100"
                          style={{ color: brandSettings.color }}
                        >
                          Get Started
                        </Button>
                      )}
                    </div>
                    <div className="absolute right-0 bottom-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mb-32" />
                    <div className="absolute right-32 top-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                  </div>
                )}

                {/* Special Products Section */}
                {specialProducts.length > 0 && selectedCategory === "all" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${brandSettings.color}20` }}
                      >
                        <Star
                          className="w-5 h-5"
                          style={{ color: brandSettings.color }}
                        />
                      </div>
                      <h2 className="text-2xl">Special Offers</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                      {specialProducts.slice(0, 3).map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onAddToCart={handleAddToCart}
                          onProductClick={handleProductClick}
                          brandColor={brandSettings.color}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* All Products Grid */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                  {filteredProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ProductCard
                        product={product}
                        onAddToCart={handleAddToCart}
                        onProductClick={handleProductClick}
                        brandColor={brandSettings.color}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuth}
        brandColor={brandSettings.color}
        brandName={brandSettings.name}
      />

      <CartDrawer
        open={showCartDrawer}
        onClose={() => setShowCartDrawer(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={handleCheckout}
        brandColor={brandSettings.color}
      />

      <CheckoutModal
        open={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        total={cartTotal}
        walletBalance={walletBalance}
        accessToken={accessToken}
        onSuccess={handleOrderSuccess}
        onAddFunds={() => {
          setShowCheckoutModal(false);
          setShowWalletModal(true);
        }}
        items={cart}
        brandColor={brandSettings.color}
      />

      <WalletModal
        open={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        balance={walletBalance}
        accessToken={accessToken}
        onBalanceUpdate={setWalletBalance}
        brandColor={brandSettings.color}
      />

      <OrderTrackingModal
        open={showOrderTracking}
        onClose={() => setShowOrderTracking(false)}
        orderId={currentOrderId}
        accessToken={accessToken}
        brandColor={brandSettings.color}
      />
    </div>
  );
}
