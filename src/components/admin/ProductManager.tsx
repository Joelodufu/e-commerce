import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Plus, Edit, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { projectId } from "../../utils/supabase/info";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  category?: string;
  stock?: number;
  flash?: {
    active: boolean;
    price?: number;
    ends_at?: string; // ISO date string
  };
}

interface ProductManagerProps {
  accessToken: string;
  brandColor: string;
}

export function ProductManager({
  accessToken,
  brandColor,
}: ProductManagerProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [cloudinarySettings, setCloudinarySettings] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    stock: "",
    images: [] as string[],
    flashSale: false,
    flashPrice: "",
    flashEnd: "",
  });
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchSettings();
  }, []);

  const fetchProducts = async () => {
    try {
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
      setIsLoading(false);
    }
  };

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
      if (data && data.cloudinary) {
        setCloudinarySettings(data.cloudinary);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const handleImageUpload = async (files: FileList) => {
    if (!cloudinarySettings?.cloudName || !cloudinarySettings?.uploadPreset) {
      toast.error("Please configure Cloudinary settings first");
      return;
    }

    setUploadingImages(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", cloudinarySettings.uploadPreset);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudinarySettings.cloudName}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();
        return data.secure_url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));

      toast.success(`Uploaded ${uploadedUrls.length} image(s)`);
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Failed to upload images");
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.images.length === 0) {
      toast.error("Please add at least one image");
      return;
    }

    try {
      const url = editingProduct
        ? `https://${projectId}.supabase.co/functions/v1/make-server-f4cf61aa/products/${editingProduct.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-f4cf61aa/products`;

      const response = await fetch(url, {
        method: editingProduct ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: formData.name,
          price: parseFloat(formData.price),
          description: formData.description,
          category: formData.category,
          stock: formData.stock ? parseInt(formData.stock) : undefined,
          images: formData.images,
          // flash sale metadata (optional)
          flash: formData.flashSale
            ? {
                active: true,
                price: formData.flashPrice
                  ? parseFloat(formData.flashPrice)
                  : undefined,
                ends_at: formData.flashEnd
                  ? new Date(formData.flashEnd).toISOString()
                  : undefined,
              }
            : { active: false },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save product");
      }

      toast.success(editingProduct ? "Product updated" : "Product created");
      setIsDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f4cf61aa/products/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      toast.success("Product deleted");
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      description: product.description,
      category: product.category || "",
      stock: product.stock?.toString() || "",
      images: product.images,
      flashSale: product.flash?.active ?? false,
      flashPrice: product.flash?.price ? product.flash.price.toString() : "",
      flashEnd: product.flash?.ends_at
        ? new Date(product.flash.ends_at).toISOString().slice(0, 16)
        : "",
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      price: "",
      description: "",
      category: "",
      stock: "",
      images: [],
      flashSale: false,
      flashPrice: "",
      flashEnd: "",
    });
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl">Products</h2>
          <p className="text-gray-500">Manage your product catalog</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
          style={{ backgroundColor: brandColor }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">
          Loading products...
        </div>
      ) : products.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 mb-2">No products yet</p>
          <p className="text-sm text-gray-500">
            Get started by adding your first product
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="mb-1">{product.name}</h3>
                {product.flash?.active && (
                  <div className="inline-block mb-2">
                    <span className="text-xs bg-yellow-400 text-black px-2 py-1 rounded-full">
                      Flash Sale
                    </span>
                  </div>
                )}
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl" style={{ color: brandColor }}>
                    {product.flash?.active && product.flash?.price ? (
                      <>
                        <span className="text-lg line-through mr-2 opacity-70">
                          ₦{product.price.toFixed(2)}
                        </span>
                        <span className="text-xl font-semibold">
                          ₦{product.flash.price.toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <>₦{product.price.toFixed(2)}</>
                    )}
                  </span>
                  {product.stock !== undefined && (
                    <span className="text-sm text-gray-500">
                      Stock: {product.stock}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(product)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(product.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Add Product"}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? "Edit the product details"
                : "Add a new product to your catalog"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price (₦)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
                rows={3}
              />
            </div>

            <div>
              <Label>Flash / Splash Sale</Label>
              <div className="mt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.flashSale}
                    onChange={(e) =>
                      setFormData({ ...formData, flashSale: e.target.checked })
                    }
                  />
                  <span className="text-sm">Add to flash/splash sales</span>
                </label>

                {formData.flashSale && (
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <Label htmlFor="flashPrice">Sale Price (₦)</Label>
                      <Input
                        id="flashPrice"
                        type="number"
                        step="0.01"
                        value={formData.flashPrice}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            flashPrice: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="flashEnd">Ends At</Label>
                      <Input
                        id="flashEnd"
                        type="datetime-local"
                        value={formData.flashEnd}
                        onChange={(e) =>
                          setFormData({ ...formData, flashEnd: e.target.value })
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label>Product Images</Label>
              <div className="mt-2 space-y-4">
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-3">
                    {formData.images.map((url, index) => (
                      <div key={index} className="relative group aspect-square">
                        <img
                          src={url}
                          alt={`Product ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <input
                    type="file"
                    id="image-upload"
                    multiple
                    accept="image/*"
                    onChange={(e) =>
                      e.target.files && handleImageUpload(e.target.files)
                    }
                    className="hidden"
                  />
                  <label htmlFor="image-upload">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled={uploadingImages}
                      onClick={() =>
                        document.getElementById("image-upload")?.click()
                      }
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadingImages ? "Uploading..." : "Upload Images"}
                    </Button>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                style={{ backgroundColor: brandColor }}
              >
                {editingProduct ? "Update Product" : "Create Product"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Package({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  );
}
