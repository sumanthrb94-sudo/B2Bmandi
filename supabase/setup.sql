-- FreshKart — one-shot Supabase setup: schema + seed (client B2B catalogue + chart images).
-- Paste into Supabase → SQL Editor → Run. Re-running DROPS tables (wipes orders) and reloads.

DROP TABLE IF EXISTS "OrderItem","Order","CartItem","Product","Category","User" CASCADE;
DROP TYPE IF EXISTS "OrderStatus","Role";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('BUYER', 'SELLER', 'ADMIN');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'BUYER',
    "businessName" TEXT,
    "phone" TEXT,
    "gstin" TEXT,
    "address" TEXT,
    "city" TEXT,
    "pincode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "image" TEXT,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'kg',
    "pricePerUnit" DOUBLE PRECISION NOT NULL,
    "minOrderQty" INTEGER NOT NULL DEFAULT 1,
    "stockQty" INTEGER NOT NULL DEFAULT 0,
    "origin" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartItem" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "paymentMethod" TEXT NOT NULL DEFAULT 'COD',
    "deliveryName" TEXT NOT NULL,
    "deliveryPhone" TEXT NOT NULL,
    "deliveryAddress" TEXT NOT NULL,
    "deliveryCity" TEXT NOT NULL,
    "deliveryPincode" TEXT NOT NULL,
    "notes" TEXT,
    "razorpayPaymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "buyerId" TEXT NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "lineTotal" DOUBLE PRECISION NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- CreateIndex
CREATE INDEX "Product_sellerId_idx" ON "Product"("sellerId");

-- CreateIndex
CREATE INDEX "Product_isActive_idx" ON "Product"("isActive");

-- CreateIndex
CREATE INDEX "CartItem_userId_idx" ON "CartItem"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_userId_productId_key" ON "CartItem"("userId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Order_razorpayPaymentId_key" ON "Order"("razorpayPaymentId");

-- CreateIndex
CREATE INDEX "Order_buyerId_idx" ON "Order"("buyerId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_sellerId_idx" ON "OrderItem"("sellerId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- seed data (2 categories, users, 39 client-catalogue products)
INSERT INTO public."Category" (id, name, slug, image) VALUES ('cmqgry9ot0006kr9fs3u5bbjr', 'Vegetables', 'vegetables', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=70');
INSERT INTO public."Category" (id, name, slug, image) VALUES ('cmqgry9qo001xkr9f6liw9qkx', 'Leafy Greens', 'leafy-greens', 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=70');
INSERT INTO public."User" (id, email, password, name, role, "businessName", phone, gstin, address, city, pincode, "createdAt", "updatedAt") VALUES ('cmqgry9ob0000kr9fjqzgbavr', 'admin@b2bmandi.com', '$2a$12$nE7apzuAmIIkwVpZP4rVW.YcgGAQNKe5yU9ogheD8T29d3Zuis/su', 'Mandi Admin', 'ADMIN', 'B2B Mandi', NULL, NULL, NULL, 'Bengaluru', NULL, '2026-06-16 15:05:58.139', '2026-06-16 15:05:58.139');
INSERT INTO public."User" (id, email, password, name, role, "businessName", phone, gstin, address, city, pincode, "createdAt", "updatedAt") VALUES ('cmqgry9of0001kr9fpnybkgxe', 'ramesh@greenfarms.com', '$2a$12$nE7apzuAmIIkwVpZP4rVW.YcgGAQNKe5yU9ogheD8T29d3Zuis/su', 'Ramesh Patil', 'SELLER', 'Green Farms Co-op', '9890011223', '27ABCDE1234F1Z5', 'Green Farms Co-op, Market Yard', 'Nashik', '400001', '2026-06-16 15:05:58.144', '2026-06-16 15:05:58.144');
INSERT INTO public."User" (id, email, password, name, role, "businessName", phone, gstin, address, city, pincode, "createdAt", "updatedAt") VALUES ('cmqgry9oj0002kr9fwd6j5of5', 'lakshmi@freshfields.com', '$2a$12$nE7apzuAmIIkwVpZP4rVW.YcgGAQNKe5yU9ogheD8T29d3Zuis/su', 'Lakshmi Rao', 'SELLER', 'Fresh Fields Trading', '9845567788', '29PQRST5678U2Z1', 'Fresh Fields Trading, Market Yard', 'Bengaluru', '400001', '2026-06-16 15:05:58.147', '2026-06-16 15:05:58.147');
INSERT INTO public."User" (id, email, password, name, role, "businessName", phone, gstin, address, city, pincode, "createdAt", "updatedAt") VALUES ('cmqgry9on0003kr9flma8duoc', 'harpreet@punjabgrains.com', '$2a$12$nE7apzuAmIIkwVpZP4rVW.YcgGAQNKe5yU9ogheD8T29d3Zuis/su', 'Harpreet Singh', 'SELLER', 'Punjab Grains & Mills', '9876012345', '03LMNOP9012Q3Z7', 'Punjab Grains & Mills, Market Yard', 'Abohar', '400001', '2026-06-16 15:05:58.151', '2026-06-16 15:05:58.151');
INSERT INTO public."User" (id, email, password, name, role, "businessName", phone, gstin, address, city, pincode, "createdAt", "updatedAt") VALUES ('cmqgry9op0004kr9fs8wvuy12', 'buyer@kirana.com', '$2a$12$nE7apzuAmIIkwVpZP4rVW.YcgGAQNKe5yU9ogheD8T29d3Zuis/su', 'Suresh Kumar', 'BUYER', 'Suresh Kirana Store', '9812345678', '29BUYER1234A1Z9', '12, Gandhi Bazaar, Basavanagudi', 'Bengaluru', '560004', '2026-06-16 15:05:58.153', '2026-06-16 15:05:58.153');
INSERT INTO public."User" (id, email, password, name, role, "businessName", phone, gstin, address, city, pincode, "createdAt", "updatedAt") VALUES ('cmqgry9or0005kr9ftai8oukp', 'chef@hotelblue.com', '$2a$12$nE7apzuAmIIkwVpZP4rVW.YcgGAQNKe5yU9ogheD8T29d3Zuis/su', 'Anita Desai', 'BUYER', 'Hotel Blue Orchid', '9823456789', NULL, '5, FC Road', 'Pune', '411004', '2026-06-16 15:05:58.155', '2026-06-16 15:05:58.155');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgry9qa001kkr9f1rqwg5e7', 'Bitter Gourd', 'bitter-gourd-jw4m', 'Fresh bitter gourd (kakarakaya).', '/products/bitter-gourd.jpg', 'kg', 45, 10, 250, 'Kolar, Karnataka', true, '2026-06-16 15:05:58.21', '2026-06-16 15:05:58.21', 'cmqgry9ot0006kr9fs3u5bbjr', 'cmqgry9of0001kr9fpnybkgxe');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgry9qc001mkr9fholshnd6', 'Raw Banana', 'raw-banana-omh0', 'Green cooking bananas, sold per piece.', '/products/raw-banana.jpg', 'pc', 9, 12, 800, 'Theni, Tamil Nadu', true, '2026-06-16 15:05:58.212', '2026-06-16 15:05:58.212', 'cmqgry9ot0006kr9fs3u5bbjr', 'cmqgry9oj0002kr9fwd6j5of5');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgry9qd001okr9f613kecvq', 'Raw Mango', 'raw-mango-juuq', 'Tangy raw mangoes for pickles & curries.', '/products/raw-mango.jpg', 'kg', 50, 10, 300, 'Krishnagiri, Tamil Nadu', true, '2026-06-16 15:05:58.214', '2026-06-16 15:05:58.214', 'cmqgry9ot0006kr9fs3u5bbjr', 'cmqgry9on0003kr9flma8duoc');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgry9qg001qkr9f9urjeva3', 'Lemon', 'lemon-l1hs', 'Juicy fresh lemons.', '/products/lemon.jpg', 'kg', 150, 10, 200, 'Vijayawada, Andhra Pradesh', true, '2026-06-16 15:05:58.217', '2026-06-16 15:05:58.217', 'cmqgry9ot0006kr9fs3u5bbjr', 'cmqgry9of0001kr9fpnybkgxe');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgry9qi001skr9fcztmctad', 'Beetroot', 'beetroot-vesb', 'Deep-red beetroot, sold per piece.', '/products/beetroot.jpg', 'pc', 35, 10, 400, 'Ooty, Tamil Nadu', true, '2026-06-16 15:05:58.219', '2026-06-16 15:05:58.219', 'cmqgry9ot0006kr9fs3u5bbjr', 'cmqgry9oj0002kr9fwd6j5of5');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgry9qk001ukr9f53i1tk4u', 'Drumstick', 'drumstick-9xj2', 'Tender drumsticks (munaga).', '/products/drumstick.jpg', 'kg', 60, 10, 250, 'Theni, Tamil Nadu', true, '2026-06-16 15:05:58.221', '2026-06-16 15:05:58.221', 'cmqgry9ot0006kr9fs3u5bbjr', 'cmqgry9on0003kr9flma8duoc');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgry9qm001wkr9fk4xr0e3w', 'Radish', 'radish-i5v0', 'Crisp white radish (mullangi).', '/products/radish.jpg', 'kg', 50, 10, 300, 'Pune, Maharashtra', true, '2026-06-16 15:05:58.223', '2026-06-16 15:05:58.223', 'cmqgry9ot0006kr9fs3u5bbjr', 'cmqgry9of0001kr9fpnybkgxe');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgry9qq001zkr9f6uw04um1', 'Curry Leaves', 'curry-leaves-ogt3', 'Aromatic fresh curry leaves.', '/products/curry-leaves.jpg', 'kg', 60, 5, 120, 'Tamil Nadu', true, '2026-06-16 15:05:58.226', '2026-06-16 15:05:58.226', 'cmqgry9qo001xkr9f6liw9qkx', 'cmqgry9of0001kr9fpnybkgxe');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgry9qs0021kr9fjtleo0ce', 'Kothimeer (Coriander)', 'kothimeer-coriander-2joj', 'Aromatic coriander, cleaned bunches.', '/products/kothimeer.jpg', 'kg', 90, 5, 150, 'Pune, Maharashtra', true, '2026-06-16 15:05:58.229', '2026-06-16 15:05:58.229', 'cmqgry9qo001xkr9f6liw9qkx', 'cmqgry9oj0002kr9fwd6j5of5');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgry9qu0023kr9fsuolztru', 'Pudina (Mint)', 'pudina-mint-wkt1', 'Fresh mint leaves.', '/products/pudina.jpg', 'kg', 50, 5, 120, 'Pune, Maharashtra', true, '2026-06-16 15:05:58.231', '2026-06-16 15:05:58.231', 'cmqgry9qo001xkr9f6liw9qkx', 'cmqgry9on0003kr9flma8duoc');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgry9qw0025kr9fpggto9gn', 'Palak (Spinach)', 'palak-spinach-ogsf', 'Fresh tender spinach, harvested daily.', '/products/palak.jpg', 'kg', 60, 5, 200, 'Pune, Maharashtra', true, '2026-06-16 15:05:58.233', '2026-06-16 15:05:58.233', 'cmqgry9qo001xkr9f6liw9qkx', 'cmqgry9of0001kr9fpnybkgxe');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgry9qy0027kr9fdsn8ciue', 'Gongura', 'gongura-a82i', 'Tangy sorrel leaves (gongura).', '/products/gongura.jpg', 'kg', 50, 5, 150, 'Telangana', true, '2026-06-16 15:05:58.234', '2026-06-16 15:05:58.234', 'cmqgry9qo001xkr9f6liw9qkx', 'cmqgry9oj0002kr9fwd6j5of5');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgry9r10029kr9fq7pjbjch', 'Thotakura (Amaranth)', 'thotakura-amaranth-p412', 'Fresh amaranth greens.', '/products/thotakura.jpg', 'kg', 50, 5, 150, 'Andhra Pradesh', true, '2026-06-16 15:05:58.238', '2026-06-16 15:05:58.238', 'cmqgry9qo001xkr9f6liw9qkx', 'cmqgry9on0003kr9flma8duoc');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgry9r3002bkr9fy0hxic5u', 'Methi (Fenugreek)', 'methi-fenugreek-gipd', 'Fresh methi leaves, cleaned.', '/products/methi.jpg', 'kg', 80, 5, 140, 'Nashik, Maharashtra', true, '2026-06-16 15:05:58.239', '2026-06-16 15:05:58.239', 'cmqgry9qo001xkr9f6liw9qkx', 'cmqgry9of0001kr9fpnybkgxe');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgry9r5002dkr9fwebjm1fp', 'Spring Onion', 'spring-onion-9kwg', 'Crisp spring onions with greens.', '/products/spring-onion.jpg', 'kg', 60, 5, 160, 'Pune, Maharashtra', true, '2026-06-16 15:05:58.241', '2026-06-16 15:05:58.241', 'cmqgry9qo001xkr9f6liw9qkx', 'cmqgry9oj0002kr9fwd6j5of5');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgry9ow0008kr9f784993mt', 'Onion (New Red)', 'onion-new-red-am08', 'Fresh new-crop red onions. Sold loose by the kg.', '/products/onion-new-red.jpg', 'kg', 24, 25, 2000, 'Kurnool, Andhra Pradesh', true, '2026-06-16 15:05:58.16', '2026-06-16 15:05:58.16', 'cmqgry9ot0006kr9fs3u5bbjr', 'cmqgry9of0001kr9fpnybkgxe');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgry9p0000akr9fknohslu5', 'Onion (Big)', 'onion-big-u6t7', 'Large well-cured red onions for bulk kitchens.', '/products/onion-big.jpg', 'kg', 25, 25, 2000, 'Lasalgaon, Maharashtra', true, '2026-06-16 15:05:58.164', '2026-06-16 15:05:58.164', 'cmqgry9ot0006kr9fs3u5bbjr', 'cmqgry9oj0002kr9fwd6j5of5');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgry9p2000ckr9flfvbuh4g', 'Potato', 'potato-1mhw', 'Grade-A potatoes, uniform size.', '/products/potato.jpg', 'kg', 22, 25, 2500, 'Agra, Uttar Pradesh', true, '2026-06-16 15:05:58.166', '2026-06-16 15:05:58.166', 'cmqgry9ot0006kr9fs3u5bbjr', 'cmqgry9on0003kr9flma8duoc');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgry9p4000ekr9f06sfdwca', 'Tomato', 'tomato-s0xn', 'Farm-fresh tomatoes, graded daily.', '/products/tomato.jpg', 'kg', 44, 20, 1200, 'Madanapalle, Andhra Pradesh', true, '2026-06-16 15:05:58.169', '2026-06-16 15:05:58.169', 'cmqgry9ot0006kr9fs3u5bbjr', 'cmqgry9of0001kr9fpnybkgxe');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgry9p6000gkr9fh2lz0gps', 'Green Chilli', 'green-chilli-nsn6', 'Spicy fresh green chillies.', '/products/green-chilli.jpg', 'kg', 60, 10, 400, 'Guntur, Andhra Pradesh', true, '2026-06-16 15:05:58.171', '2026-06-16 15:05:58.171', 'cmqgry9ot0006kr9fs3u5bbjr', 'cmqgry9oj0002kr9fwd6j5of5');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgry9p8000ikr9fe3e675ku', 'Chilli Bajji (Bhajji)', 'chilli-bajji-bhajji-30i1', 'Mild large bajji chillies for frying.', '/products/chilli-bajji.jpg', 'kg', 55, 10, 300, 'Guntur, Andhra Pradesh', true, '2026-06-16 15:05:58.173', '2026-06-16 15:05:58.173', 'cmqgry9ot0006kr9fs3u5bbjr', 'cmqgry9on0003kr9flma8duoc');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgry9pa000kkr9fuc3wttyp', 'Ginger', 'ginger-ml4u', 'Fresh aromatic ginger, mature rhizomes.', '/products/ginger.jpg', 'kg', 135, 10, 300, 'Wayanad, Kerala', true, '2026-06-16 15:05:58.175', '2026-06-16 15:05:58.175', 'cmqgry9ot0006kr9fs3u5bbjr', 'cmqgry9of0001kr9fpnybkgxe');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgry9pc000mkr9fbddw56xk', 'Garlic', 'garlic-808l', 'Plump white garlic bulbs, well cured.', '/products/garlic.jpg', 'kg', 180, 10, 250, 'Madhya Pradesh', true, '2026-06-16 15:05:58.177', '2026-06-16 15:05:58.177', 'cmqgry9ot0006kr9fs3u5bbjr', 'cmqgry9oj0002kr9fwd6j5of5');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgry9pf000okr9f9jusqyzi', 'Cabbage', 'cabbage-8vhh', 'Firm clean green cabbage heads.', '/products/cabbage.jpg', 'kg', 28, 20, 900, 'Ooty, Tamil Nadu', true, '2026-06-16 15:05:58.18', '2026-06-16 15:05:58.18', 'cmqgry9ot0006kr9fs3u5bbjr', 'cmqgry9on0003kr9flma8duoc');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgry9ph000qkr9frarr4fwi', 'Cauliflower', 'cauliflower-16e6', 'Snow-white cauliflower, sold per piece.', '/products/cauliflower.jpg', 'pc', 30, 10, 600, 'Karnal, Haryana', true, '2026-06-16 15:05:58.181', '2026-06-16 15:05:58.181', 'cmqgry9ot0006kr9fs3u5bbjr', 'cmqgry9of0001kr9fpnybkgxe');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgry9pj000skr9ffyi325zs', 'Bottle Gourd', 'bottle-gourd-wpnm', 'Tender bottle gourd, ideal length.', '/products/bottle-gourd.jpg', 'kg', 28, 20, 500, 'Kolar, Karnataka', true, '2026-06-16 15:05:58.183', '2026-06-16 15:05:58.183', 'cmqgry9ot0006kr9fs3u5bbjr', 'cmqgry9oj0002kr9fwd6j5of5');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgry9pl000ukr9fgw3afola', 'Ladies Finger (Okra)', 'ladies-finger-okra-ilqr', 'Tender green okra, hand-picked daily.', '/products/ladies-finger.jpg', 'kg', 38, 10, 350, 'Anand, Gujarat', true, '2026-06-16 15:05:58.185', '2026-06-16 15:05:58.185', 'cmqgry9ot0006kr9fs3u5bbjr', 'cmqgry9on0003kr9flma8duoc');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgry9pm000wkr9f1bj689rb', 'Donda (Tindora)', 'donda-tindora-bx72', 'Fresh ivy gourd / tindora.', '/products/donda.jpg', 'kg', 40, 10, 300, 'Kolar, Karnataka', true, '2026-06-16 15:05:58.187', '2026-06-16 15:05:58.187', 'cmqgry9ot0006kr9fs3u5bbjr', 'cmqgry9of0001kr9fpnybkgxe');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgry9po000ykr9f9ro3kj6c', 'Ridge Gourd', 'ridge-gourd-3x7o', 'Tender ridge gourd (beerakaya).', '/products/ridge-gourd.jpg', 'kg', 48, 10, 300, 'Kolar, Karnataka', true, '2026-06-16 15:05:58.189', '2026-06-16 15:05:58.189', 'cmqgry9ot0006kr9fs3u5bbjr', 'cmqgry9oj0002kr9fwd6j5of5');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgry9pq0010kr9f0zd11o3g', 'Carrot', 'carrot-9h56', 'Sweet red carrots, washed and graded.', '/products/carrot.jpg', 'kg', 48, 10, 600, 'Ooty, Tamil Nadu', true, '2026-06-16 15:05:58.19', '2026-06-16 15:05:58.19', 'cmqgry9ot0006kr9fs3u5bbjr', 'cmqgry9on0003kr9flma8duoc');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgry9ps0012kr9fhx6u60xa', 'Capsicum', 'capsicum-fi8d', 'Crisp green bell peppers, hand-picked.', '/products/capsicum.jpg', 'kg', 55, 10, 400, 'Pune, Maharashtra', true, '2026-06-16 15:05:58.192', '2026-06-16 15:05:58.192', 'cmqgry9ot0006kr9fs3u5bbjr', 'cmqgry9of0001kr9fpnybkgxe');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgry9pu0014kr9f4pzz6xbd', 'Brinjal (Black)', 'brinjal-black-ojba', 'Glossy black round brinjal.', '/products/brinjal-black.jpg', 'kg', 30, 10, 400, 'Kolar, Karnataka', true, '2026-06-16 15:05:58.194', '2026-06-16 15:05:58.194', 'cmqgry9ot0006kr9fs3u5bbjr', 'cmqgry9oj0002kr9fwd6j5of5');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgry9pw0016kr9fwesfngc3', 'Brinjal (Green / White)', 'brinjal-green-white-ytnq', 'Tender green & white brinjal.', '/products/brinjal-green-white.jpg', 'kg', 40, 10, 350, 'Kolar, Karnataka', true, '2026-06-16 15:05:58.196', '2026-06-16 15:05:58.196', 'cmqgry9ot0006kr9fs3u5bbjr', 'cmqgry9on0003kr9flma8duoc');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgry9pz0018kr9f4nzpuoee', 'Brinjal (Purple Long)', 'brinjal-purple-long-73pm', 'Long purple brinjal, low seeds.', '/products/brinjal-purple-long.jpg', 'kg', 40, 10, 350, 'Kolar, Karnataka', true, '2026-06-16 15:05:58.199', '2026-06-16 15:05:58.199', 'cmqgry9ot0006kr9fs3u5bbjr', 'cmqgry9of0001kr9fpnybkgxe');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgry9q0001akr9fgw62g167', 'Dosakai (Yellow Cucumber)', 'dosakai-yellow-cucumber-gjvd', 'Tangy yellow cucumber for curries & dal.', '/products/dosakai.jpg', 'kg', 35, 10, 300, 'Andhra Pradesh', true, '2026-06-16 15:05:58.201', '2026-06-16 15:05:58.201', 'cmqgry9ot0006kr9fs3u5bbjr', 'cmqgry9oj0002kr9fwd6j5of5');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgry9q2001ckr9ft33yn8so', 'Keera (Cucumber)', 'keera-cucumber-p16v', 'Crunchy salad cucumbers, even sized.', '/products/keera.jpg', 'kg', 30, 20, 600, 'Bengaluru Rural, Karnataka', true, '2026-06-16 15:05:58.202', '2026-06-16 15:05:58.202', 'cmqgry9ot0006kr9fs3u5bbjr', 'cmqgry9on0003kr9flma8duoc');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgry9q4001ekr9finmzmd7r', 'Beans (French)', 'beans-french-d159', 'Stringless French beans, crisp & fresh.', '/products/beans.jpg', 'kg', 90, 10, 300, 'Kodaikanal, Tamil Nadu', true, '2026-06-16 15:05:58.204', '2026-06-16 15:05:58.204', 'cmqgry9ot0006kr9fs3u5bbjr', 'cmqgry9of0001kr9fpnybkgxe');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgry9q6001gkr9fhyhlnky0', 'Broad Beans (Chikkudu)', 'broad-beans-chikkudu-3v4y', 'Flat broad beans (chikkudukaya).', '/products/broad-beans.jpg', 'kg', 90, 10, 250, 'Chittoor, Andhra Pradesh', true, '2026-06-16 15:05:58.206', '2026-06-16 15:05:58.206', 'cmqgry9ot0006kr9fs3u5bbjr', 'cmqgry9oj0002kr9fwd6j5of5');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgry9q8001ikr9flvasa1rb', 'Cluster Beans (Gokar)', 'cluster-beans-gokar-lbj5', 'Fresh cluster beans (goru chikkudu).', '/products/cluster-beans.jpg', 'kg', 48, 10, 250, 'Kolar, Karnataka', true, '2026-06-16 15:05:58.208', '2026-06-16 15:05:58.208', 'cmqgry9ot0006kr9fs3u5bbjr', 'cmqgry9on0003kr9flma8duoc');
