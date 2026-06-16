-- FreshKart — one-shot Supabase setup: schema + seed (client B2B catalogue).
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
INSERT INTO public."Category" (id, name, slug, image) VALUES ('cmqgrpamp00064y3imfd8eomv', 'Vegetables', 'vegetables', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=70');
INSERT INTO public."Category" (id, name, slug, image) VALUES ('cmqgrpaom001x4y3inuuvw3b6', 'Leafy Greens', 'leafy-greens', 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=70');
INSERT INTO public."User" (id, email, password, name, role, "businessName", phone, gstin, address, city, pincode, "createdAt", "updatedAt") VALUES ('cmqgrpam100004y3iuexc3tfp', 'admin@b2bmandi.com', '$2a$12$7aUW28CM59Mgny8mbfDuW.SfwayvWZ8urOEVbUo9rvpD2j.dx.DdK', 'Mandi Admin', 'ADMIN', 'B2B Mandi', NULL, NULL, NULL, 'Bengaluru', NULL, '2026-06-16 14:58:59.449', '2026-06-16 14:58:59.449');
INSERT INTO public."User" (id, email, password, name, role, "businessName", phone, gstin, address, city, pincode, "createdAt", "updatedAt") VALUES ('cmqgrpamc00014y3ixx2wlaxr', 'ramesh@greenfarms.com', '$2a$12$7aUW28CM59Mgny8mbfDuW.SfwayvWZ8urOEVbUo9rvpD2j.dx.DdK', 'Ramesh Patil', 'SELLER', 'Green Farms Co-op', '9890011223', '27ABCDE1234F1Z5', 'Green Farms Co-op, Market Yard', 'Nashik', '400001', '2026-06-16 14:58:59.46', '2026-06-16 14:58:59.46');
INSERT INTO public."User" (id, email, password, name, role, "businessName", phone, gstin, address, city, pincode, "createdAt", "updatedAt") VALUES ('cmqgrpamf00024y3ifsmqd76g', 'lakshmi@freshfields.com', '$2a$12$7aUW28CM59Mgny8mbfDuW.SfwayvWZ8urOEVbUo9rvpD2j.dx.DdK', 'Lakshmi Rao', 'SELLER', 'Fresh Fields Trading', '9845567788', '29PQRST5678U2Z1', 'Fresh Fields Trading, Market Yard', 'Bengaluru', '400001', '2026-06-16 14:58:59.463', '2026-06-16 14:58:59.463');
INSERT INTO public."User" (id, email, password, name, role, "businessName", phone, gstin, address, city, pincode, "createdAt", "updatedAt") VALUES ('cmqgrpamh00034y3inkjicz5e', 'harpreet@punjabgrains.com', '$2a$12$7aUW28CM59Mgny8mbfDuW.SfwayvWZ8urOEVbUo9rvpD2j.dx.DdK', 'Harpreet Singh', 'SELLER', 'Punjab Grains & Mills', '9876012345', '03LMNOP9012Q3Z7', 'Punjab Grains & Mills, Market Yard', 'Abohar', '400001', '2026-06-16 14:58:59.466', '2026-06-16 14:58:59.466');
INSERT INTO public."User" (id, email, password, name, role, "businessName", phone, gstin, address, city, pincode, "createdAt", "updatedAt") VALUES ('cmqgrpamk00044y3ihmikkxyz', 'buyer@kirana.com', '$2a$12$7aUW28CM59Mgny8mbfDuW.SfwayvWZ8urOEVbUo9rvpD2j.dx.DdK', 'Suresh Kumar', 'BUYER', 'Suresh Kirana Store', '9812345678', '29BUYER1234A1Z9', '12, Gandhi Bazaar, Basavanagudi', 'Bengaluru', '560004', '2026-06-16 14:58:59.468', '2026-06-16 14:58:59.468');
INSERT INTO public."User" (id, email, password, name, role, "businessName", phone, gstin, address, city, pincode, "createdAt", "updatedAt") VALUES ('cmqgrpamn00054y3ikwbz2t2l', 'chef@hotelblue.com', '$2a$12$7aUW28CM59Mgny8mbfDuW.SfwayvWZ8urOEVbUo9rvpD2j.dx.DdK', 'Anita Desai', 'BUYER', 'Hotel Blue Orchid', '9823456789', NULL, '5, FC Road', 'Pune', '411004', '2026-06-16 14:58:59.471', '2026-06-16 14:58:59.471');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgrpams00084y3i6r2oa9e3', 'Onion (New Red)', 'onion-new-red-bcwj', 'Fresh new-crop red onions. Sold loose by the kg.', '/products/onion.jpg', 'kg', 24, 25, 2000, 'Kurnool, Andhra Pradesh', true, '2026-06-16 14:58:59.476', '2026-06-16 14:58:59.476', 'cmqgrpamp00064y3imfd8eomv', 'cmqgrpamc00014y3ixx2wlaxr');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgrpamv000a4y3ijk6qnily', 'Onion (Big)', 'onion-big-2c77', 'Large well-cured red onions for bulk kitchens.', '/products/onion.jpg', 'kg', 25, 25, 2000, 'Lasalgaon, Maharashtra', true, '2026-06-16 14:58:59.48', '2026-06-16 14:58:59.48', 'cmqgrpamp00064y3imfd8eomv', 'cmqgrpamf00024y3ifsmqd76g');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgrpamy000c4y3icjkoe3m2', 'Potato', 'potato-giu9', 'Grade-A potatoes, uniform size.', '/products/potato.jpg', 'kg', 22, 25, 2500, 'Agra, Uttar Pradesh', true, '2026-06-16 14:58:59.482', '2026-06-16 14:58:59.482', 'cmqgrpamp00064y3imfd8eomv', 'cmqgrpamh00034y3inkjicz5e');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgrpan0000e4y3iehopmgvb', 'Tomato', 'tomato-lqwl', 'Farm-fresh tomatoes, graded daily.', '/products/tomato.jpg', 'kg', 44, 20, 1200, 'Madanapalle, Andhra Pradesh', true, '2026-06-16 14:58:59.484', '2026-06-16 14:58:59.484', 'cmqgrpamp00064y3imfd8eomv', 'cmqgrpamc00014y3ixx2wlaxr');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgrpan2000g4y3ita6ky4q6', 'Green Chilli', 'green-chilli-kq76', 'Spicy fresh green chillies.', '/products/chilli.jpg', 'kg', 60, 10, 400, 'Guntur, Andhra Pradesh', true, '2026-06-16 14:58:59.486', '2026-06-16 14:58:59.486', 'cmqgrpamp00064y3imfd8eomv', 'cmqgrpamf00024y3ifsmqd76g');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgrpan3000i4y3ick8shqj6', 'Chilli Bajji (Bhajji)', 'chilli-bajji-bhajji-06t1', 'Mild large bajji chillies for frying.', '/products/chilli.jpg', 'kg', 55, 10, 300, 'Guntur, Andhra Pradesh', true, '2026-06-16 14:58:59.488', '2026-06-16 14:58:59.488', 'cmqgrpamp00064y3imfd8eomv', 'cmqgrpamh00034y3inkjicz5e');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgrpan6000k4y3i4jkrilw1', 'Ginger', 'ginger-fcvl', 'Fresh aromatic ginger, mature rhizomes.', 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=70', 'kg', 135, 10, 300, 'Wayanad, Kerala', true, '2026-06-16 14:58:59.49', '2026-06-16 14:58:59.49', 'cmqgrpamp00064y3imfd8eomv', 'cmqgrpamc00014y3ixx2wlaxr');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgrpan7000m4y3i2evlqyj4', 'Garlic', 'garlic-67ps', 'Plump white garlic bulbs, well cured.', 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&w=800&q=70', 'kg', 180, 10, 250, 'Madhya Pradesh', true, '2026-06-16 14:58:59.492', '2026-06-16 14:58:59.492', 'cmqgrpamp00064y3imfd8eomv', 'cmqgrpamf00024y3ifsmqd76g');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgrpana000o4y3i07bnakcp', 'Cabbage', 'cabbage-xwqx', 'Firm clean green cabbage heads.', '/products/cabbage.jpg', 'kg', 28, 20, 900, 'Ooty, Tamil Nadu', true, '2026-06-16 14:58:59.495', '2026-06-16 14:58:59.495', 'cmqgrpamp00064y3imfd8eomv', 'cmqgrpamh00034y3inkjicz5e');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgrpanc000q4y3ijq3cg5j9', 'Cauliflower', 'cauliflower-d9e3', 'Snow-white cauliflower, sold per piece.', 'https://images.unsplash.com/photo-1568584711271-6c929fb49b60?auto=format&fit=crop&w=800&q=70', 'pc', 30, 10, 600, 'Karnal, Haryana', true, '2026-06-16 14:58:59.497', '2026-06-16 14:58:59.497', 'cmqgrpamp00064y3imfd8eomv', 'cmqgrpamc00014y3ixx2wlaxr');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgrpane000s4y3i8hvn3tk2', 'Bottle Gourd', 'bottle-gourd-3chu', 'Tender bottle gourd, ideal length.', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=70', 'kg', 28, 20, 500, 'Kolar, Karnataka', true, '2026-06-16 14:58:59.499', '2026-06-16 14:58:59.499', 'cmqgrpamp00064y3imfd8eomv', 'cmqgrpamf00024y3ifsmqd76g');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgrpang000u4y3isd3f75h8', 'Ladies Finger (Okra)', 'ladies-finger-okra-k8k8', 'Tender green okra, hand-picked daily.', 'https://images.unsplash.com/photo-1664289397922-3f9c3d9b9b6e?auto=format&fit=crop&w=800&q=70', 'kg', 38, 10, 350, 'Anand, Gujarat', true, '2026-06-16 14:58:59.5', '2026-06-16 14:58:59.5', 'cmqgrpamp00064y3imfd8eomv', 'cmqgrpamh00034y3inkjicz5e');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgrpani000w4y3iy56hsahc', 'Donda (Tindora)', 'donda-tindora-57nn', 'Fresh ivy gourd / tindora.', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=70', 'kg', 40, 10, 300, 'Kolar, Karnataka', true, '2026-06-16 14:58:59.502', '2026-06-16 14:58:59.502', 'cmqgrpamp00064y3imfd8eomv', 'cmqgrpamc00014y3ixx2wlaxr');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgrpank000y4y3i1sxtx7te', 'Ridge Gourd', 'ridge-gourd-wscq', 'Tender ridge gourd (beerakaya).', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=70', 'kg', 48, 10, 300, 'Kolar, Karnataka', true, '2026-06-16 14:58:59.504', '2026-06-16 14:58:59.504', 'cmqgrpamp00064y3imfd8eomv', 'cmqgrpamf00024y3ifsmqd76g');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgrpanm00104y3igyq8hj77', 'Carrot', 'carrot-fsht', 'Sweet red carrots, washed and graded.', 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=800&q=70', 'kg', 48, 10, 600, 'Ooty, Tamil Nadu', true, '2026-06-16 14:58:59.506', '2026-06-16 14:58:59.506', 'cmqgrpamp00064y3imfd8eomv', 'cmqgrpamh00034y3inkjicz5e');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgrpano00124y3i8zzd6s4p', 'Capsicum', 'capsicum-50dq', 'Crisp green bell peppers, hand-picked.', 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=800&q=70', 'kg', 55, 10, 400, 'Pune, Maharashtra', true, '2026-06-16 14:58:59.508', '2026-06-16 14:58:59.508', 'cmqgrpamp00064y3imfd8eomv', 'cmqgrpamc00014y3ixx2wlaxr');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgrpanq00144y3innapgbk0', 'Brinjal (Black)', 'brinjal-black-jsy3', 'Glossy black round brinjal.', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=70', 'kg', 30, 10, 400, 'Kolar, Karnataka', true, '2026-06-16 14:58:59.51', '2026-06-16 14:58:59.51', 'cmqgrpamp00064y3imfd8eomv', 'cmqgrpamf00024y3ifsmqd76g');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgrpanu00164y3ifwf08avc', 'Brinjal (Green / White)', 'brinjal-green-white-oh01', 'Tender green & white brinjal.', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=70', 'kg', 40, 10, 350, 'Kolar, Karnataka', true, '2026-06-16 14:58:59.514', '2026-06-16 14:58:59.514', 'cmqgrpamp00064y3imfd8eomv', 'cmqgrpamh00034y3inkjicz5e');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgrpanv00184y3ikj9g4elf', 'Brinjal (Purple Long)', 'brinjal-purple-long-30c7', 'Long purple brinjal, low seeds.', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=70', 'kg', 40, 10, 350, 'Kolar, Karnataka', true, '2026-06-16 14:58:59.516', '2026-06-16 14:58:59.516', 'cmqgrpamp00064y3imfd8eomv', 'cmqgrpamc00014y3ixx2wlaxr');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgrpanx001a4y3ibir7za9k', 'Dosakai (Yellow Cucumber)', 'dosakai-yellow-cucumber-6p9p', 'Tangy yellow cucumber for curries & dal.', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=70', 'kg', 35, 10, 300, 'Andhra Pradesh', true, '2026-06-16 14:58:59.518', '2026-06-16 14:58:59.518', 'cmqgrpamp00064y3imfd8eomv', 'cmqgrpamf00024y3ifsmqd76g');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgrpanz001c4y3izlm971d4', 'Keera (Cucumber)', 'keera-cucumber-055u', 'Crunchy salad cucumbers, even sized.', 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&w=800&q=70', 'kg', 30, 20, 600, 'Bengaluru Rural, Karnataka', true, '2026-06-16 14:58:59.52', '2026-06-16 14:58:59.52', 'cmqgrpamp00064y3imfd8eomv', 'cmqgrpamh00034y3inkjicz5e');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgrpao1001e4y3i4l1pnvoo', 'Beans (French)', 'beans-french-jjlr', 'Stringless French beans, crisp & fresh.', 'https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?auto=format&fit=crop&w=800&q=70', 'kg', 90, 10, 300, 'Kodaikanal, Tamil Nadu', true, '2026-06-16 14:58:59.521', '2026-06-16 14:58:59.521', 'cmqgrpamp00064y3imfd8eomv', 'cmqgrpamc00014y3ixx2wlaxr');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgrpao3001g4y3img9rjgqm', 'Broad Beans (Chikkudu)', 'broad-beans-chikkudu-8508', 'Flat broad beans (chikkudukaya).', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=70', 'kg', 90, 10, 250, 'Chittoor, Andhra Pradesh', true, '2026-06-16 14:58:59.523', '2026-06-16 14:58:59.523', 'cmqgrpamp00064y3imfd8eomv', 'cmqgrpamf00024y3ifsmqd76g');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgrpao5001i4y3ip22w19xl', 'Cluster Beans (Gokar)', 'cluster-beans-gokar-dgct', 'Fresh cluster beans (goru chikkudu).', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=70', 'kg', 48, 10, 250, 'Kolar, Karnataka', true, '2026-06-16 14:58:59.525', '2026-06-16 14:58:59.525', 'cmqgrpamp00064y3imfd8eomv', 'cmqgrpamh00034y3inkjicz5e');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgrpao7001k4y3inyg58cw8', 'Bitter Gourd', 'bitter-gourd-ycq5', 'Fresh bitter gourd (kakarakaya).', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=70', 'kg', 45, 10, 250, 'Kolar, Karnataka', true, '2026-06-16 14:58:59.527', '2026-06-16 14:58:59.527', 'cmqgrpamp00064y3imfd8eomv', 'cmqgrpamc00014y3ixx2wlaxr');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgrpaoa001m4y3iz9dlzard', 'Raw Banana', 'raw-banana-dkb6', 'Green cooking bananas, sold per piece.', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=70', 'pc', 9, 12, 800, 'Theni, Tamil Nadu', true, '2026-06-16 14:58:59.53', '2026-06-16 14:58:59.53', 'cmqgrpamp00064y3imfd8eomv', 'cmqgrpamf00024y3ifsmqd76g');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgrpaoc001o4y3iw519tnej', 'Raw Mango', 'raw-mango-2udy', 'Tangy raw mangoes for pickles & curries.', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=70', 'kg', 50, 10, 300, 'Krishnagiri, Tamil Nadu', true, '2026-06-16 14:58:59.533', '2026-06-16 14:58:59.533', 'cmqgrpamp00064y3imfd8eomv', 'cmqgrpamh00034y3inkjicz5e');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgrpaoe001q4y3ipercofa1', 'Lemon', 'lemon-e2a3', 'Juicy fresh lemons.', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=70', 'kg', 150, 10, 200, 'Vijayawada, Andhra Pradesh', true, '2026-06-16 14:58:59.534', '2026-06-16 14:58:59.534', 'cmqgrpamp00064y3imfd8eomv', 'cmqgrpamc00014y3ixx2wlaxr');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgrpaog001s4y3ivufdq2et', 'Beetroot', 'beetroot-4n8v', 'Deep-red beetroot, sold per piece.', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=70', 'pc', 35, 10, 400, 'Ooty, Tamil Nadu', true, '2026-06-16 14:58:59.536', '2026-06-16 14:58:59.536', 'cmqgrpamp00064y3imfd8eomv', 'cmqgrpamf00024y3ifsmqd76g');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgrpaoi001u4y3ijr87etjf', 'Drumstick', 'drumstick-3k83', 'Tender drumsticks (munaga).', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=70', 'kg', 60, 10, 250, 'Theni, Tamil Nadu', true, '2026-06-16 14:58:59.538', '2026-06-16 14:58:59.538', 'cmqgrpamp00064y3imfd8eomv', 'cmqgrpamh00034y3inkjicz5e');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgrpaok001w4y3ihsj8ae5p', 'Radish', 'radish-u4b1', 'Crisp white radish (mullangi).', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=70', 'kg', 50, 10, 300, 'Pune, Maharashtra', true, '2026-06-16 14:58:59.54', '2026-06-16 14:58:59.54', 'cmqgrpamp00064y3imfd8eomv', 'cmqgrpamc00014y3ixx2wlaxr');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgrpaoo001z4y3ipb3m4y2i', 'Curry Leaves', 'curry-leaves-9mve', 'Aromatic fresh curry leaves.', 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=70', 'kg', 60, 5, 120, 'Tamil Nadu', true, '2026-06-16 14:58:59.544', '2026-06-16 14:58:59.544', 'cmqgrpaom001x4y3inuuvw3b6', 'cmqgrpamc00014y3ixx2wlaxr');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgrpaop00214y3ifc5tlkpq', 'Kothimeer (Coriander)', 'kothimeer-coriander-ghph', 'Aromatic coriander, cleaned bunches.', 'https://images.unsplash.com/photo-1535189487909-a262ad10c165?auto=format&fit=crop&w=800&q=70', 'kg', 90, 5, 150, 'Pune, Maharashtra', true, '2026-06-16 14:58:59.546', '2026-06-16 14:58:59.546', 'cmqgrpaom001x4y3inuuvw3b6', 'cmqgrpamf00024y3ifsmqd76g');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgrpaor00234y3inha746m8', 'Pudina (Mint)', 'pudina-mint-jtin', 'Fresh mint leaves.', 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=70', 'kg', 50, 5, 120, 'Pune, Maharashtra', true, '2026-06-16 14:58:59.548', '2026-06-16 14:58:59.548', 'cmqgrpaom001x4y3inuuvw3b6', 'cmqgrpamh00034y3inkjicz5e');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgrpaou00254y3i1m9qc8yc', 'Palak (Spinach)', 'palak-spinach-wzo5', 'Fresh tender spinach, harvested daily.', 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=70', 'kg', 60, 5, 200, 'Pune, Maharashtra', true, '2026-06-16 14:58:59.551', '2026-06-16 14:58:59.551', 'cmqgrpaom001x4y3inuuvw3b6', 'cmqgrpamc00014y3ixx2wlaxr');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgrpaow00274y3idm5ahvma', 'Gongura', 'gongura-7kpn', 'Tangy sorrel leaves (gongura).', 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=70', 'kg', 50, 5, 150, 'Telangana', true, '2026-06-16 14:58:59.553', '2026-06-16 14:58:59.553', 'cmqgrpaom001x4y3inuuvw3b6', 'cmqgrpamf00024y3ifsmqd76g');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgrpaoy00294y3iu4kmjl4x', 'Thotakura (Amaranth)', 'thotakura-amaranth-57a3', 'Fresh amaranth greens.', 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=70', 'kg', 50, 5, 150, 'Andhra Pradesh', true, '2026-06-16 14:58:59.554', '2026-06-16 14:58:59.554', 'cmqgrpaom001x4y3inuuvw3b6', 'cmqgrpamh00034y3inkjicz5e');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgrpap0002b4y3i6n4xev8i', 'Methi (Fenugreek)', 'methi-fenugreek-z0sr', 'Fresh methi leaves, cleaned.', 'https://images.unsplash.com/photo-1515872474884-c6d09b4f1d2f?auto=format&fit=crop&w=800&q=70', 'kg', 80, 5, 140, 'Nashik, Maharashtra', true, '2026-06-16 14:58:59.556', '2026-06-16 14:58:59.556', 'cmqgrpaom001x4y3inuuvw3b6', 'cmqgrpamc00014y3ixx2wlaxr');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqgrpap2002d4y3idnfhmwos', 'Spring Onion', 'spring-onion-vvgd', 'Crisp spring onions with greens.', 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=70', 'kg', 60, 5, 160, 'Pune, Maharashtra', true, '2026-06-16 14:58:59.558', '2026-06-16 14:58:59.558', 'cmqgrpaom001x4y3inuuvw3b6', 'cmqgrpamf00024y3ifsmqd76g');
