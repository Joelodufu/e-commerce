import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Wallet, CreditCard, MapPin } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId } from '../utils/supabase/info';

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  total: number;
  walletBalance: number;
  accessToken: string;
  onSuccess: (orderId: string) => void;
  onAddFunds: () => void;
  items: any[];
  brandColor: string;
}

export function CheckoutModal({
  open,
  onClose,
  total,
  walletBalance,
  accessToken,
  onSuccess,
  onAddFunds,
  items,
  brandColor,
}: CheckoutModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    phoneNumber: '',
  });

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (walletBalance < total) {
      toast.error('Insufficient wallet balance');
      return;
    }

    if (!deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.phoneNumber) {
      toast.error('Please fill in all delivery address fields');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f4cf61aa/orders`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            items,
            total,
            deliveryAddress: `${deliveryAddress.street}, ${deliveryAddress.city}`,
            phoneNumber: deliveryAddress.phoneNumber,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      toast.success('Order placed successfully!');
      onSuccess(data.id);
      onClose();
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to place order');
    } finally {
      setIsProcessing(false);
    }
  };

  const canCheckout = walletBalance >= total;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Checkout</DialogTitle>
          <DialogDescription>Enter your delivery address and confirm your order.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Wallet Balance */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${brandColor}20` }}
              >
                <Wallet className="w-5 h-5" style={{ color: brandColor }} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Wallet Balance</p>
                <p className="text-xl" style={{ color: brandColor }}>
                  ₦{walletBalance.toFixed(2)}
                </p>
              </div>
            </div>

            {!canCheckout && (
              <Button
                onClick={onAddFunds}
                variant="outline"
                size="sm"
                className="w-full mt-2"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Add Funds
              </Button>
            )}
          </div>

          {/* Delivery Address */}
          <form onSubmit={handleCheckout} className="space-y-4">
            <div>
              <Label htmlFor="street" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Delivery Address
              </Label>
              <Input
                id="street"
                placeholder="Street address"
                value={deliveryAddress.street}
                onChange={(e) =>
                  setDeliveryAddress({ ...deliveryAddress, street: e.target.value })
                }
                required
                className="mt-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Input
                  placeholder="City"
                  value={deliveryAddress.city}
                  onChange={(e) =>
                    setDeliveryAddress({ ...deliveryAddress, city: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Input
                  placeholder="Phone Number"
                  value={deliveryAddress.phoneNumber}
                  onChange={(e) =>
                    setDeliveryAddress({ ...deliveryAddress, phoneNumber: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>₦{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span>Total</span>
                <span className="text-xl" style={{ color: brandColor }}>
                  ₦{total.toFixed(2)}
                </span>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={!canCheckout || isProcessing}
              style={{ backgroundColor: brandColor }}
            >
              {isProcessing
                ? 'Processing...'
                : canCheckout
                ? 'Place Order'
                : 'Insufficient Balance'}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}