import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ProductManager } from "./ProductManager";
import { AdminSettings } from "./AdminSettings";
import { Package, Settings, LogOut } from "lucide-react";
import { Button } from "../ui/button";

interface AdminPanelProps {
  accessToken: string;
  onLogout: () => void;
  brandColor: string;
  brandName?: string;
  onBrandUpdate: (settings: any) => void;
}

export function AdminPanel({
  accessToken,
  onLogout,
  brandColor,
  brandName,
  onBrandUpdate,
}: AdminPanelProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
              style={{ backgroundColor: brandColor }}
            >
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl">
                {(brandName || "COK Mall") + " Admin"}
              </h1>
              <p className="text-sm text-gray-500">Dashboard & Settings</p>
            </div>
          </div>

          <Button variant="outline" onClick={onLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products" className="gap-2">
              <Package className="w-4 h-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <ProductManager accessToken={accessToken} brandColor={brandColor} />
          </TabsContent>

          <TabsContent value="settings">
            <AdminSettings
              accessToken={accessToken}
              brandColor={brandColor}
              brandName={brandName}
              onBrandUpdate={onBrandUpdate}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
