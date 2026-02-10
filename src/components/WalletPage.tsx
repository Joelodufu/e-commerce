import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Smartphone,
  Building2,
  TrendingUp,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { projectId } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
}

interface WalletPageProps {
  onBack: () => void;
  balance: number;
  accessToken: string;
  onBalanceUpdate: (balance: number) => void;
  brandColor: string;
}

export function WalletPage({
  onBack,
  balance,
  accessToken,
  onBalanceUpdate,
  brandColor,
}: WalletPageProps) {
  const [addAmount, setAddAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [transactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'credit',
      amount: 50000,
      description: 'Wallet Top-up',
      date: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: '2',
      type: 'debit',
      amount: 25000,
      description: 'Purchase - Order #ABC123',
      date: new Date(Date.now() - 172800000).toISOString(),
    },
  ]);

  const handleAddFunds = async () => {
    const amount = parseFloat(addAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f4cf61aa/wallet/add-funds`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ amount }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to add funds');
      }

      const data = await response.json();
      onBalanceUpdate(data.balance);
      setAddAmount('');
      toast.success(`₦${amount.toFixed(2)} added to your wallet!`);
    } catch (error) {
      console.error('Error adding funds:', error);
      toast.error('Failed to add funds. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const quickAmounts = [5000, 10000, 25000, 50000];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const paymentMethods = [
    { id: 'card', name: 'Debit/Credit Card', icon: CreditCard },
    { id: 'bank', name: 'Bank Transfer', icon: Building2 },
    { id: 'ussd', name: 'USSD', icon: Smartphone },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-5 h-5" />
            Back
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl mb-8">My Wallet</h1>

          {/* Balance Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-3xl p-8 mb-8 text-white overflow-hidden shadow-2xl"
            style={{
              background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}DD 100%)`,
            }}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">Available Balance</p>
                    <h2 className="text-4xl">₦{balance.toFixed(2)}</h2>
                  </div>
                </div>
                <Badge className="bg-white/20 backdrop-blur-sm text-white border-0">
                  Active
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-white/80 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>Ready for checkout</span>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute right-0 bottom-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mb-32" />
            <div className="absolute right-32 top-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          </motion.div>

          {/* Add Funds Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-8 shadow-lg mb-8"
          >
            <h3 className="text-2xl mb-6">Add Funds</h3>

            <Tabs defaultValue="card" className="mb-6">
              <TabsList className="grid grid-cols-3 w-full">
                {paymentMethods.map((method) => (
                  <TabsTrigger
                    key={method.id}
                    value={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                  >
                    <method.icon className="w-4 h-4 mr-2" />
                    {method.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {paymentMethods.map((method) => (
                <TabsContent key={method.id} value={method.id} className="mt-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="amount" className="mb-2">
                        Amount (₦)
                      </Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        value={addAmount}
                        onChange={(e) => setAddAmount(e.target.value)}
                        className="text-xl"
                      />
                    </div>

                    {/* Quick Amounts */}
                    <div>
                      <Label className="mb-2">Quick Add</Label>
                      <div className="grid grid-cols-4 gap-2">
                        {quickAmounts.map((amount) => (
                          <Button
                            key={amount}
                            variant="outline"
                            onClick={() => setAddAmount(amount.toString())}
                            className="hover:border-current"
                            style={
                              addAmount === amount.toString()
                                ? { borderColor: brandColor, color: brandColor }
                                : {}
                            }
                          >
                            ₦{(amount / 1000).toFixed(0)}k
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <p className="text-sm text-blue-900">
                        💡 <strong>Note:</strong> This is a demo payment system. In
                        production, this would integrate with a payment gateway like
                        Paystack or Flutterwave.
                      </p>
                    </div>

                    <Button
                      onClick={handleAddFunds}
                      disabled={loading || !addAmount}
                      size="lg"
                      className="w-full text-white"
                      style={{ backgroundColor: brandColor }}
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </span>
                      ) : (
                        <>
                          <Plus className="w-5 h-5 mr-2" />
                          Add ₦{addAmount || '0.00'} to Wallet
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </motion.div>

          {/* Transaction History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-8 shadow-lg"
          >
            <h3 className="text-2xl mb-6">Recent Transactions</h3>

            {transactions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Wallet className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No transactions yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          transaction.type === 'credit'
                            ? 'bg-green-100'
                            : 'bg-red-100'
                        }`}
                      >
                        {transaction.type === 'credit' ? (
                          <ArrowDownLeft className="w-6 h-6 text-green-600" />
                        ) : (
                          <ArrowUpRight className="w-6 h-6 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(transaction.date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-xl ${
                          transaction.type === 'credit'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {transaction.type === 'credit' ? '+' : '-'}₦
                        {transaction.amount.toFixed(2)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
