import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Save,
  Camera,
  Wallet,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { toast } from 'sonner@2.0.3';

interface ProfilePageProps {
  user: any;
  onBack: () => void;
  onLogout: () => void;
  walletBalance: number;
  onOpenWallet: () => void;
  brandColor: string;
}

export function ProfilePage({
  user,
  onBack,
  onLogout,
  walletBalance,
  onOpenWallet,
  brandColor,
}: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.user_metadata?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    // Load saved profile data from localStorage
    const saved = localStorage.getItem('userProfile');
    if (saved) {
      const parsed = JSON.parse(saved);
      setProfileData({
        ...profileData,
        ...parsed,
        email: user?.email || '', // Always use actual email
      });
    }
  }, [user]);

  const handleSave = () => {
    // Save to localStorage
    localStorage.setItem('userProfile', JSON.stringify(profileData));
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const handleChange = (field: string, value: string) => {
    setProfileData({ ...profileData, [field]: value });
  };

  const getInitials = () => {
    const name = profileData.name || user?.email || 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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
          <h1 className="text-4xl mb-8">My Profile</h1>

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl overflow-hidden shadow-lg mb-6"
          >
            {/* Banner */}
            <div
              className="h-32 relative"
              style={{
                background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}DD 100%)`,
              }}
            >
              <div className="absolute -bottom-16 left-8">
                <div className="relative">
                  <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                    <AvatarImage src="" />
                    <AvatarFallback
                      className="text-3xl text-white"
                      style={{ backgroundColor: brandColor }}
                    >
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    className="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors"
                    onClick={() => toast.info('Avatar upload coming soon!')}
                  >
                    <Camera className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-20 p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-3xl mb-2">
                    {profileData.name || 'User'}
                  </h2>
                  <p className="text-gray-600">{profileData.email}</p>
                </div>
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    className="gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      className="gap-2 text-white"
                      style={{ backgroundColor: brandColor }}
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </Button>
                  </div>
                )}
              </div>

              <Separator className="mb-6" />

              {/* Profile Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name" className="mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    value={profileData.email}
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    disabled={!isEditing}
                    placeholder="+234 123 456 7890"
                  />
                </div>

                <div>
                  <Label htmlFor="address" className="mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Delivery Address
                  </Label>
                  <Input
                    id="address"
                    value={profileData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter your address"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Wallet Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-8 shadow-lg mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: brandColor }}
                >
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl">Wallet Balance</h3>
                  <p className="text-sm text-gray-600">Available funds</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl" style={{ color: brandColor }}>
                  ₦{walletBalance.toFixed(2)}
                </div>
              </div>
            </div>
            <Button
              onClick={onOpenWallet}
              className="w-full text-white"
              style={{ backgroundColor: brandColor }}
            >
              Manage Wallet
            </Button>
          </motion.div>

          {/* Account Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl p-8 shadow-lg"
          >
            <h3 className="text-xl mb-4">Account Settings</h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => toast.info('Change password coming soon!')}
              >
                Change Password
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => toast.info('Notification settings coming soon!')}
              >
                Notification Settings
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => toast.info('Privacy settings coming soon!')}
              >
                Privacy Settings
              </Button>
              <Separator />
              <Button
                variant="destructive"
                className="w-full"
                onClick={onLogout}
              >
                Logout
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
