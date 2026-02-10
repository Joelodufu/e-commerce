# COK Mall E-Commerce Platform - Setup Guide

Welcome to COK Mall! This is a fully functional e-commerce platform with user authentication, wallet system, order tracking, and a complete admin panel.

## 🚀 Getting Started

### First Time Setup

1. **Access the Application**

   - The app will show a splash screen on first load
   - After the splash screen, you'll see the main storefront

2. **Create an Admin Account**

   - Click "Sign In" in the header
   - Go to "Sign Up" tab
   - Create your account (this will be your admin account)

3. **Access Admin Panel**

   - Once logged in, click the Shield icon (🛡️) in the header
   - This will take you to the admin dashboard

4. **Configure Cloudinary (Required for Images)**

   - In Admin Panel, go to "Settings" tab
   - Under "Cloudinary Settings", enter:
     - **Cloud Name**: Your Cloudinary cloud name
     - **API Key**: Your Cloudinary API key
     - **Upload Preset**: Your unsigned upload preset name

   To get these values:

   - Sign up at https://cloudinary.com (free tier available)
   - Find Cloud Name in your dashboard
   - Create an unsigned upload preset in Settings > Upload
   - Note: Make sure the upload preset is set to "Unsigned"

5. **Configure Brand Settings**

   - In the same Settings tab, scroll to "Brand Settings"
   - Select your brand color (will be used throughout the app)
   - Upload your logo (requires Cloudinary setup)
   - Click "Save Settings"

6. **Add Products**
   - Go to "Products" tab in Admin Panel
   - Click "Add Product"
   - Fill in product details:
     - Name, price, description, category, stock
     - Upload multiple images (drag and drop supported)
   - Click "Create Product"

## 💡 Customer Flow

### Shopping Experience

1. **Browse Products**

   - Products are displayed on the main page
   - Use the search bar to find specific items
   - Click the heart icon to favorite products

2. **Add to Cart**

   - Click "Add to Cart" on any product
   - If not logged in, you'll be prompted to create an account
   - View cart by clicking the cart icon in the header

3. **Manage Wallet**

   - Click the wallet icon to add funds
   - Use quick add buttons ($10, $25, $50, $100)
   - Or enter a custom amount
   - Note: This is a demo wallet (in production, integrate real payment)

4. **Checkout**

   - Click "Proceed to Checkout" in the cart
   - Enter delivery address
   - Payment is deducted from wallet
   - Order is placed automatically

5. **Track Order**
   - After placing an order, you'll see the order tracking modal
   - View order status (Pending → Processing → Shipped → Delivered)
   - See live map simulation of delivery

## 🎨 Brand Customization

The entire application uses your brand settings:

- **Brand Color**: Applied to buttons, badges, highlights, and accents
- **Logo**: Displayed in header and splash screen
- All settings are applied in real-time across the platform

## 📱 Features

### Customer Features

- ✅ Splash screen loading animation
- ✅ User authentication (signup/login)
- ✅ Product browsing with search
- ✅ Shopping cart management
- ✅ In-app wallet system
- ✅ Secure checkout
- ✅ Live order tracking with map
- ✅ Responsive design (mobile & desktop)

### Admin Features

- ✅ Product management (CRUD operations)
- ✅ Multiple image upload per product
- ✅ Cloudinary integration
- ✅ Brand customization (color & logo)
- ✅ Settings management

## 🔐 Security Notes

**Important**: This is a prototype application built for demonstration purposes.

For production use, you should:

- Implement proper payment gateway integration (Stripe, PayPal, etc.)
- Add email verification for user accounts
- Implement proper role-based access control
- Add SSL/TLS encryption
- Follow PCI compliance for payment data
- Implement rate limiting and security headers
- Add proper error handling and logging

## 🛠️ Technical Details

### Backend

- Supabase for authentication and data storage
- RESTful API with Hono framework
- Key-value store for data persistence

### Frontend

- React with TypeScript
- Tailwind CSS for styling
- Motion/React for animations
- Shadcn/UI components
- Cloudinary for image storage

### Image Upload Pipeline

1. User selects images in frontend
2. Images uploaded directly to Cloudinary
3. Cloudinary returns secure URLs
4. URLs stored in backend asynchronously
5. Images served via Cloudinary CDN

## 📞 Support

If you encounter any issues:

1. Check that Cloudinary settings are configured correctly
2. Ensure you're logged in when accessing admin features
3. Verify that your wallet has sufficient balance for checkout
4. Clear browser cache if experiencing display issues

## 🎯 Next Steps

Consider adding:

- Email notifications for orders
- Product categories and filtering
- User order history page
- Product reviews and ratings
- Wishlist functionality
- Discount codes and promotions
- Multi-currency support
- Real-time inventory management
