-- FreshKart — one-shot Supabase setup: schema + seed data.
-- Paste this whole file into Supabase → SQL Editor → Run. Safe to re-run.

-- 1) clean slate (drops only this app's objects)
DROP TABLE IF EXISTS "OrderItem","Order","CartItem","Product","Category","User" CASCADE;
DROP TYPE IF EXISTS "OrderStatus","Role";

-- 2) schema
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


-- 3) seed data (categories, users, 24 products incl. uploaded images)
INSERT INTO public."Category" (id, name, slug, image) VALUES ('cmqf9yutd000632ndztb7v9m8', 'Vegetables', 'vegetables', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=70');
INSERT INTO public."Category" (id, name, slug, image) VALUES ('cmqf9yuuc001332ndfw9io51g', 'Fruits', 'fruits', 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=70');
INSERT INTO public."Category" (id, name, slug, image) VALUES ('cmqf9yuum001e32nd9m49sq8x', 'Leafy Greens', 'leafy-greens', 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=70');
INSERT INTO public."User" (id, email, password, name, role, "businessName", phone, gstin, address, city, pincode, "createdAt", "updatedAt") VALUES ('cmqf9yusu000032ndh7w27fwv', 'admin@b2bmandi.com', '$2a$10$e6ppu9eHR9iRqTYSx2eOVeBIGNewTFHL1PCqkT9rmF1OB1H/2VoMK', 'Mandi Admin', 'ADMIN', 'B2B Mandi', NULL, NULL, NULL, 'Bengaluru', NULL, '2026-06-15 13:54:46.255', '2026-06-15 13:54:46.255');
INSERT INTO public."User" (id, email, password, name, role, "businessName", phone, gstin, address, city, pincode, "createdAt", "updatedAt") VALUES ('cmqf9yusy000132nd4ul62qhi', 'ramesh@greenfarms.com', '$2a$10$e6ppu9eHR9iRqTYSx2eOVeBIGNewTFHL1PCqkT9rmF1OB1H/2VoMK', 'Ramesh Patil', 'SELLER', 'Green Farms Co-op', '9890011223', '27ABCDE1234F1Z5', 'Green Farms Co-op, Market Yard', 'Nashik', '400001', '2026-06-15 13:54:46.259', '2026-06-15 13:54:46.259');
INSERT INTO public."User" (id, email, password, name, role, "businessName", phone, gstin, address, city, pincode, "createdAt", "updatedAt") VALUES ('cmqf9yut4000232ndv9g46x2c', 'lakshmi@freshfields.com', '$2a$10$e6ppu9eHR9iRqTYSx2eOVeBIGNewTFHL1PCqkT9rmF1OB1H/2VoMK', 'Lakshmi Rao', 'SELLER', 'Fresh Fields Trading', '9845567788', '29PQRST5678U2Z1', 'Fresh Fields Trading, Market Yard', 'Bengaluru', '400001', '2026-06-15 13:54:46.264', '2026-06-15 13:54:46.264');
INSERT INTO public."User" (id, email, password, name, role, "businessName", phone, gstin, address, city, pincode, "createdAt", "updatedAt") VALUES ('cmqf9yut6000332nd5ej7lu9t', 'harpreet@punjabgrains.com', '$2a$10$e6ppu9eHR9iRqTYSx2eOVeBIGNewTFHL1PCqkT9rmF1OB1H/2VoMK', 'Harpreet Singh', 'SELLER', 'Punjab Grains & Mills', '9876012345', '03LMNOP9012Q3Z7', 'Punjab Grains & Mills, Market Yard', 'Abohar', '400001', '2026-06-15 13:54:46.267', '2026-06-15 13:54:46.267');
INSERT INTO public."User" (id, email, password, name, role, "businessName", phone, gstin, address, city, pincode, "createdAt", "updatedAt") VALUES ('cmqf9yut8000432ndwneub40a', 'buyer@kirana.com', '$2a$10$e6ppu9eHR9iRqTYSx2eOVeBIGNewTFHL1PCqkT9rmF1OB1H/2VoMK', 'Suresh Kumar', 'BUYER', 'Suresh Kirana Store', '9812345678', '29BUYER1234A1Z9', '12, Gandhi Bazaar, Basavanagudi', 'Bengaluru', '560004', '2026-06-15 13:54:46.269', '2026-06-15 13:54:46.269');
INSERT INTO public."User" (id, email, password, name, role, "businessName", phone, gstin, address, city, pincode, "createdAt", "updatedAt") VALUES ('cmqf9yuta000532ndo27d59rz', 'chef@hotelblue.com', '$2a$10$e6ppu9eHR9iRqTYSx2eOVeBIGNewTFHL1PCqkT9rmF1OB1H/2VoMK', 'Anita Desai', 'BUYER', 'Hotel Blue Orchid', '9823456789', NULL, '5, FC Road', 'Pune', '411004', '2026-06-15 13:54:46.271', '2026-06-15 13:54:46.271');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqf9yutf000832nd6e1104vn', 'Fresh Tomatoes (Hybrid)', 'fresh-tomatoes-hybrid-l3bo', 'Farm-fresh hybrid tomatoes, graded and crated for retail. Each crate ~25kg.', '/products/tomato.jpg', 'crate', 480, 5, 320, 'Nashik, Maharashtra', true, '2026-06-15 13:54:46.275', '2026-06-15 13:54:46.275', 'cmqf9yutd000632ndztb7v9m8', 'cmqf9yusy000132nd4ul62qhi');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqf9yuth000a32ndn1iaafkw', 'Red Onions', 'red-onions-f5ri', 'Premium Nashik red onions. 50kg jute bag, well cured for long storage.', '/products/onion.jpg', 'bag', 920, 10, 540, 'Lasalgaon, Maharashtra', true, '2026-06-15 13:54:46.278', '2026-06-15 13:54:46.278', 'cmqf9yutd000632ndztb7v9m8', 'cmqf9yut4000232ndv9g46x2c');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqf9yutk000c32nd5nirw7vv', 'Potatoes (Jyoti)', 'potatoes-jyoti-n7hf', 'Grade-A Jyoti potatoes, uniform size. 50kg bag, ideal for restaurants & kirana.', '/products/potato.jpg', 'bag', 760, 10, 610, 'Agra, Uttar Pradesh', true, '2026-06-15 13:54:46.28', '2026-06-15 13:54:46.28', 'cmqf9yutd000632ndztb7v9m8', 'cmqf9yut6000332nd5ej7lu9t');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqf9yutm000e32ndkd4t84l8', 'Green Capsicum', 'green-capsicum-wqgm', 'Crisp green bell peppers, hand-picked. ~10kg crate.', 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=800&q=70', 'crate', 640, 3, 180, 'Pune, Maharashtra', true, '2026-06-15 13:54:46.282', '2026-06-15 13:54:46.282', 'cmqf9yutd000632ndztb7v9m8', 'cmqf9yusy000132nd4ul62qhi');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqf9yuto000g32ndfmdlz4jd', 'Cauliflower', 'cauliflower-rhyr', 'Snow-white cauliflower heads, tightly packed. ~15kg crate.', 'https://images.unsplash.com/photo-1568584711271-6c929fb49b60?auto=format&fit=crop&w=800&q=70', 'crate', 420, 4, 150, 'Karnal, Haryana', true, '2026-06-15 13:54:46.284', '2026-06-15 13:54:46.284', 'cmqf9yutd000632ndztb7v9m8', 'cmqf9yut4000232ndv9g46x2c');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqf9yutq000i32ndzvuqdvpf', 'Carrots (Ooty)', 'carrots-ooty-xorz', 'Sweet red Ooty carrots, washed and graded. ~20kg crate.', 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=800&q=70', 'crate', 580, 4, 210, 'Ooty, Tamil Nadu', true, '2026-06-15 13:54:46.286', '2026-06-15 13:54:46.286', 'cmqf9yutd000632ndztb7v9m8', 'cmqf9yut6000332nd5ej7lu9t');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqf9yutt000k32nd1i9cynf5', 'Brinjal (Bharta)', 'brinjal-bharta-87o5', 'Glossy purple brinjal, big bharta variety. ~12kg crate.', 'https://images.unsplash.com/photo-1605196560547-b2f7281b7355?auto=format&fit=crop&w=800&q=70', 'crate', 360, 4, 170, 'Kolar, Karnataka', true, '2026-06-15 13:54:46.289', '2026-06-15 13:54:46.289', 'cmqf9yutd000632ndztb7v9m8', 'cmqf9yusy000132nd4ul62qhi');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqf9yutv000m32ndpv0il9pf', 'Lady Finger (Okra)', 'lady-finger-okra-695e', 'Tender green okra, hand-picked daily. ~8kg crate.', 'https://images.unsplash.com/photo-1664289397922-3f9c3d9b9b6e?auto=format&fit=crop&w=800&q=70', 'crate', 520, 3, 140, 'Anand, Gujarat', true, '2026-06-15 13:54:46.291', '2026-06-15 13:54:46.291', 'cmqf9yutd000632ndztb7v9m8', 'cmqf9yut4000232ndv9g46x2c');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqf9yutx000o32ndh2ucozgu', 'Green Peas', 'green-peas-xqr7', 'Sweet shelled green peas, cold-chain handled. ~10kg crate.', 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?auto=format&fit=crop&w=800&q=70', 'crate', 880, 3, 130, 'Pune, Maharashtra', true, '2026-06-15 13:54:46.293', '2026-06-15 13:54:46.293', 'cmqf9yutd000632ndztb7v9m8', 'cmqf9yut6000332nd5ej7lu9t');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqf9yuty000q32ndz0ntryvl', 'Cucumber', 'cucumber-a8i0', 'Crunchy salad cucumbers, even sized. ~15kg crate.', 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&w=800&q=70', 'crate', 340, 4, 200, 'Bengaluru Rural, Karnataka', true, '2026-06-15 13:54:46.295', '2026-06-15 13:54:46.295', 'cmqf9yutd000632ndztb7v9m8', 'cmqf9yusy000132nd4ul62qhi');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqf9yuu0000s32ndaj90iq82', 'Cabbage', 'cabbage-c083', 'Firm green cabbage heads. ~20kg crate.', '/products/cabbage.jpg', 'crate', 300, 5, 240, 'Ooty, Tamil Nadu', true, '2026-06-15 13:54:46.297', '2026-06-15 13:54:46.297', 'cmqf9yutd000632ndztb7v9m8', 'cmqf9yut4000232ndv9g46x2c');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqf9yuu2000u32nda8whgf68', 'Green Beans', 'green-beans-x63a', 'Stringless French beans, crisp and fresh. ~8kg crate.', 'https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?auto=format&fit=crop&w=800&q=70', 'crate', 620, 3, 120, 'Kodaikanal, Tamil Nadu', true, '2026-06-15 13:54:46.298', '2026-06-15 13:54:46.298', 'cmqf9yutd000632ndztb7v9m8', 'cmqf9yut6000332nd5ej7lu9t');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqf9yuu4000w32ndk1doojam', 'Garlic', 'garlic-b39r', 'Plump white garlic bulbs, well cured. 10kg mesh bag.', 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&w=800&q=70', 'bag', 2400, 2, 90, 'Madhya Pradesh', true, '2026-06-15 13:54:46.3', '2026-06-15 13:54:46.3', 'cmqf9yutd000632ndztb7v9m8', 'cmqf9yusy000132nd4ul62qhi');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqf9yuu6000y32nd5slenegp', 'Ginger', 'ginger-nb0z', 'Fresh aromatic ginger, mature rhizomes. 10kg bag.', 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=70', 'bag', 1800, 2, 110, 'Wayanad, Kerala', true, '2026-06-15 13:54:46.302', '2026-06-15 13:54:46.302', 'cmqf9yutd000632ndztb7v9m8', 'cmqf9yut4000232ndv9g46x2c');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqf9yuu8001032ndhifux3de', 'Bottle Gourd (Lauki)', 'bottle-gourd-lauki-zec8', 'Tender bottle gourd, ideal length. ~15kg crate.', 'https://images.unsplash.com/photo-1659261200833-ec8761558af7?auto=format&fit=crop&w=800&q=70', 'crate', 280, 4, 160, 'Pune, Maharashtra', true, '2026-06-15 13:54:46.304', '2026-06-15 13:54:46.304', 'cmqf9yutd000632ndztb7v9m8', 'cmqf9yut6000332nd5ej7lu9t');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqf9yuua001232nd0oyea5ru', 'Red Chilli (Guntur)', 'red-chilli-guntur-0995', 'Spicy fresh red chillies, graded. ~6kg crate.', '/products/chilli.jpg', 'crate', 740, 2, 100, 'Guntur, Andhra Pradesh', true, '2026-06-15 13:54:46.307', '2026-06-15 13:54:46.307', 'cmqf9yutd000632ndztb7v9m8', 'cmqf9yusy000132nd4ul62qhi');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqf9yuue001532nd9igq85ya', 'Bananas (Robusta)', 'bananas-robusta-11kv', 'Premium Robusta bananas, even ripening. ~20kg crate.', 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=70', 'crate', 540, 5, 280, 'Theni, Tamil Nadu', true, '2026-06-15 13:54:46.31', '2026-06-15 13:54:46.31', 'cmqf9yuuc001332ndfw9io51g', 'cmqf9yusy000132nd4ul62qhi');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqf9yuuf001732nd79qydtq8', 'Alphonso Mangoes', 'alphonso-mangoes-yx8f', 'GI-tagged Ratnagiri Alphonso. Box of ~4 dozen, naturally ripened.', 'https://images.unsplash.com/photo-1605027990121-cbae9e0642df?auto=format&fit=crop&w=800&q=70', 'crate', 2400, 2, 90, 'Ratnagiri, Maharashtra', true, '2026-06-15 13:54:46.312', '2026-06-15 13:54:46.312', 'cmqf9yuuc001332ndfw9io51g', 'cmqf9yut4000232ndv9g46x2c');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqf9yuuh001932ndx6tl8ava', 'Pomegranate (Bhagwa)', 'pomegranate-bhagwa-evv9', 'Deep-red Bhagwa pomegranates, high arils. ~10kg crate.', 'https://images.unsplash.com/photo-1541344999736-83eca272f6fc?auto=format&fit=crop&w=800&q=70', 'crate', 1850, 2, 120, 'Solapur, Maharashtra', true, '2026-06-15 13:54:46.313', '2026-06-15 13:54:46.313', 'cmqf9yuuc001332ndfw9io51g', 'cmqf9yut6000332nd5ej7lu9t');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqf9yuuj001b32ndw7agme38', 'Kinnow Oranges', 'kinnow-oranges-cog9', 'Juicy Kinnow mandarins. 20kg mesh bag.', 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&w=800&q=70', 'bag', 1100, 4, 160, 'Abohar, Punjab', true, '2026-06-15 13:54:46.315', '2026-06-15 13:54:46.315', 'cmqf9yuuc001332ndfw9io51g', 'cmqf9yusy000132nd4ul62qhi');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqf9yuul001d32nd4untcouh', 'Green Grapes (Thompson)', 'green-grapes-thompson-6p9n', 'Seedless Thompson grapes, export grade. ~8kg crate.', 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=800&q=70', 'crate', 980, 3, 140, 'Nashik, Maharashtra', true, '2026-06-15 13:54:46.317', '2026-06-15 13:54:46.317', 'cmqf9yuuc001332ndfw9io51g', 'cmqf9yut4000232ndv9g46x2c');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqf9yuuo001g32ndwnbcqxz0', 'Palak (Spinach)', 'palak-spinach-n2ob', 'Fresh tender spinach bunches. ~8kg crate, harvested daily.', 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=70', 'crate', 260, 4, 110, 'Pune, Maharashtra', true, '2026-06-15 13:54:46.32', '2026-06-15 13:54:46.32', 'cmqf9yuum001e32nd9m49sq8x', 'cmqf9yusy000132nd4ul62qhi');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqf9yuuq001i32ndsxp4nv7h', 'Coriander (Dhania)', 'coriander-dhania-qbvj', 'Aromatic coriander bunches. ~6kg crate.', 'https://images.unsplash.com/photo-1535189487909-a262ad10c165?auto=format&fit=crop&w=800&q=70', 'crate', 320, 4, 95, 'Pune, Maharashtra', true, '2026-06-15 13:54:46.323', '2026-06-15 13:54:46.323', 'cmqf9yuum001e32nd9m49sq8x', 'cmqf9yut4000232ndv9g46x2c');
INSERT INTO public."Product" (id, name, slug, description, image, unit, "pricePerUnit", "minOrderQty", "stockQty", origin, "isActive", "createdAt", "updatedAt", "categoryId", "sellerId") VALUES ('cmqf9yuut001k32nd0vuw1xw7', 'Methi (Fenugreek)', 'methi-fenugreek-rtpr', 'Fresh methi leaves, cleaned bunches. ~6kg crate.', 'https://images.unsplash.com/photo-1515872474884-c6d09b4f1d2f?auto=format&fit=crop&w=800&q=70', 'crate', 300, 4, 80, 'Nashik, Maharashtra', true, '2026-06-15 13:54:46.325', '2026-06-15 13:54:46.325', 'cmqf9yuum001e32nd9m49sq8x', 'cmqf9yut6000332nd5ej7lu9t');
