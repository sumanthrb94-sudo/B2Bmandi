-- FreshKart — one-shot Supabase setup: schema + seed (client catalogue, branded logins, security column).
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


-- seed data
INSERT INTO public."Category" (id, name, slug, image) VALUES ('cmqgsohxq0006lcb9o7ibm2i0', 'Vegetables', 'vegetables', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=70');
INSERT INTO public."Category" (id, name, slug, image) VALUES ('cmqgsohzv001xlcb9tgilm37g', 'Leafy Greens', 'leafy-greens', 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=70');
INSERT INTO public."User" (id, email, password, name, role, "businessName", phone, gstin, address, city, pincode, "createdAt", "updatedAt") VALUES ('cmqgsohx50000lcb91qdw65uk', 'admin@freshkart.in', '$2a$12$uKwPsFMJxf7yLT6PKVgEK.xGvN.ffVbNNwx7ocNAND9dodD3r8Rh.', 'FreshKart Admin', 'ADMIN', 'FreshKart', NULL, NULL, NULL, 'Bengaluru', NULL, '2026-06-16 15:26:21.881', '2026-06-16 15:26:21.881');
INSERT INTO public."User" (id, email, password, name, role, "businessName", phone, gstin, address, city, pincode, "createdAt", "updatedAt") VALUES ('cmqgsohxd0001lcb9cvy27czo', 'ramesh@greenfarms.com', '$2a$12$5lVFnqn9B0dj9p8qXazZGeeox26sTbrvLb4NEncFrp7znGp2sfH9K', 'Ramesh Patil', 'SELLER', 'Green Farms Co-op', '9890011223', '27ABCDE1234F1Z5', 'Green Farms Co-op, Market Yard', 'Nashik', '400001', '2026-06-16 15:26:21.889', '2026-06-16 15:26:21.889');
INSERT INTO public."User" (id, email, password, name, role, "businessName", phone, gstin, address, city, pincode, "createdAt", "updatedAt") VALUES ('cmqgsohxh0002lcb99qyl33ql', 'lakshmi@freshfields.com', '$2a$12$5lVFnqn9B0dj9p8qXazZGeeox26sTbrvLb4NEncFrp7znGp2sfH9K', 'Lakshmi Rao', 'SELLER', 'Fresh Fields Trading', '9845567788', '29PQRST5678U2Z1', 'Fresh Fields Trading, Market Yard', 'Bengaluru', '400001', '2026-06-16 15:26:21.894', '2026-06-16 15:26:21.894');
INSERT INTO public."User" (id, email, password, name, role, "businessName", phone, gstin, address, city, pincode, "createdAt", "updatedAt") VALUES ('cmqgsohxk0003lcb9zquq8rdy', 'harpreet@punjabgrains.com', '$2a$12$5lVFnqn9B0dj9p8qXazZGeeox26sTbrvLb4NEncFrp7znGp2sfH9K', 'Harpreet Singh', 'SELLER', 'Punjab Grains & Mills', '9876012345', '03LMNOP9012Q3Z7', 'Punjab Grains & Mills, Market Yard', 'Abohar', '400001', '2026-06-16 15:26:21.896', '2026-06-16 15:26:21.896');
INSERT INTO public."User" (id, email, password, name, role, "businessName", phone, gstin, address, city, pincode, "createdAt", "updatedAt") VALUES ('cmqgsohxm0004lcb96yec7q4v', 'customer@freshkart.in', '$2a$12$u3fNHuANn7ZgTc20nUjAe.mVPWVHFBfpzT6G.XUqId4WU46mThFR.', 'FreshKart Customer', 'BUYER', 'Suresh Kirana Store', '9812345678', '29BUYER1234A1Z9', '12, Gandhi Bazaar, Basavanagudi', 'Bengaluru', '560004', '2026-06-16 15:26:21.898', '2026-06-16 15:26:21.898');
INSERT INTO public."User" (id, email, password, name, role, "businessName", phone, gstin, address, city, pincode, "createdAt", "updatedAt") VALUES ('cmqgsohxo0005lcb9vuox7cxo', 'chef@hotelblue.com', '$2a$12$5lVFnqn9B0dj9p8qXazZGeeox26sTbrvLb4NEncFrp7znGp2sfH9K', 'Anita Desai', 'BUYER', 'Hotel Blue Orchid', '9823456789', NULL, '5, FC Road', 'Pune', '411004', '2026-06-16 15:26:21.9', '2026-06-16 15:26:21.9');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgsohxv0008lcb940bxwfua', 'Onion (New Red)', 'onion-new-red-8z1x', 'Fresh new-crop red onions. Sold loose by the kg.', '/products/onion-new-red.jpg', 'kg', 24, 25, 2000, 'Kurnool, Andhra Pradesh', true, '2026-06-16 15:26:21.907', '2026-06-16 15:26:21.907', 'cmqgsohxq0006lcb9o7ibm2i0', 'cmqgsohxd0001lcb9cvy27czo');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgsohy3000alcb9bbeenn2d', 'Onion (Big)', 'onion-big-59b6', 'Large well-cured red onions for bulk kitchens.', '/products/onion-big.jpg', 'kg', 25, 25, 2000, 'Lasalgaon, Maharashtra', true, '2026-06-16 15:26:21.915', '2026-06-16 15:26:21.915', 'cmqgsohxq0006lcb9o7ibm2i0', 'cmqgsohxh0002lcb99qyl33ql');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgsohy5000clcb92vxt5mo7', 'Potato', 'potato-disx', 'Grade-A potatoes, uniform size.', '/products/potato.jpg', 'kg', 22, 25, 2500, 'Agra, Uttar Pradesh', true, '2026-06-16 15:26:21.918', '2026-06-16 15:26:21.918', 'cmqgsohxq0006lcb9o7ibm2i0', 'cmqgsohxk0003lcb9zquq8rdy');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgsohy8000elcb9atlwgykq', 'Tomato', 'tomato-8geo', 'Farm-fresh tomatoes, graded daily.', '/products/tomato.jpg', 'kg', 44, 20, 1200, 'Madanapalle, Andhra Pradesh', true, '2026-06-16 15:26:21.92', '2026-06-16 15:26:21.92', 'cmqgsohxq0006lcb9o7ibm2i0', 'cmqgsohxd0001lcb9cvy27czo');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgsohya000glcb9xj2b8poo', 'Green Chilli', 'green-chilli-nrys', 'Spicy fresh green chillies.', '/products/green-chilli.jpg', 'kg', 60, 10, 400, 'Guntur, Andhra Pradesh', true, '2026-06-16 15:26:21.922', '2026-06-16 15:26:21.922', 'cmqgsohxq0006lcb9o7ibm2i0', 'cmqgsohxh0002lcb99qyl33ql');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgsohyc000ilcb9nn05as17', 'Chilli Bajji (Bhajji)', 'chilli-bajji-bhajji-b9ag', 'Mild large bajji chillies for frying.', '/products/chilli-bajji.jpg', 'kg', 55, 10, 300, 'Guntur, Andhra Pradesh', true, '2026-06-16 15:26:21.924', '2026-06-16 15:26:21.924', 'cmqgsohxq0006lcb9o7ibm2i0', 'cmqgsohxk0003lcb9zquq8rdy');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgsohye000klcb99qjv4v0q', 'Ginger', 'ginger-qmp8', 'Fresh aromatic ginger, mature rhizomes.', '/products/ginger.jpg', 'kg', 135, 10, 300, 'Wayanad, Kerala', true, '2026-06-16 15:26:21.926', '2026-06-16 15:26:21.926', 'cmqgsohxq0006lcb9o7ibm2i0', 'cmqgsohxd0001lcb9cvy27czo');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgsohyh000mlcb9ptz9xiyr', 'Garlic', 'garlic-09ch', 'Plump white garlic bulbs, well cured.', '/products/garlic.jpg', 'kg', 180, 10, 250, 'Madhya Pradesh', true, '2026-06-16 15:26:21.929', '2026-06-16 15:26:21.929', 'cmqgsohxq0006lcb9o7ibm2i0', 'cmqgsohxh0002lcb99qyl33ql');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgsohyi000olcb9wcq5vu00', 'Cabbage', 'cabbage-3tvp', 'Firm clean green cabbage heads.', '/products/cabbage.jpg', 'kg', 28, 20, 900, 'Ooty, Tamil Nadu', true, '2026-06-16 15:26:21.931', '2026-06-16 15:26:21.931', 'cmqgsohxq0006lcb9o7ibm2i0', 'cmqgsohxk0003lcb9zquq8rdy');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgsohyk000qlcb9u2yia42u', 'Cauliflower', 'cauliflower-rrem', 'Snow-white cauliflower, sold per piece.', '/products/cauliflower.jpg', 'pc', 30, 10, 600, 'Karnal, Haryana', true, '2026-06-16 15:26:21.933', '2026-06-16 15:26:21.933', 'cmqgsohxq0006lcb9o7ibm2i0', 'cmqgsohxd0001lcb9cvy27czo');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgsohym000slcb90ucclwjk', 'Bottle Gourd', 'bottle-gourd-np1c', 'Tender bottle gourd, ideal length.', '/products/bottle-gourd.jpg', 'kg', 28, 20, 500, 'Kolar, Karnataka', true, '2026-06-16 15:26:21.935', '2026-06-16 15:26:21.935', 'cmqgsohxq0006lcb9o7ibm2i0', 'cmqgsohxh0002lcb99qyl33ql');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgsohyo000ulcb9q4cqpk2s', 'Ladies Finger (Okra)', 'ladies-finger-okra-i7ha', 'Tender green okra, hand-picked daily.', '/products/ladies-finger.jpg', 'kg', 38, 10, 350, 'Anand, Gujarat', true, '2026-06-16 15:26:21.937', '2026-06-16 15:26:21.937', 'cmqgsohxq0006lcb9o7ibm2i0', 'cmqgsohxk0003lcb9zquq8rdy');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgsohyq000wlcb90u9x3sem', 'Donda (Tindora)', 'donda-tindora-2q1n', 'Fresh ivy gourd / tindora.', '/products/donda.jpg', 'kg', 40, 10, 300, 'Kolar, Karnataka', true, '2026-06-16 15:26:21.939', '2026-06-16 15:26:21.939', 'cmqgsohxq0006lcb9o7ibm2i0', 'cmqgsohxd0001lcb9cvy27czo');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgsohys000ylcb9kxbwtbom', 'Ridge Gourd', 'ridge-gourd-rn2w', 'Tender ridge gourd (beerakaya).', '/products/ridge-gourd.jpg', 'kg', 48, 10, 300, 'Kolar, Karnataka', true, '2026-06-16 15:26:21.941', '2026-06-16 15:26:21.941', 'cmqgsohxq0006lcb9o7ibm2i0', 'cmqgsohxh0002lcb99qyl33ql');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgsohyu0010lcb9eltigkjo', 'Carrot', 'carrot-ky25', 'Sweet red carrots, washed and graded.', '/products/carrot.jpg', 'kg', 48, 10, 600, 'Ooty, Tamil Nadu', true, '2026-06-16 15:26:21.943', '2026-06-16 15:26:21.943', 'cmqgsohxq0006lcb9o7ibm2i0', 'cmqgsohxk0003lcb9zquq8rdy');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgsohyw0012lcb9je1csvvu', 'Capsicum', 'capsicum-6lrw', 'Crisp green bell peppers, hand-picked.', '/products/capsicum.jpg', 'kg', 55, 10, 400, 'Pune, Maharashtra', true, '2026-06-16 15:26:21.945', '2026-06-16 15:26:21.945', 'cmqgsohxq0006lcb9o7ibm2i0', 'cmqgsohxd0001lcb9cvy27czo');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgsohyz0014lcb9s4rsslht', 'Brinjal (Black)', 'brinjal-black-qqfy', 'Glossy black round brinjal.', '/products/brinjal-black.jpg', 'kg', 30, 10, 400, 'Kolar, Karnataka', true, '2026-06-16 15:26:21.948', '2026-06-16 15:26:21.948', 'cmqgsohxq0006lcb9o7ibm2i0', 'cmqgsohxh0002lcb99qyl33ql');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgsohz10016lcb9vvmqghi5', 'Brinjal (Green / White)', 'brinjal-green-white-hd05', 'Tender green & white brinjal.', '/products/brinjal-green-white.jpg', 'kg', 40, 10, 350, 'Kolar, Karnataka', true, '2026-06-16 15:26:21.95', '2026-06-16 15:26:21.95', 'cmqgsohxq0006lcb9o7ibm2i0', 'cmqgsohxk0003lcb9zquq8rdy');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgsohz30018lcb9nyl61hvl', 'Brinjal (Purple Long)', 'brinjal-purple-long-iutj', 'Long purple brinjal, low seeds.', '/products/brinjal-purple-long.jpg', 'kg', 40, 10, 350, 'Kolar, Karnataka', true, '2026-06-16 15:26:21.952', '2026-06-16 15:26:21.952', 'cmqgsohxq0006lcb9o7ibm2i0', 'cmqgsohxd0001lcb9cvy27czo');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgsohz5001alcb9s7hnxqmy', 'Dosakai (Yellow Cucumber)', 'dosakai-yellow-cucumber-naig', 'Tangy yellow cucumber for curries & dal.', '/products/dosakai.jpg', 'kg', 35, 10, 300, 'Andhra Pradesh', true, '2026-06-16 15:26:21.954', '2026-06-16 15:26:21.954', 'cmqgsohxq0006lcb9o7ibm2i0', 'cmqgsohxh0002lcb99qyl33ql');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgsohz7001clcb9riuroft9', 'Keera (Cucumber)', 'keera-cucumber-hm7k', 'Crunchy salad cucumbers, even sized.', '/products/keera.jpg', 'kg', 30, 20, 600, 'Bengaluru Rural, Karnataka', true, '2026-06-16 15:26:21.956', '2026-06-16 15:26:21.956', 'cmqgsohxq0006lcb9o7ibm2i0', 'cmqgsohxk0003lcb9zquq8rdy');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgsohz9001elcb9kgbiasui', 'Beans (French)', 'beans-french-tf32', 'Stringless French beans, crisp & fresh.', '/products/beans.jpg', 'kg', 90, 10, 300, 'Kodaikanal, Tamil Nadu', true, '2026-06-16 15:26:21.958', '2026-06-16 15:26:21.958', 'cmqgsohxq0006lcb9o7ibm2i0', 'cmqgsohxd0001lcb9cvy27czo');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgsohzc001glcb9cjyfzz7k', 'Broad Beans (Chikkudu)', 'broad-beans-chikkudu-ogqw', 'Flat broad beans (chikkudukaya).', '/products/broad-beans.jpg', 'kg', 90, 10, 250, 'Chittoor, Andhra Pradesh', true, '2026-06-16 15:26:21.96', '2026-06-16 15:26:21.96', 'cmqgsohxq0006lcb9o7ibm2i0', 'cmqgsohxh0002lcb99qyl33ql');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgsohzd001ilcb9cmnm7v6s', 'Cluster Beans (Gokar)', 'cluster-beans-gokar-9d6i', 'Fresh cluster beans (goru chikkudu).', '/products/cluster-beans.jpg', 'kg', 48, 10, 250, 'Kolar, Karnataka', true, '2026-06-16 15:26:21.962', '2026-06-16 15:26:21.962', 'cmqgsohxq0006lcb9o7ibm2i0', 'cmqgsohxk0003lcb9zquq8rdy');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgsohzg001klcb994s53m5y', 'Bitter Gourd', 'bitter-gourd-79js', 'Fresh bitter gourd (kakarakaya).', '/products/bitter-gourd.jpg', 'kg', 45, 10, 250, 'Kolar, Karnataka', true, '2026-06-16 15:26:21.964', '2026-06-16 15:26:21.964', 'cmqgsohxq0006lcb9o7ibm2i0', 'cmqgsohxd0001lcb9cvy27czo');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgsohzi001mlcb9vjvhtpuv', 'Raw Banana', 'raw-banana-tdf5', 'Green cooking bananas, sold per piece.', '/products/raw-banana.jpg', 'pc', 9, 12, 800, 'Theni, Tamil Nadu', true, '2026-06-16 15:26:21.966', '2026-06-16 15:26:21.966', 'cmqgsohxq0006lcb9o7ibm2i0', 'cmqgsohxh0002lcb99qyl33ql');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgsohzl001olcb9mfmcyq02', 'Raw Mango', 'raw-mango-ryyk', 'Tangy raw mangoes for pickles & curries.', '/products/raw-mango.jpg', 'kg', 50, 10, 300, 'Krishnagiri, Tamil Nadu', true, '2026-06-16 15:26:21.969', '2026-06-16 15:26:21.969', 'cmqgsohxq0006lcb9o7ibm2i0', 'cmqgsohxk0003lcb9zquq8rdy');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgsohzn001qlcb9vf8raq5s', 'Lemon', 'lemon-lqnw', 'Juicy fresh lemons.', '/products/lemon.jpg', 'kg', 150, 10, 200, 'Vijayawada, Andhra Pradesh', true, '2026-06-16 15:26:21.972', '2026-06-16 15:26:21.972', 'cmqgsohxq0006lcb9o7ibm2i0', 'cmqgsohxd0001lcb9cvy27czo');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgsohzp001slcb9vjdkdpog', 'Beetroot', 'beetroot-2ucg', 'Deep-red beetroot, sold per piece.', '/products/beetroot.jpg', 'pc', 35, 10, 400, 'Ooty, Tamil Nadu', true, '2026-06-16 15:26:21.974', '2026-06-16 15:26:21.974', 'cmqgsohxq0006lcb9o7ibm2i0', 'cmqgsohxh0002lcb99qyl33ql');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgsohzr001ulcb9u3emzaim', 'Drumstick', 'drumstick-exeg', 'Tender drumsticks (munaga).', '/products/drumstick.jpg', 'kg', 60, 10, 250, 'Theni, Tamil Nadu', true, '2026-06-16 15:26:21.975', '2026-06-16 15:26:21.975', 'cmqgsohxq0006lcb9o7ibm2i0', 'cmqgsohxk0003lcb9zquq8rdy');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgsohzt001wlcb9tnbwq55t', 'Radish', 'radish-e0vf', 'Crisp white radish (mullangi).', '/products/radish.jpg', 'kg', 50, 10, 300, 'Pune, Maharashtra', true, '2026-06-16 15:26:21.978', '2026-06-16 15:26:21.978', 'cmqgsohxq0006lcb9o7ibm2i0', 'cmqgsohxd0001lcb9cvy27czo');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgsohzx001zlcb9qppgjlfq', 'Curry Leaves', 'curry-leaves-aynd', 'Aromatic fresh curry leaves.', '/products/curry-leaves.jpg', 'kg', 60, 5, 120, 'Tamil Nadu', true, '2026-06-16 15:26:21.981', '2026-06-16 15:26:21.981', 'cmqgsohzv001xlcb9tgilm37g', 'cmqgsohxd0001lcb9cvy27czo');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgsohzz0021lcb9logsij4n', 'Kothimeer (Coriander)', 'kothimeer-coriander-q4rn', 'Aromatic coriander, cleaned bunches.', '/products/kothimeer.jpg', 'kg', 90, 5, 150, 'Pune, Maharashtra', true, '2026-06-16 15:26:21.984', '2026-06-16 15:26:21.984', 'cmqgsohzv001xlcb9tgilm37g', 'cmqgsohxh0002lcb99qyl33ql');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgsoi020023lcb9a9j44gcb', 'Pudina (Mint)', 'pudina-mint-47x5', 'Fresh mint leaves.', '/products/pudina.jpg', 'kg', 50, 5, 120, 'Pune, Maharashtra', true, '2026-06-16 15:26:21.986', '2026-06-16 15:26:21.986', 'cmqgsohzv001xlcb9tgilm37g', 'cmqgsohxk0003lcb9zquq8rdy');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgsoi050025lcb9pd8fe1ge', 'Palak (Spinach)', 'palak-spinach-go8x', 'Fresh tender spinach, harvested daily.', '/products/palak.jpg', 'kg', 60, 5, 200, 'Pune, Maharashtra', true, '2026-06-16 15:26:21.989', '2026-06-16 15:26:21.989', 'cmqgsohzv001xlcb9tgilm37g', 'cmqgsohxd0001lcb9cvy27czo');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgsoi070027lcb99a73v8ni', 'Gongura', 'gongura-086h', 'Tangy sorrel leaves (gongura).', '/products/gongura.jpg', 'kg', 50, 5, 150, 'Telangana', true, '2026-06-16 15:26:21.991', '2026-06-16 15:26:21.991', 'cmqgsohzv001xlcb9tgilm37g', 'cmqgsohxh0002lcb99qyl33ql');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgsoi090029lcb979xkkhvd', 'Thotakura (Amaranth)', 'thotakura-amaranth-ou4g', 'Fresh amaranth greens.', '/products/thotakura.jpg', 'kg', 50, 5, 150, 'Andhra Pradesh', true, '2026-06-16 15:26:21.993', '2026-06-16 15:26:21.993', 'cmqgsohzv001xlcb9tgilm37g', 'cmqgsohxk0003lcb9zquq8rdy');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgsoi0b002blcb9n35fftjx', 'Methi (Fenugreek)', 'methi-fenugreek-7o43', 'Fresh methi leaves, cleaned.', '/products/methi.jpg', 'kg', 80, 5, 140, 'Nashik, Maharashtra', true, '2026-06-16 15:26:21.995', '2026-06-16 15:26:21.995', 'cmqgsohzv001xlcb9tgilm37g', 'cmqgsohxd0001lcb9cvy27czo');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgsoi0d002dlcb92878r5rb', 'Spring Onion', 'spring-onion-liga', 'Crisp spring onions with greens.', '/products/spring-onion.jpg', 'kg', 60, 5, 160, 'Pune, Maharashtra', true, '2026-06-16 15:26:21.997', '2026-06-16 15:26:21.997', 'cmqgsohzv001xlcb9tgilm37g', 'cmqgsohxh0002lcb99qyl33ql');
