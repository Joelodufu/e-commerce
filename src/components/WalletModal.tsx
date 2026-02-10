import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Wallet, Plus } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId } from '../utils/supabase/info';

interface WalletModalProps {
  open: boolean;
  onClose: () => void;
  balance: number;
  accessToken: string;
  onBalanceUpdate: (newBalance: number) => void;
  brandColor: string;
}

export function WalletModal({
  open,
  onClose,
  balance,
  accessToken,
  onBalanceUpdate,
  brandColor,
}: WalletModalProps) {
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const quickAmounts = [10, 25, 50, 100];

  const handleAddFunds = async (value: number) => {
    setIsProcessing(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f4cf61aa/wallet/add-funds`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ amount: value }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add funds');
      }

      toast.success(`Added ₦${value.toFixed(2)} to your wallet`);
      onBalanceUpdate(data.balance);
      setAmount('');
    } catch (error: any) {
      console.error('Add funds error:', error);
      toast.error(error.message || 'Failed to add funds');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(amount);
    if (value > 0) {
      handleAddFunds(value);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Your Wallet</DialogTitle>
          <DialogDescription>
            Add funds to your wallet to use for transactions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Current Balance */}
          <div
            className="rounded-2xl p-6 text-white"
            style={{
              background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}DD 100%)`,
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <Wallet className="w-6 h-6" />
              <span className="text-white/80">Current Balance</span>
            </div>
            <p className="text-4xl">₦{balance.toFixed(2)}</p>
          </div>

          {/* Quick Add Amounts */}
          <div>
            <Label className="mb-3 block">Quick Add</Label>
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map((value) => (
                <Button
                  key={value}
                  variant="outline"
                  onClick={() => handleAddFunds(value)}
                  disabled={isProcessing}
                  className="h-12"
                >
                  ₦{value}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="custom-amount">Custom Amount</Label>
              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  ₦
                </span>
                <Input
                  id="custom-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-7"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!amount || parseFloat(amount) <= 0 || isProcessing}
              style={{ backgroundColor: brandColor }}
            >
              <Plus className="w-4 h-4 mr-2" />
              {isProcessing ? 'Processing...' : 'Add Funds'}
            </Button>
          </form>

          <p className="text-xs text-gray-500 text-center">
            This is a demo wallet. In production, integrate with a real payment gateway.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}