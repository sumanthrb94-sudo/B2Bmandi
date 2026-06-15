-- FreshKart — one-shot Supabase setup: schema + seed data (prices per kg).
-- Paste this whole file into Supabase → SQL Editor → Run. Safe to re-run.
-- NOTE: re-running DROPS existing tables (wipes current orders) and reloads fresh data.

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


-- seed data (categories, users incl. admin, 24 products priced per kg)
INSERT INTO public."Category" (id, name, slug, image) VALUES ('cmqfe34sa0006jt5pcqaob0i9', 'Vegetables', 'vegetables', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=70');
INSERT INTO public."Category" (id, name, slug, image) VALUES ('cmqfe34t80013jt5p71v8dnrl', 'Fruits', 'fruits', 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=70');
INSERT INTO public."Category" (id, name, slug, image) VALUES ('cmqfe34tj001ejt5pr2u9s2ld', 'Leafy Greens', 'leafy-greens', 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=70');
INSERT INTO public."User" (id, email, password, name, role, "businessName", phone, gstin, address, city, pincode, "createdAt", "updatedAt") VALUES ('cmqfe34ry0000jt5ppobxl8tj', 'admin@b2bmandi.com', '$2a$10$xVUSMhj3wQdq2Zi8h6Uq3eWNgeCOaRg8Ye7o9RXrL2/FVoVQe0mky', 'Mandi Admin', 'ADMIN', 'B2B Mandi', NULL, NULL, NULL, 'Bengaluru', NULL, '2026-06-15 15:50:04.27', '2026-06-15 15:50:04.27');
INSERT INTO public."User" (id, email, password, name, role, "businessName", phone, gstin, address, city, pincode, "createdAt", "updatedAt") VALUES ('cmqfe34s10001jt5pvs8df1uc', 'ramesh@greenfarms.com', '$2a$10$xVUSMhj3wQdq2Zi8h6Uq3eWNgeCOaRg8Ye7o9RXrL2/FVoVQe0mky', 'Ramesh Patil', 'SELLER', 'Green Farms Co-op', '9890011223', '27ABCDE1234F1Z5', 'Green Farms Co-op, Market Yard', 'Nashik', '400001', '2026-06-15 15:50:04.273', '2026-06-15 15:50:04.273');
INSERT INTO public."User" (id, email, password, name, role, "businessName", phone, gstin, address, city, pincode, "createdAt", "updatedAt") VALUES ('cmqfe34s30002jt5p5ve2fze2', 'lakshmi@freshfields.com', '$2a$10$xVUSMhj3wQdq2Zi8h6Uq3eWNgeCOaRg8Ye7o9RXrL2/FVoVQe0mky', 'Lakshmi Rao', 'SELLER', 'Fresh Fields Trading', '9845567788', '29PQRST5678U2Z1', 'Fresh Fields Trading, Market Yard', 'Bengaluru', '400001', '2026-06-15 15:50:04.276', '2026-06-15 15:50:04.276');
INSERT INTO public."User" (id, email, password, name, role, "businessName", phone, gstin, address, city, pincode, "createdAt", "updatedAt") VALUES ('cmqfe34s50003jt5pd3zxjr47', 'harpreet@punjabgrains.com', '$2a$10$xVUSMhj3wQdq2Zi8h6Uq3eWNgeCOaRg8Ye7o9RXrL2/FVoVQe0mky', 'Harpreet Singh', 'SELLER', 'Punjab Grains & Mills', '9876012345', '03LMNOP9012Q3Z7', 'Punjab Grains & Mills, Market Yard', 'Abohar', '400001', '2026-06-15 15:50:04.278', '2026-06-15 15:50:04.278');
INSERT INTO public."User" (id, email, password, name, role, "businessName", phone, gstin, address, city, pincode, "createdAt", "updatedAt") VALUES ('cmqfe34s70004jt5pbug4m1n2', 'buyer@kirana.com', '$2a$10$xVUSMhj3wQdq2Zi8h6Uq3eWNgeCOaRg8Ye7o9RXrL2/FVoVQe0mky', 'Suresh Kumar', 'BUYER', 'Suresh Kirana Store', '9812345678', '29BUYER1234A1Z9', '12, Gandhi Bazaar, Basavanagudi', 'Bengaluru', '560004', '2026-06-15 15:50:04.279', '2026-06-15 15:50:04.279');
INSERT INTO public."User" (id, email, password, name, role, "businessName", phone, gstin, address, city, pincode, "createdAt", "updatedAt") VALUES ('cmqfe34s80005jt5pk9epw66u', 'chef@hotelblue.com', '$2a$10$xVUSMhj3wQdq2Zi8h6Uq3eWNgeCOaRg8Ye7o9RXrL2/FVoVQe0mky', 'Anita Desai', 'BUYER', 'Hotel Blue Orchid', '9823456789', NULL, '5, FC Road', 'Pune', '411004', '2026-06-15 15:50:04.281', '2026-06-15 15:50:04.281');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqfe34sc0008jt5phqeegezc', 'Fresh Tomatoes (Hybrid)', 'fresh-tomatoes-hybrid-8oob', 'Farm-fresh hybrid tomatoes, graded daily. Sold loose by the kg.', '/products/tomato.jpg', 'kg', 24, 20, 800, 'Nashik, Maharashtra', true, '2026-06-15 15:50:04.285', '2026-06-15 15:50:04.285', 'cmqfe34sa0006jt5pcqaob0i9', 'cmqfe34s10001jt5pvs8df1uc');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqfe34sf000ajt5puqspyl00', 'Red Onions', 'red-onions-f9ee', 'Premium Nashik red onions, well cured for long storage.', '/products/onion.jpg', 'kg', 22, 50, 1500, 'Lasalgaon, Maharashtra', true, '2026-06-15 15:50:04.287', '2026-06-15 15:50:04.287', 'cmqfe34sa0006jt5pcqaob0i9', 'cmqfe34s30002jt5p5ve2fze2');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqfe34sh000cjt5pxmwrkxac', 'Potatoes (Jyoti)', 'potatoes-jyoti-k5yp', 'Grade-A Jyoti potatoes, uniform size — ideal for kitchens & kirana.', '/products/potato.jpg', 'kg', 18, 50, 2000, 'Agra, Uttar Pradesh', true, '2026-06-15 15:50:04.289', '2026-06-15 15:50:04.289', 'cmqfe34sa0006jt5pcqaob0i9', 'cmqfe34s50003jt5pd3zxjr47');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqfe34sj000ejt5pkatmoc3l', 'Green Capsicum', 'green-capsicum-jg6n', 'Crisp green bell peppers, hand-picked.', 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=800&q=70', 'kg', 45, 10, 400, 'Pune, Maharashtra', true, '2026-06-15 15:50:04.291', '2026-06-15 15:50:04.291', 'cmqfe34sa0006jt5pcqaob0i9', 'cmqfe34s10001jt5pvs8df1uc');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqfe34sm000gjt5pxq0844qt', 'Cauliflower', 'cauliflower-16rk', 'Snow-white cauliflower heads, tightly packed.', 'https://images.unsplash.com/photo-1568584711271-6c929fb49b60?auto=format&fit=crop&w=800&q=70', 'kg', 28, 20, 600, 'Karnal, Haryana', true, '2026-06-15 15:50:04.294', '2026-06-15 15:50:04.294', 'cmqfe34sa0006jt5pcqaob0i9', 'cmqfe34s30002jt5p5ve2fze2');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqfe34so000ijt5pgagumyzf', 'Carrots (Ooty)', 'carrots-ooty-cqaq', 'Sweet red Ooty carrots, washed and graded.', 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=800&q=70', 'kg', 32, 20, 700, 'Ooty, Tamil Nadu', true, '2026-06-15 15:50:04.296', '2026-06-15 15:50:04.296', 'cmqfe34sa0006jt5pcqaob0i9', 'cmqfe34s50003jt5pd3zxjr47');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqfe34sq000kjt5pc5c0sgef', 'Brinjal (Bharta)', 'brinjal-bharta-1vge', 'Glossy purple brinjal, big bharta variety.', 'https://images.unsplash.com/photo-1605196560547-b2f7281b7355?auto=format&fit=crop&w=800&q=70', 'kg', 30, 20, 500, 'Kolar, Karnataka', true, '2026-06-15 15:50:04.298', '2026-06-15 15:50:04.298', 'cmqfe34sa0006jt5pcqaob0i9', 'cmqfe34s10001jt5pvs8df1uc');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqfe34sr000mjt5pj8ckxjf5', 'Lady Finger (Okra)', 'lady-finger-okra-o9vc', 'Tender green okra, hand-picked daily.', 'https://images.unsplash.com/photo-1664289397922-3f9c3d9b9b6e?auto=format&fit=crop&w=800&q=70', 'kg', 48, 10, 350, 'Anand, Gujarat', true, '2026-06-15 15:50:04.3', '2026-06-15 15:50:04.3', 'cmqfe34sa0006jt5pcqaob0i9', 'cmqfe34s30002jt5p5ve2fze2');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqfe34st000ojt5pebrhmkd7', 'Green Peas', 'green-peas-qx5i', 'Sweet shelled green peas, cold-chain handled.', 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?auto=format&fit=crop&w=800&q=70', 'kg', 60, 10, 300, 'Pune, Maharashtra', true, '2026-06-15 15:50:04.302', '2026-06-15 15:50:04.302', 'cmqfe34sa0006jt5pcqaob0i9', 'cmqfe34s50003jt5pd3zxjr47');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqfe34sv000qjt5px9u3akd9', 'Cucumber', 'cucumber-psw2', 'Crunchy salad cucumbers, even sized.', 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&w=800&q=70', 'kg', 24, 20, 600, 'Bengaluru Rural, Karnataka', true, '2026-06-15 15:50:04.303', '2026-06-15 15:50:04.303', 'cmqfe34sa0006jt5pcqaob0i9', 'cmqfe34s10001jt5pvs8df1uc');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqfe34sx000sjt5p34krp8oa', 'Cabbage', 'cabbage-kmat', 'Firm green cabbage heads.', '/products/cabbage.jpg', 'kg', 18, 30, 900, 'Ooty, Tamil Nadu', true, '2026-06-15 15:50:04.305', '2026-06-15 15:50:04.305', 'cmqfe34sa0006jt5pcqaob0i9', 'cmqfe34s30002jt5p5ve2fze2');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqfe34sy000ujt5pmmkkf49s', 'Green Beans', 'green-beans-a46j', 'Stringless French beans, crisp and fresh.', 'https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?auto=format&fit=crop&w=800&q=70', 'kg', 52, 10, 320, 'Kodaikanal, Tamil Nadu', true, '2026-06-15 15:50:04.307', '2026-06-15 15:50:04.307', 'cmqfe34sa0006jt5pcqaob0i9', 'cmqfe34s50003jt5pd3zxjr47');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqfe34t0000wjt5pauaw85ds', 'Garlic', 'garlic-zxpz', 'Plump white garlic bulbs, well cured.', 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&w=800&q=70', 'kg', 120, 10, 250, 'Madhya Pradesh', true, '2026-06-15 15:50:04.308', '2026-06-15 15:50:04.308', 'cmqfe34sa0006jt5pcqaob0i9', 'cmqfe34s10001jt5pvs8df1uc');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqfe34t3000yjt5pzrr7bvi4', 'Ginger', 'ginger-gkm2', 'Fresh aromatic ginger, mature rhizomes.', 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=70', 'kg', 85, 10, 280, 'Wayanad, Kerala', true, '2026-06-15 15:50:04.311', '2026-06-15 15:50:04.311', 'cmqfe34sa0006jt5pcqaob0i9', 'cmqfe34s30002jt5p5ve2fze2');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqfe34t40010jt5p8xpdvqnl', 'Bottle Gourd (Lauki)', 'bottle-gourd-lauki-o204', 'Tender bottle gourd, ideal length.', 'https://images.unsplash.com/photo-1659261200833-ec8761558af7?auto=format&fit=crop&w=800&q=70', 'kg', 20, 30, 500, 'Pune, Maharashtra', true, '2026-06-15 15:50:04.313', '2026-06-15 15:50:04.313', 'cmqfe34sa0006jt5pcqaob0i9', 'cmqfe34s50003jt5pd3zxjr47');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqfe34t60012jt5pmsj614qd', 'Red Chilli (Guntur)', 'red-chilli-guntur-s0fi', 'Spicy fresh red chillies, graded.', '/products/chilli.jpg', 'kg', 90, 10, 220, 'Guntur, Andhra Pradesh', true, '2026-06-15 15:50:04.314', '2026-06-15 15:50:04.314', 'cmqfe34sa0006jt5pcqaob0i9', 'cmqfe34s10001jt5pvs8df1uc');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqfe34t90015jt5pzrkfw2wo', 'Bananas (Robusta)', 'bananas-robusta-doa6', 'Premium Robusta bananas, even ripening.', 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=70', 'kg', 30, 20, 700, 'Theni, Tamil Nadu', true, '2026-06-15 15:50:04.317', '2026-06-15 15:50:04.317', 'cmqfe34t80013jt5p71v8dnrl', 'cmqfe34s10001jt5pvs8df1uc');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqfe34tb0017jt5p3ggwjckm', 'Alphonso Mangoes', 'alphonso-mangoes-0zci', 'GI-tagged Ratnagiri Alphonso, naturally ripened.', 'https://images.unsplash.com/photo-1605027990121-cbae9e0642df?auto=format&fit=crop&w=800&q=70', 'kg', 160, 10, 300, 'Ratnagiri, Maharashtra', true, '2026-06-15 15:50:04.319', '2026-06-15 15:50:04.319', 'cmqfe34t80013jt5p71v8dnrl', 'cmqfe34s30002jt5p5ve2fze2');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqfe34td0019jt5pfq1yka7p', 'Pomegranate (Bhagwa)', 'pomegranate-bhagwa-kq35', 'Deep-red Bhagwa pomegranates, high arils.', 'https://images.unsplash.com/photo-1541344999736-83eca272f6fc?auto=format&fit=crop&w=800&q=70', 'kg', 110, 10, 350, 'Solapur, Maharashtra', true, '2026-06-15 15:50:04.321', '2026-06-15 15:50:04.321', 'cmqfe34t80013jt5p71v8dnrl', 'cmqfe34s50003jt5pd3zxjr47');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqfe34te001bjt5pzoy8pd4k', 'Kinnow Oranges', 'kinnow-oranges-ebox', 'Juicy Kinnow mandarins.', 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&w=800&q=70', 'kg', 45, 20, 500, 'Abohar, Punjab', true, '2026-06-15 15:50:04.323', '2026-06-15 15:50:04.323', 'cmqfe34t80013jt5p71v8dnrl', 'cmqfe34s10001jt5pvs8df1uc');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqfe34tg001djt5pkuzxisqp', 'Green Grapes (Thompson)', 'green-grapes-thompson-2dbf', 'Seedless Thompson grapes, export grade.', 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=800&q=70', 'kg', 70, 10, 300, 'Nashik, Maharashtra', true, '2026-06-15 15:50:04.324', '2026-06-15 15:50:04.324', 'cmqfe34t80013jt5p71v8dnrl', 'cmqfe34s30002jt5p5ve2fze2');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqfe34tk001gjt5ptqcpjlbk', 'Palak (Spinach)', 'palak-spinach-tjtp', 'Fresh tender spinach, harvested daily.', 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=70', 'kg', 25, 10, 200, 'Pune, Maharashtra', true, '2026-06-15 15:50:04.329', '2026-06-15 15:50:04.329', 'cmqfe34tj001ejt5pr2u9s2ld', 'cmqfe34s10001jt5pvs8df1uc');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqfe34tm001ijt5p5wmjliw8', 'Coriander (Dhania)', 'coriander-dhania-2xts', 'Aromatic coriander, cleaned bunches.', 'https://images.unsplash.com/photo-1535189487909-a262ad10c165?auto=format&fit=crop&w=800&q=70', 'kg', 40, 10, 180, 'Pune, Maharashtra', true, '2026-06-15 15:50:04.33', '2026-06-15 15:50:04.33', 'cmqfe34tj001ejt5pr2u9s2ld', 'cmqfe34s30002jt5p5ve2fze2');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqfe34to001kjt5pcdxrxtok', 'Methi (Fenugreek)', 'methi-fenugreek-y12g', 'Fresh methi leaves, cleaned.', 'https://images.unsplash.com/photo-1515872474884-c6d09b4f1d2f?auto=format&fit=crop&w=800&q=70', 'kg', 35, 10, 160, 'Nashik, Maharashtra', true, '2026-06-15 15:50:04.333', '2026-06-15 15:50:04.333', 'cmqfe34tj001ejt5pr2u9s2ld', 'cmqfe34s50003jt5pd3zxjr47');
