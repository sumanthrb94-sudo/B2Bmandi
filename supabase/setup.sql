-- FreshKart — one-shot Supabase setup: schema + seed data (Zepto-style per-kg prices).
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
INSERT INTO public."Category" (id, name, slug, image) VALUES ('cmqfg7w5x0006xhpo9cao8la9', 'Vegetables', 'vegetables', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=70');
INSERT INTO public."Category" (id, name, slug, image) VALUES ('cmqfg7w790013xhpo0af3xajx', 'Fruits', 'fruits', 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=70');
INSERT INTO public."Category" (id, name, slug, image) VALUES ('cmqfg7w7r001exhpo6jftr8ux', 'Leafy Greens', 'leafy-greens', 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=70');
INSERT INTO public."User" (id, email, password, name, role, "businessName", phone, gstin, address, city, pincode, "createdAt", "updatedAt") VALUES ('cmqfg7w590000xhpoobke4ibj', 'admin@b2bmandi.com', '$2a$10$yQEkLnQnMJEP0BXZc.dClOfEQGr6.tNsgCgnEghiKIS6SRqfz9JOG', 'Mandi Admin', 'ADMIN', 'B2B Mandi', NULL, NULL, NULL, 'Bengaluru', NULL, '2026-06-15 16:49:45.597', '2026-06-15 16:49:45.597');
INSERT INTO public."User" (id, email, password, name, role, "businessName", phone, gstin, address, city, pincode, "createdAt", "updatedAt") VALUES ('cmqfg7w5k0001xhpocd79ztmy', 'ramesh@greenfarms.com', '$2a$10$yQEkLnQnMJEP0BXZc.dClOfEQGr6.tNsgCgnEghiKIS6SRqfz9JOG', 'Ramesh Patil', 'SELLER', 'Green Farms Co-op', '9890011223', '27ABCDE1234F1Z5', 'Green Farms Co-op, Market Yard', 'Nashik', '400001', '2026-06-15 16:49:45.609', '2026-06-15 16:49:45.609');
INSERT INTO public."User" (id, email, password, name, role, "businessName", phone, gstin, address, city, pincode, "createdAt", "updatedAt") VALUES ('cmqfg7w5n0002xhpon6qucoeq', 'lakshmi@freshfields.com', '$2a$10$yQEkLnQnMJEP0BXZc.dClOfEQGr6.tNsgCgnEghiKIS6SRqfz9JOG', 'Lakshmi Rao', 'SELLER', 'Fresh Fields Trading', '9845567788', '29PQRST5678U2Z1', 'Fresh Fields Trading, Market Yard', 'Bengaluru', '400001', '2026-06-15 16:49:45.612', '2026-06-15 16:49:45.612');
INSERT INTO public."User" (id, email, password, name, role, "businessName", phone, gstin, address, city, pincode, "createdAt", "updatedAt") VALUES ('cmqfg7w5q0003xhpoak7k958w', 'harpreet@punjabgrains.com', '$2a$10$yQEkLnQnMJEP0BXZc.dClOfEQGr6.tNsgCgnEghiKIS6SRqfz9JOG', 'Harpreet Singh', 'SELLER', 'Punjab Grains & Mills', '9876012345', '03LMNOP9012Q3Z7', 'Punjab Grains & Mills, Market Yard', 'Abohar', '400001', '2026-06-15 16:49:45.615', '2026-06-15 16:49:45.615');
INSERT INTO public."User" (id, email, password, name, role, "businessName", phone, gstin, address, city, pincode, "createdAt", "updatedAt") VALUES ('cmqfg7w5s0004xhpovsyhoiw3', 'buyer@kirana.com', '$2a$10$yQEkLnQnMJEP0BXZc.dClOfEQGr6.tNsgCgnEghiKIS6SRqfz9JOG', 'Suresh Kumar', 'BUYER', 'Suresh Kirana Store', '9812345678', '29BUYER1234A1Z9', '12, Gandhi Bazaar, Basavanagudi', 'Bengaluru', '560004', '2026-06-15 16:49:45.617', '2026-06-15 16:49:45.617');
INSERT INTO public."User" (id, email, password, name, role, "businessName", phone, gstin, address, city, pincode, "createdAt", "updatedAt") VALUES ('cmqfg7w5u0005xhpon1s2iq8j', 'chef@hotelblue.com', '$2a$10$yQEkLnQnMJEP0BXZc.dClOfEQGr6.tNsgCgnEghiKIS6SRqfz9JOG', 'Anita Desai', 'BUYER', 'Hotel Blue Orchid', '9823456789', NULL, '5, FC Road', 'Pune', '411004', '2026-06-15 16:49:45.619', '2026-06-15 16:49:45.619');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqfg7w620008xhpoq02duzml', 'Fresh Tomatoes (Hybrid)', 'fresh-tomatoes-hybrid-796h', 'Farm-fresh hybrid tomatoes, graded daily. Sold loose by the kg.', '/products/tomato.jpg', 'kg', 40, 20, 800, 'Nashik, Maharashtra', true, '2026-06-15 16:49:45.626', '2026-06-15 16:49:45.626', 'cmqfg7w5x0006xhpo9cao8la9', 'cmqfg7w5k0001xhpocd79ztmy');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqfg7w68000axhpoz9ea8hjz', 'Red Onions', 'red-onions-lan9', 'Premium Nashik red onions, well cured for long storage.', '/products/onion.jpg', 'kg', 45, 50, 1500, 'Lasalgaon, Maharashtra', true, '2026-06-15 16:49:45.632', '2026-06-15 16:49:45.632', 'cmqfg7w5x0006xhpo9cao8la9', 'cmqfg7w5n0002xhpon6qucoeq');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqfg7w6b000cxhpo8emn55iq', 'Potatoes (Jyoti)', 'potatoes-jyoti-4f1u', 'Grade-A Jyoti potatoes, uniform size — ideal for kitchens & kirana.', '/products/potato.jpg', 'kg', 35, 50, 2000, 'Agra, Uttar Pradesh', true, '2026-06-15 16:49:45.635', '2026-06-15 16:49:45.635', 'cmqfg7w5x0006xhpo9cao8la9', 'cmqfg7w5q0003xhpoak7k958w');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqfg7w6d000exhpojtv97p2u', 'Green Capsicum', 'green-capsicum-a418', 'Crisp green bell peppers, hand-picked.', 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=800&q=70', 'kg', 80, 10, 400, 'Pune, Maharashtra', true, '2026-06-15 16:49:45.638', '2026-06-15 16:49:45.638', 'cmqfg7w5x0006xhpo9cao8la9', 'cmqfg7w5k0001xhpocd79ztmy');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqfg7w6g000gxhpoiaxqlder', 'Cauliflower', 'cauliflower-9mvz', 'Snow-white cauliflower heads, tightly packed.', 'https://images.unsplash.com/photo-1568584711271-6c929fb49b60?auto=format&fit=crop&w=800&q=70', 'kg', 50, 20, 600, 'Karnal, Haryana', true, '2026-06-15 16:49:45.64', '2026-06-15 16:49:45.64', 'cmqfg7w5x0006xhpo9cao8la9', 'cmqfg7w5n0002xhpon6qucoeq');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqfg7w6i000ixhpoxrufug3s', 'Carrots (Ooty)', 'carrots-ooty-cfmy', 'Sweet red Ooty carrots, washed and graded.', 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=800&q=70', 'kg', 60, 20, 700, 'Ooty, Tamil Nadu', true, '2026-06-15 16:49:45.642', '2026-06-15 16:49:45.642', 'cmqfg7w5x0006xhpo9cao8la9', 'cmqfg7w5q0003xhpoak7k958w');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqfg7w6k000kxhpodcmxxvwd', 'Brinjal (Bharta)', 'brinjal-bharta-fot7', 'Glossy purple brinjal, big bharta variety.', 'https://images.unsplash.com/photo-1605196560547-b2f7281b7355?auto=format&fit=crop&w=800&q=70', 'kg', 50, 20, 500, 'Kolar, Karnataka', true, '2026-06-15 16:49:45.645', '2026-06-15 16:49:45.645', 'cmqfg7w5x0006xhpo9cao8la9', 'cmqfg7w5k0001xhpocd79ztmy');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqfg7w6n000mxhpoqs80rfsu', 'Lady Finger (Okra)', 'lady-finger-okra-1hwu', 'Tender green okra, hand-picked daily.', 'https://images.unsplash.com/photo-1664289397922-3f9c3d9b9b6e?auto=format&fit=crop&w=800&q=70', 'kg', 60, 10, 350, 'Anand, Gujarat', true, '2026-06-15 16:49:45.647', '2026-06-15 16:49:45.647', 'cmqfg7w5x0006xhpo9cao8la9', 'cmqfg7w5n0002xhpon6qucoeq');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqfg7w6p000oxhpojr1eh3qu', 'Green Peas', 'green-peas-o0uk', 'Sweet shelled green peas, cold-chain handled.', 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?auto=format&fit=crop&w=800&q=70', 'kg', 100, 10, 300, 'Pune, Maharashtra', true, '2026-06-15 16:49:45.649', '2026-06-15 16:49:45.649', 'cmqfg7w5x0006xhpo9cao8la9', 'cmqfg7w5q0003xhpoak7k958w');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqfg7w6s000qxhpo05en7w9y', 'Cucumber', 'cucumber-b8n9', 'Crunchy salad cucumbers, even sized.', 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&w=800&q=70', 'kg', 45, 20, 600, 'Bengaluru Rural, Karnataka', true, '2026-06-15 16:49:45.652', '2026-06-15 16:49:45.652', 'cmqfg7w5x0006xhpo9cao8la9', 'cmqfg7w5k0001xhpocd79ztmy');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqfg7w6v000sxhpow9ixkrq8', 'Cabbage', 'cabbage-z2hy', 'Firm green cabbage heads.', '/products/cabbage.jpg', 'kg', 40, 30, 900, 'Ooty, Tamil Nadu', true, '2026-06-15 16:49:45.656', '2026-06-15 16:49:45.656', 'cmqfg7w5x0006xhpo9cao8la9', 'cmqfg7w5n0002xhpon6qucoeq');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqfg7w6y000uxhpotq30b4ri', 'Green Beans', 'green-beans-pipl', 'Stringless French beans, crisp and fresh.', 'https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?auto=format&fit=crop&w=800&q=70', 'kg', 80, 10, 320, 'Kodaikanal, Tamil Nadu', true, '2026-06-15 16:49:45.658', '2026-06-15 16:49:45.658', 'cmqfg7w5x0006xhpo9cao8la9', 'cmqfg7w5q0003xhpoak7k958w');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqfg7w70000wxhpoe43mt3j1', 'Garlic', 'garlic-hgff', 'Plump white garlic bulbs, well cured.', 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&w=800&q=70', 'kg', 220, 10, 250, 'Madhya Pradesh', true, '2026-06-15 16:49:45.66', '2026-06-15 16:49:45.66', 'cmqfg7w5x0006xhpo9cao8la9', 'cmqfg7w5k0001xhpocd79ztmy');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqfg7w72000yxhpoedhxk431', 'Ginger', 'ginger-g9su', 'Fresh aromatic ginger, mature rhizomes.', 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=70', 'kg', 120, 10, 280, 'Wayanad, Kerala', true, '2026-06-15 16:49:45.662', '2026-06-15 16:49:45.662', 'cmqfg7w5x0006xhpo9cao8la9', 'cmqfg7w5n0002xhpon6qucoeq');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqfg7w740010xhpo3ulb8cbl', 'Bottle Gourd (Lauki)', 'bottle-gourd-lauki-6vo3', 'Tender bottle gourd, ideal length.', 'https://images.unsplash.com/photo-1659261200833-ec8761558af7?auto=format&fit=crop&w=800&q=70', 'kg', 40, 30, 500, 'Pune, Maharashtra', true, '2026-06-15 16:49:45.665', '2026-06-15 16:49:45.665', 'cmqfg7w5x0006xhpo9cao8la9', 'cmqfg7w5q0003xhpoak7k958w');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqfg7w770012xhpof8h1lh7c', 'Red Chilli (Guntur)', 'red-chilli-guntur-2z0l', 'Spicy fresh red chillies, graded.', '/products/chilli.jpg', 'kg', 100, 10, 220, 'Guntur, Andhra Pradesh', true, '2026-06-15 16:49:45.667', '2026-06-15 16:49:45.667', 'cmqfg7w5x0006xhpo9cao8la9', 'cmqfg7w5k0001xhpocd79ztmy');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqfg7w7c0015xhpocjkdg8fm', 'Bananas (Robusta)', 'bananas-robusta-urve', 'Premium Robusta bananas, even ripening.', 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=70', 'kg', 60, 20, 700, 'Theni, Tamil Nadu', true, '2026-06-15 16:49:45.672', '2026-06-15 16:49:45.672', 'cmqfg7w790013xhpo0af3xajx', 'cmqfg7w5k0001xhpocd79ztmy');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqfg7w7f0017xhpoca6qtytj', 'Alphonso Mangoes', 'alphonso-mangoes-rwfe', 'GI-tagged Ratnagiri Alphonso, naturally ripened.', 'https://images.unsplash.com/photo-1605027990121-cbae9e0642df?auto=format&fit=crop&w=800&q=70', 'kg', 250, 10, 300, 'Ratnagiri, Maharashtra', true, '2026-06-15 16:49:45.675', '2026-06-15 16:49:45.675', 'cmqfg7w790013xhpo0af3xajx', 'cmqfg7w5n0002xhpon6qucoeq');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqfg7w7i0019xhpo920f616h', 'Pomegranate (Bhagwa)', 'pomegranate-bhagwa-8yir', 'Deep-red Bhagwa pomegranates, high arils.', 'https://images.unsplash.com/photo-1541344999736-83eca272f6fc?auto=format&fit=crop&w=800&q=70', 'kg', 200, 10, 350, 'Solapur, Maharashtra', true, '2026-06-15 16:49:45.679', '2026-06-15 16:49:45.679', 'cmqfg7w790013xhpo0af3xajx', 'cmqfg7w5q0003xhpoak7k958w');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqfg7w7k001bxhporeo0ppmm', 'Kinnow Oranges', 'kinnow-oranges-y69z', 'Juicy Kinnow mandarins.', 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&w=800&q=70', 'kg', 80, 20, 500, 'Abohar, Punjab', true, '2026-06-15 16:49:45.681', '2026-06-15 16:49:45.681', 'cmqfg7w790013xhpo0af3xajx', 'cmqfg7w5k0001xhpocd79ztmy');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqfg7w7n001dxhpoixw5z4gx', 'Green Grapes (Thompson)', 'green-grapes-thompson-333o', 'Seedless Thompson grapes, export grade.', 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=800&q=70', 'kg', 130, 10, 300, 'Nashik, Maharashtra', true, '2026-06-15 16:49:45.684', '2026-06-15 16:49:45.684', 'cmqfg7w790013xhpo0af3xajx', 'cmqfg7w5n0002xhpon6qucoeq');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqfg7w7t001gxhpo9ltuevs5', 'Palak (Spinach)', 'palak-spinach-9z6e', 'Fresh tender spinach, harvested daily.', 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=70', 'kg', 40, 10, 200, 'Pune, Maharashtra', true, '2026-06-15 16:49:45.69', '2026-06-15 16:49:45.69', 'cmqfg7w7r001exhpo6jftr8ux', 'cmqfg7w5k0001xhpocd79ztmy');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqfg7w7w001ixhpoqamgjhax', 'Coriander (Dhania)', 'coriander-dhania-bntp', 'Aromatic coriander, cleaned bunches.', 'https://images.unsplash.com/photo-1535189487909-a262ad10c165?auto=format&fit=crop&w=800&q=70', 'kg', 100, 10, 180, 'Pune, Maharashtra', true, '2026-06-15 16:49:45.693', '2026-06-15 16:49:45.693', 'cmqfg7w7r001exhpo6jftr8ux', 'cmqfg7w5n0002xhpon6qucoeq');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqfg7w7y001kxhpoxnqxy8ld', 'Methi (Fenugreek)', 'methi-fenugreek-vh7g', 'Fresh methi leaves, cleaned.', 'https://images.unsplash.com/photo-1515872474884-c6d09b4f1d2f?auto=format&fit=crop&w=800&q=70', 'kg', 80, 10, 160, 'Nashik, Maharashtra', true, '2026-06-15 16:49:45.695', '2026-06-15 16:49:45.695', 'cmqfg7w7r001exhpo6jftr8ux', 'cmqfg7w5q0003xhpoak7k958w');
