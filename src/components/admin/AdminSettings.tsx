import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import {
  Cloud,
  Palette,
  Upload,
  Check,
  Image as ImageIcon,
  X,
  Search,
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { projectId } from "../../utils/supabase/info";

interface CarouselItem {
  id: string;
  imageUrl: string;
  productId: string;
  productName?: string;
}

interface AdminSettingsProps {
  accessToken: string;
  brandColor: string;
  onBrandUpdate: (settings: any) => void;
  brandName?: string;
}

export function AdminSettings({
  accessToken,
  brandColor,
  onBrandUpdate,
  brandName,
}: AdminSettingsProps) {
  const [settings, setSettings] = useState({
    cloudinary: {
      cloudName: "",
      apiKey: "",
      uploadPreset: "",
    },
    brand: {
      color: brandColor,
      logo: "",
      companyName: brandName || "",
    },
    heroBanners: [] as CarouselItem[],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [selectedBannerIndex, setSelectedBannerIndex] = useState<number | null>(
    null
  );

  useEffect(() => {
    fetchSettings();
    fetchProducts();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f4cf61aa/admin/settings`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = await response.json();
      if (data && !data.error) {
        setSettings({
          cloudinary: data.cloudinary || {
            cloudName: "",
            apiKey: "",
            uploadPreset: "",
          },
          brand: data.brand || {
            color: brandColor,
            logo: "",
            companyName: "",
          },
          heroBanners: Array.isArray(data.heroBanners) ? data.heroBanners : [],
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f4cf61aa/products`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = await response.json();
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      console.log(
        "Access token being used:",
        accessToken ? "Present" : "Missing"
      );

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f4cf61aa/admin/settings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(settings),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Server error response:", data);
        throw new Error(data.error || "Failed to save settings");
      }

      toast.success("Settings saved successfully");
      onBrandUpdate(settings);
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (file: File) => {
    if (!settings.cloudinary.cloudName || !settings.cloudinary.uploadPreset) {
      toast.error("Please configure Cloudinary settings first");
      return;
    }

    setUploadingLogo(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", settings.cloudinary.uploadPreset);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${settings.cloudinary.cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      setSettings((prev) => ({
        ...prev,
        brand: { ...prev.brand, logo: data.secure_url },
      }));
      toast.success("Logo uploaded successfully");
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Failed to upload logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleBannerUpload = async (file: File) => {
    if (!settings.cloudinary.cloudName || !settings.cloudinary.uploadPreset) {
      toast.error("Please configure Cloudinary settings first");
      return;
    }

    setUploadingBanner(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", settings.cloudinary.uploadPreset);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${settings.cloudinary.cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      const newBanner: CarouselItem = {
        id: Date.now().toString(),
        imageUrl: data.secure_url,
        productId: "",
        productName: "",
      };
      setSettings((prev) => ({
        ...prev,
        heroBanners: [...prev.heroBanners, newBanner],
      }));
      setSelectedBannerIndex(settings.heroBanners.length);
      toast.success("Hero banner image uploaded successfully");
    } catch (error) {
      console.error("Error uploading banner:", error);
      toast.error("Failed to upload hero banner image");
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleRemoveBannerImage = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      heroBanners: prev.heroBanners.filter((_, i) => i !== index),
    }));
    if (selectedBannerIndex === index) {
      setSelectedBannerIndex(null);
    }
  };

  const handleUpdateBannerProduct = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    setSettings((prev) => {
      const updated = [...prev.heroBanners];
      updated[index] = {
        ...updated[index],
        productId,
        productName: product?.name || "",
      };
      return { ...prev, heroBanners: updated };
    });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl mb-2">Settings</h2>
        <p className="text-gray-500">
          Configure your store settings and integrations
        </p>
      </div>

      {/* Cloudinary Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${brandColor}20` }}
          >
            <Cloud className="w-5 h-5" style={{ color: brandColor }} />
          </div>
          <div>
            <h3>Cloudinary Settings</h3>
            <p className="text-sm text-gray-500">
              Configure image upload settings
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="cloudName">Cloud Name</Label>
            <Input
              id="cloudName"
              value={settings.cloudinary.cloudName}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  cloudinary: {
                    ...settings.cloudinary,
                    cloudName: e.target.value,
                  },
                })
              }
              placeholder="your-cloud-name"
            />
          </div>

          <div>
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              value={settings.cloudinary.apiKey}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  cloudinary: {
                    ...settings.cloudinary,
                    apiKey: e.target.value,
                  },
                })
              }
              placeholder="123456789012345"
            />
          </div>

          <div>
            <Label htmlFor="uploadPreset">Upload Preset</Label>
            <Input
              id="uploadPreset"
              value={settings.cloudinary.uploadPreset}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  cloudinary: {
                    ...settings.cloudinary,
                    uploadPreset: e.target.value,
                  },
                })
              }
              placeholder="your-upload-preset"
            />
            <p className="text-xs text-gray-500 mt-1">
              Create an unsigned upload preset in your Cloudinary dashboard
            </p>
          </div>
        </div>
      </Card>

      <Separator />

      {/* Hero Banner Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${brandColor}20` }}
          >
            <ImageIcon className="w-5 h-5" style={{ color: brandColor }} />
          </div>
          <div>
            <h3>Hero Banner Carousels</h3>
            <p className="text-sm text-gray-500">
              Upload 4.5:1 images linked to specific products. Create multiple
              carousels for different products.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Upload Section */}
          <div>
            <input
              type="file"
              id="banner-upload"
              accept="image/*"
              onChange={(e) =>
                e.target.files?.[0] && handleBannerUpload(e.target.files[0])
              }
              className="hidden"
            />
            <label htmlFor="banner-upload">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={uploadingBanner || !settings.cloudinary.cloudName}
                onClick={() =>
                  document.getElementById("banner-upload")?.click()
                }
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploadingBanner
                  ? "Uploading..."
                  : "Upload New Hero Banner Image (4.5:1)"}
              </Button>
            </label>
            <p className="text-xs text-gray-500 mt-2">
              Each image will be a separate carousel item that you can link to a
              product.
            </p>
            {!settings.cloudinary.cloudName && (
              <p className="text-xs text-orange-600 mt-1">
                Configure Cloudinary settings first to upload banner images
              </p>
            )}
          </div>

          {/* Carousel Items Management */}
          {settings.heroBanners && settings.heroBanners.length > 0 && (
            <div className="space-y-3 pt-4 border-t">
              <p className="text-sm font-medium">
                Carousel Items ({settings.heroBanners.length})
              </p>
              <div className="space-y-3">
                {settings.heroBanners.map((banner, index) => (
                  <div
                    key={banner.id}
                    className={`p-3 rounded-lg border-2 transition-colors cursor-pointer ${
                      selectedBannerIndex === index
                        ? `border-[${brandColor}]`
                        : "border-gray-200"
                    } hover:border-gray-300`}
                    onClick={() => setSelectedBannerIndex(index)}
                  >
                    <div className="flex gap-3">
                      {/* Image Preview */}
                      <div className="relative w-24 h-16 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                        <img
                          src={banner.imageUrl}
                          alt={`Carousel ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1 right-1 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                          #{index + 1}
                        </div>
                      </div>

                      {/* Details and Actions */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="space-y-2">
                          {/* Product Search and Selection */}
                          <div>
                            <Label
                              htmlFor={`product-search-${index}`}
                              className="text-xs"
                            >
                              Link to Product
                            </Label>
                            <div className="flex gap-2">
                              <div className="flex-1 relative">
                                <Search className="absolute left-2 top-2 w-4 h-4 text-gray-400" />
                                <input
                                  id={`product-search-${index}`}
                                  type="text"
                                  placeholder="Search products..."
                                  value={
                                    selectedBannerIndex === index
                                      ? productSearch
                                      : ""
                                  }
                                  onChange={(e) =>
                                    setProductSearch(e.target.value)
                                  }
                                  className="w-full pl-8 pr-3 py-2 border rounded text-sm"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                            </div>

                            {/* Product Dropdown */}
                            {selectedBannerIndex === index && (
                              <div className="mt-2 max-h-40 overflow-y-auto border rounded bg-white">
                                {loadingProducts ? (
                                  <div className="p-2 text-sm text-gray-500">
                                    Loading products...
                                  </div>
                                ) : products.length === 0 ? (
                                  <div className="p-2 text-sm text-gray-500">
                                    No products available
                                  </div>
                                ) : (
                                  products
                                    .filter((p) =>
                                      productSearch === ""
                                        ? true
                                        : p.name
                                            .toLowerCase()
                                            .includes(
                                              productSearch.toLowerCase()
                                            )
                                    )
                                    .map((product) => (
                                      <button
                                        key={product.id}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleUpdateBannerProduct(
                                            index,
                                            product.id
                                          );
                                          setProductSearch("");
                                        }}
                                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                                          banner.productId === product.id
                                            ? "bg-blue-50 text-blue-600 font-medium"
                                            : ""
                                        }`}
                                      >
                                        {product.name} (₦{product.price})
                                      </button>
                                    ))
                                )}
                              </div>
                            )}
                          </div>

                          {/* Selected Product Display */}
                          {banner.productId && (
                            <p className="text-xs text-green-600 font-medium">
                              ✓ Linked to: {banner.productName}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveBannerImage(index);
                        }}
                        className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {settings.heroBanners.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              No carousel items yet. Upload an image to get started.
            </p>
          )}
        </div>
      </Card>

      <Separator />

      {/* Brand Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${brandColor}20` }}
          >
            <Palette className="w-5 h-5" style={{ color: brandColor }} />
          </div>
          <div>
            <h3>Brand Settings</h3>
            <p className="text-sm text-gray-500">
              Customize your brand appearance
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              value={settings.brand.companyName}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  brand: { ...settings.brand, companyName: e.target.value },
                })
              }
              placeholder={brandName || "COK Mall"}
            />
            <p className="text-xs text-gray-500 mt-1">
              Your company or store name
            </p>
          </div>

          <div>
            <Label htmlFor="brandColor">Brand Color</Label>
            <div className="flex gap-3 mt-2">
              <div className="relative">
                <input
                  type="color"
                  id="brandColor"
                  value={settings.brand.color}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      brand: { ...settings.brand, color: e.target.value },
                    })
                  }
                  className="w-20 h-10 rounded-lg cursor-pointer border"
                />
              </div>
              <Input
                value={settings.brand.color}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    brand: { ...settings.brand, color: e.target.value },
                  })
                }
                placeholder="#6366f1"
                className="flex-1"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              This color will be used throughout your store
            </p>
          </div>

          <div>
            <Label>Brand Logo</Label>
            <div className="mt-2 space-y-4">
              {settings.brand.logo && (
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <img
                    src={settings.brand.logo}
                    alt="Brand logo"
                    className="w-16 h-16 object-contain"
                  />
                  <div className="flex-1">
                    <p className="text-sm">Current logo</p>
                    <p className="text-xs text-gray-500 truncate max-w-xs">
                      {settings.brand.logo}
                    </p>
                  </div>
                  <Check className="w-5 h-5 text-green-600" />
                </div>
              )}

              <div>
                <input
                  type="file"
                  id="logo-upload"
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files?.[0] && handleLogoUpload(e.target.files[0])
                  }
                  className="hidden"
                />
                <label htmlFor="logo-upload">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={uploadingLogo || !settings.cloudinary.cloudName}
                    onClick={() =>
                      document.getElementById("logo-upload")?.click()
                    }
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadingLogo ? "Uploading..." : "Upload Logo"}
                  </Button>
                </label>
                {!settings.cloudinary.cloudName && (
                  <p className="text-xs text-orange-600 mt-1">
                    Configure Cloudinary settings first to upload a logo
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          size="lg"
          style={{ backgroundColor: brandColor }}
        >
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
