import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-f4cf61aa/health", (c) => {
  return c.json({ status: "ok" });
});

// ==================== AUTH ROUTES ====================

// Sign up route
app.post("/make-server-f4cf61aa/auth/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });
    
    if (error) {
      console.log(`Error creating user during signup: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }
    
    // Initialize user wallet
    await kv.set(`wallet:${data.user.id}`, { balance: 0 });
    
    return c.json({ user: data.user });
  } catch (error) {
    console.log(`Error in signup route: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// ==================== ADMIN SETTINGS ROUTES ====================

// Get admin settings
app.get("/make-server-f4cf61aa/admin/settings", async (c) => {
  try {
    const settings = await kv.get('admin:settings') || {
      cloudinary: { cloudName: '', apiKey: '', uploadPreset: '' },
      brand: { color: '#6366f1', logo: '' }
    };
    
    return c.json(settings);
  } catch (error) {
    console.log(`Error fetching admin settings: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Update admin settings
app.post("/make-server-f4cf61aa/admin/settings", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      console.log('No access token provided in admin settings update');
      return c.json({ error: 'No access token provided' }, 401);
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error) {
      console.log(`Auth error in admin settings update: ${error.message}`);
      return c.json({ error: `Authentication failed: ${error.message}` }, 401);
    }
    
    if (!user?.id) {
      console.log('No user found from access token in admin settings update');
      return c.json({ error: 'Unauthorized - invalid token' }, 401);
    }
    
    const settings = await c.req.json();
    console.log('Saving admin settings for user:', user.id);
    await kv.set('admin:settings', settings);
    
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error updating admin settings: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// ==================== PRODUCT ROUTES ====================

// Get all products
app.get("/make-server-f4cf61aa/products", async (c) => {
  try {
    const products = await kv.getByPrefix('product:') || [];
    return c.json(products);
  } catch (error) {
    console.log(`Error fetching products: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Get single product
app.get("/make-server-f4cf61aa/products/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const product = await kv.get(`product:${id}`);
    
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }
    
    return c.json(product);
  } catch (error) {
    console.log(`Error fetching product: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Create product (admin only)
app.post("/make-server-f4cf61aa/products", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const product = await c.req.json();
    const productId = crypto.randomUUID();
    
    const newProduct = {
      id: productId,
      ...product,
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(`product:${productId}`, newProduct);
    
    return c.json(newProduct);
  } catch (error) {
    console.log(`Error creating product: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Update product (admin only)
app.put("/make-server-f4cf61aa/products/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const id = c.req.param('id');
    const updates = await c.req.json();
    const existing = await kv.get(`product:${id}`);
    
    if (!existing) {
      return c.json({ error: 'Product not found' }, 404);
    }
    
    const updated = { ...existing, ...updates };
    await kv.set(`product:${id}`, updated);
    
    return c.json(updated);
  } catch (error) {
    console.log(`Error updating product: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Delete product (admin only)
app.delete("/make-server-f4cf61aa/products/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const id = c.req.param('id');
    await kv.del(`product:${id}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting product: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// ==================== WALLET ROUTES ====================

// Get wallet balance
app.get("/make-server-f4cf61aa/wallet", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const wallet = await kv.get(`wallet:${user.id}`) || { balance: 0 };
    return c.json(wallet);
  } catch (error) {
    console.log(`Error fetching wallet: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Add funds to wallet
app.post("/make-server-f4cf61aa/wallet/add-funds", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { amount } = await c.req.json();
    const wallet = await kv.get(`wallet:${user.id}`) || { balance: 0 };
    wallet.balance += amount;
    
    await kv.set(`wallet:${user.id}`, wallet);
    
    return c.json(wallet);
  } catch (error) {
    console.log(`Error adding funds to wallet: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// ==================== ORDER ROUTES ====================

// Create order
app.post("/make-server-f4cf61aa/orders", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { items, total, deliveryAddress, phoneNumber } = await c.req.json();
    
    // Check wallet balance
    const wallet = await kv.get(`wallet:${user.id}`) || { balance: 0 };
    if (wallet.balance < total) {
      return c.json({ error: 'Insufficient wallet balance' }, 400);
    }
    
    // Deduct from wallet
    wallet.balance -= total;
    await kv.set(`wallet:${user.id}`, wallet);
    
    // Create order
    const orderId = crypto.randomUUID();
    const order = {
      id: orderId,
      userId: user.id,
      items,
      total,
      deliveryAddress,
      phoneNumber,
      status: 'pending',
      location: { lat: 0, lng: 0 }, // Will be updated in real-time
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(`order:${orderId}`, order);
    
    // Add to user's orders
    const userOrders = await kv.get(`userOrders:${user.id}`) || [];
    userOrders.push(orderId);
    await kv.set(`userOrders:${user.id}`, userOrders);
    
    return c.json(order);
  } catch (error) {
    console.log(`Error creating order: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Get user orders
app.get("/make-server-f4cf61aa/orders", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const orderIds = await kv.get(`userOrders:${user.id}`) || [];
    const orders = await kv.mget(orderIds.map((id: string) => `order:${id}`));
    
    return c.json(orders);
  } catch (error) {
    console.log(`Error fetching orders: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Get single order
app.get("/make-server-f4cf61aa/orders/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user?.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const id = c.req.param('id');
    const order = await kv.get(`order:${id}`);
    
    if (!order || order.userId !== user.id) {
      return c.json({ error: 'Order not found' }, 404);
    }
    
    return c.json(order);
  } catch (error) {
    console.log(`Error fetching order: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

// Update order location (for simulation)
app.put("/make-server-f4cf61aa/orders/:id/location", async (c) => {
  try {
    const id = c.req.param('id');
    const { lat, lng, status } = await c.req.json();
    
    const order = await kv.get(`order:${id}`);
    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }
    
    order.location = { lat, lng };
    if (status) {
      order.status = status;
    }
    
    await kv.set(`order:${id}`, order);
    
    return c.json(order);
  } catch (error) {
    console.log(`Error updating order location: ${error}`);
    return c.json({ error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);