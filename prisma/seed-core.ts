import type { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const IMG = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=70`;

// Generic fall-back imagery for items we don't yet have a dedicated photo for.
const VEG = IMG("photo-1540420773420-3366772f4999");
const LEAFY = IMG("photo-1576045057995-568f588f82fb");

const CATEGORIES = [
  { name: "Vegetables", slug: "vegetables", image: VEG },
  { name: "Leafy Greens", slug: "leafy-greens", image: LEAFY },
];

// Client B2B price chart (₹ per unit). Units are kg except where noted "pc".
const PRODUCTS: Record<
  string,
  {
    name: string;
    unit: string;
    price: number;
    minQty: number;
    stock: number;
    origin: string;
    image: string;
    desc: string;
  }[]
> = {
  vegetables: [
    { name: "Onion (New Red)", unit: "kg", price: 24, minQty: 25, stock: 2000, origin: "Kurnool, Andhra Pradesh", image: "/products/onion-new-red.jpg", desc: "Fresh new-crop red onions. Sold loose by the kg." },
    { name: "Onion (Big)", unit: "kg", price: 25, minQty: 25, stock: 2000, origin: "Lasalgaon, Maharashtra", image: "/products/onion-big.jpg", desc: "Large well-cured red onions for bulk kitchens." },
    { name: "Potato", unit: "kg", price: 22, minQty: 25, stock: 2500, origin: "Agra, Uttar Pradesh", image: "/products/potato.jpg", desc: "Grade-A potatoes, uniform size." },
    { name: "Tomato", unit: "kg", price: 44, minQty: 20, stock: 1200, origin: "Madanapalle, Andhra Pradesh", image: "/products/tomato.jpg", desc: "Farm-fresh tomatoes, graded daily." },
    { name: "Green Chilli", unit: "kg", price: 60, minQty: 10, stock: 400, origin: "Guntur, Andhra Pradesh", image: "/products/green-chilli.jpg", desc: "Spicy fresh green chillies." },
    { name: "Chilli Bajji (Bhajji)", unit: "kg", price: 55, minQty: 10, stock: 300, origin: "Guntur, Andhra Pradesh", image: "/products/chilli-bajji.jpg", desc: "Mild large bajji chillies for frying." },
    { name: "Ginger", unit: "kg", price: 135, minQty: 10, stock: 300, origin: "Wayanad, Kerala", image: "/products/ginger.jpg", desc: "Fresh aromatic ginger, mature rhizomes." },
    { name: "Garlic", unit: "kg", price: 180, minQty: 10, stock: 250, origin: "Madhya Pradesh", image: "/products/garlic.jpg", desc: "Plump white garlic bulbs, well cured." },
    { name: "Cabbage", unit: "kg", price: 28, minQty: 20, stock: 900, origin: "Ooty, Tamil Nadu", image: "/products/cabbage.jpg", desc: "Firm clean green cabbage heads." },
    { name: "Cauliflower", unit: "pc", price: 30, minQty: 10, stock: 600, origin: "Karnal, Haryana", image: "/products/cauliflower.jpg", desc: "Snow-white cauliflower, sold per piece." },
    { name: "Bottle Gourd", unit: "kg", price: 28, minQty: 20, stock: 500, origin: "Kolar, Karnataka", image: "/products/bottle-gourd.jpg", desc: "Tender bottle gourd, ideal length." },
    { name: "Ladies Finger (Okra)", unit: "kg", price: 38, minQty: 10, stock: 350, origin: "Anand, Gujarat", image: "/products/ladies-finger.jpg", desc: "Tender green okra, hand-picked daily." },
    { name: "Donda (Tindora)", unit: "kg", price: 40, minQty: 10, stock: 300, origin: "Kolar, Karnataka", image: "/products/donda.jpg", desc: "Fresh ivy gourd / tindora." },
    { name: "Ridge Gourd", unit: "kg", price: 48, minQty: 10, stock: 300, origin: "Kolar, Karnataka", image: "/products/ridge-gourd.jpg", desc: "Tender ridge gourd (beerakaya)." },
    { name: "Carrot", unit: "kg", price: 48, minQty: 10, stock: 600, origin: "Ooty, Tamil Nadu", image: "/products/carrot.jpg", desc: "Sweet red carrots, washed and graded." },
    { name: "Capsicum", unit: "kg", price: 55, minQty: 10, stock: 400, origin: "Pune, Maharashtra", image: "/products/capsicum.jpg", desc: "Crisp green bell peppers, hand-picked." },
    { name: "Brinjal (Black)", unit: "kg", price: 30, minQty: 10, stock: 400, origin: "Kolar, Karnataka", image: "/products/brinjal-black.jpg", desc: "Glossy black round brinjal." },
    { name: "Brinjal (Green / White)", unit: "kg", price: 40, minQty: 10, stock: 350, origin: "Kolar, Karnataka", image: "/products/brinjal-green-white.jpg", desc: "Tender green & white brinjal." },
    { name: "Brinjal (Purple Long)", unit: "kg", price: 40, minQty: 10, stock: 350, origin: "Kolar, Karnataka", image: "/products/brinjal-purple-long.jpg", desc: "Long purple brinjal, low seeds." },
    { name: "Dosakai (Yellow Cucumber)", unit: "kg", price: 35, minQty: 10, stock: 300, origin: "Andhra Pradesh", image: "/products/dosakai.jpg", desc: "Tangy yellow cucumber for curries & dal." },
    { name: "Keera (Cucumber)", unit: "kg", price: 30, minQty: 20, stock: 600, origin: "Bengaluru Rural, Karnataka", image: "/products/keera.jpg", desc: "Crunchy salad cucumbers, even sized." },
    { name: "Beans (French)", unit: "kg", price: 90, minQty: 10, stock: 300, origin: "Kodaikanal, Tamil Nadu", image: "/products/beans.jpg", desc: "Stringless French beans, crisp & fresh." },
    { name: "Broad Beans (Chikkudu)", unit: "kg", price: 90, minQty: 10, stock: 250, origin: "Chittoor, Andhra Pradesh", image: "/products/broad-beans.jpg", desc: "Flat broad beans (chikkudukaya)." },
    { name: "Cluster Beans (Gokar)", unit: "kg", price: 48, minQty: 10, stock: 250, origin: "Kolar, Karnataka", image: "/products/cluster-beans.jpg", desc: "Fresh cluster beans (goru chikkudu)." },
    { name: "Bitter Gourd", unit: "kg", price: 45, minQty: 10, stock: 250, origin: "Kolar, Karnataka", image: "/products/bitter-gourd.jpg", desc: "Fresh bitter gourd (kakarakaya)." },
    { name: "Raw Banana", unit: "pc", price: 9, minQty: 12, stock: 800, origin: "Theni, Tamil Nadu", image: "/products/raw-banana.jpg", desc: "Green cooking bananas, sold per piece." },
    { name: "Raw Mango", unit: "kg", price: 50, minQty: 10, stock: 300, origin: "Krishnagiri, Tamil Nadu", image: "/products/raw-mango.jpg", desc: "Tangy raw mangoes for pickles & curries." },
    { name: "Lemon", unit: "kg", price: 150, minQty: 10, stock: 200, origin: "Vijayawada, Andhra Pradesh", image: "/products/lemon.jpg", desc: "Juicy fresh lemons." },
    { name: "Beetroot", unit: "pc", price: 35, minQty: 10, stock: 400, origin: "Ooty, Tamil Nadu", image: "/products/beetroot.jpg", desc: "Deep-red beetroot, sold per piece." },
    { name: "Drumstick", unit: "kg", price: 60, minQty: 10, stock: 250, origin: "Theni, Tamil Nadu", image: "/products/drumstick.jpg", desc: "Tender drumsticks (munaga)." },
    { name: "Radish", unit: "kg", price: 50, minQty: 10, stock: 300, origin: "Pune, Maharashtra", image: "/products/radish.jpg", desc: "Crisp white radish (mullangi)." },
  ],
  "leafy-greens": [
    { name: "Curry Leaves", unit: "kg", price: 60, minQty: 5, stock: 120, origin: "Tamil Nadu", image: "/products/curry-leaves.jpg", desc: "Aromatic fresh curry leaves." },
    { name: "Kothimeer (Coriander)", unit: "kg", price: 90, minQty: 5, stock: 150, origin: "Pune, Maharashtra", image: "/products/kothimeer.jpg", desc: "Aromatic coriander, cleaned bunches." },
    { name: "Pudina (Mint)", unit: "kg", price: 50, minQty: 5, stock: 120, origin: "Pune, Maharashtra", image: "/products/pudina.jpg", desc: "Fresh mint leaves." },
    { name: "Palak (Spinach)", unit: "kg", price: 60, minQty: 5, stock: 200, origin: "Pune, Maharashtra", image: "/products/palak.jpg", desc: "Fresh tender spinach, harvested daily." },
    { name: "Gongura", unit: "kg", price: 50, minQty: 5, stock: 150, origin: "Telangana", image: "/products/gongura.jpg", desc: "Tangy sorrel leaves (gongura)." },
    { name: "Thotakura (Amaranth)", unit: "kg", price: 50, minQty: 5, stock: 150, origin: "Andhra Pradesh", image: "/products/thotakura.jpg", desc: "Fresh amaranth greens." },
    { name: "Methi (Fenugreek)", unit: "kg", price: 80, minQty: 5, stock: 140, origin: "Nashik, Maharashtra", image: "/products/methi.jpg", desc: "Fresh methi leaves, cleaned." },
    { name: "Spring Onion", unit: "kg", price: 60, minQty: 5, stock: 160, origin: "Pune, Maharashtra", image: "/products/spring-onion.jpg", desc: "Crisp spring onions with greens." },
  ],
};

/** Idempotent: wipes and re-seeds the database. Returns a summary. */
export async function seedDatabase(prisma: PrismaClient) {
  // wipe (FK-safe order)
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash("password123", 12);

  await prisma.user.create({
    data: { email: "admin@freshkart.in", password, name: "FreshKart Admin", role: "ADMIN", businessName: "FreshKart", city: "Bengaluru" },
  });

  const sellersData = [
    { email: "ramesh@greenfarms.com", name: "Ramesh Patil", businessName: "Green Farms Co-op", city: "Nashik", phone: "9890011223", gstin: "27ABCDE1234F1Z5" },
    { email: "lakshmi@freshfields.com", name: "Lakshmi Rao", businessName: "Fresh Fields Trading", city: "Bengaluru", phone: "9845567788", gstin: "29PQRST5678U2Z1" },
    { email: "harpreet@punjabgrains.com", name: "Harpreet Singh", businessName: "Punjab Grains & Mills", city: "Abohar", phone: "9876012345", gstin: "03LMNOP9012Q3Z7" },
  ];
  const sellers = [];
  for (const s of sellersData) {
    sellers.push(
      await prisma.user.create({
        data: { ...s, password, role: "SELLER", address: `${s.businessName}, Market Yard`, pincode: "400001" },
      }),
    );
  }

  await prisma.user.create({
    data: { email: "customer@freshkart.in", password, name: "FreshKart Customer", role: "BUYER", businessName: "Suresh Kirana Store", businessType: "Kirana store", city: "Bengaluru", phone: "9812345678", address: "12, Gandhi Bazaar, Basavanagudi", pincode: "560004", gstin: "29BUYER1234A1Z9" },
  });
  await prisma.user.create({
    data: { email: "chef@hotelblue.com", password, name: "Anita Desai", role: "BUYER", businessName: "Hotel Blue Orchid", businessType: "Hotel", city: "Pune", phone: "9823456789", address: "5, FC Road", pincode: "411004" },
  });

  let productCount = 0;
  for (const cat of CATEGORIES) {
    const category = await prisma.category.create({ data: cat });
    const items = PRODUCTS[cat.slug] ?? [];
    for (let i = 0; i < items.length; i++) {
      const p = items[i];
      const seller = sellers[i % sellers.length];
      await prisma.product.create({
        data: {
          name: p.name,
          slug: slugify(p.name) + "-" + Math.random().toString(36).slice(2, 6),
          description: p.desc,
          image: p.image,
          unit: p.unit,
          pricePerUnit: p.price,
          minOrderQty: p.minQty,
          stockQty: p.stock,
          origin: p.origin,
          categoryId: category.id,
          sellerId: seller.id,
        },
      });
      productCount++;
    }
  }

  return {
    categories: CATEGORIES.length,
    sellers: sellers.length,
    buyers: 2,
    products: productCount,
  };
}
