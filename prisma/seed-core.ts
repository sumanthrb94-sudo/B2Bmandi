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

const CATEGORIES = [
  { name: "Vegetables", slug: "vegetables", image: IMG("photo-1540420773420-3366772f4999") },
  { name: "Fruits", slug: "fruits", image: IMG("photo-1619566636858-adf3ef46400b") },
  { name: "Leafy Greens", slug: "leafy-greens", image: IMG("photo-1576045057995-568f588f82fb") },
];

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
    { name: "Fresh Tomatoes (Hybrid)", unit: "kg", price: 40, minQty: 20, stock: 800, origin: "Nashik, Maharashtra", image: "/products/tomato.jpg", desc: "Farm-fresh hybrid tomatoes, graded daily. Sold loose by the kg." },
    { name: "Red Onions", unit: "kg", price: 45, minQty: 50, stock: 1500, origin: "Lasalgaon, Maharashtra", image: "/products/onion.jpg", desc: "Premium Nashik red onions, well cured for long storage." },
    { name: "Potatoes (Jyoti)", unit: "kg", price: 35, minQty: 50, stock: 2000, origin: "Agra, Uttar Pradesh", image: "/products/potato.jpg", desc: "Grade-A Jyoti potatoes, uniform size — ideal for kitchens & kirana." },
    { name: "Green Capsicum", unit: "kg", price: 80, minQty: 10, stock: 400, origin: "Pune, Maharashtra", image: IMG("photo-1563565375-f3fdfdbefa83"), desc: "Crisp green bell peppers, hand-picked." },
    { name: "Cauliflower", unit: "kg", price: 50, minQty: 20, stock: 600, origin: "Karnal, Haryana", image: IMG("photo-1568584711271-6c929fb49b60"), desc: "Snow-white cauliflower heads, tightly packed." },
    { name: "Carrots (Ooty)", unit: "kg", price: 60, minQty: 20, stock: 700, origin: "Ooty, Tamil Nadu", image: IMG("photo-1598170845058-32b9d6a5da37"), desc: "Sweet red Ooty carrots, washed and graded." },
    { name: "Brinjal (Bharta)", unit: "kg", price: 50, minQty: 20, stock: 500, origin: "Kolar, Karnataka", image: IMG("photo-1605196560547-b2f7281b7355"), desc: "Glossy purple brinjal, big bharta variety." },
    { name: "Lady Finger (Okra)", unit: "kg", price: 60, minQty: 10, stock: 350, origin: "Anand, Gujarat", image: IMG("photo-1664289397922-3f9c3d9b9b6e"), desc: "Tender green okra, hand-picked daily." },
    { name: "Green Peas", unit: "kg", price: 100, minQty: 10, stock: 300, origin: "Pune, Maharashtra", image: IMG("photo-1587735243615-c03f25aaff15"), desc: "Sweet shelled green peas, cold-chain handled." },
    { name: "Cucumber", unit: "kg", price: 45, minQty: 20, stock: 600, origin: "Bengaluru Rural, Karnataka", image: IMG("photo-1604977042946-1eecc30f269e"), desc: "Crunchy salad cucumbers, even sized." },
    { name: "Cabbage", unit: "kg", price: 40, minQty: 30, stock: 900, origin: "Ooty, Tamil Nadu", image: "/products/cabbage.jpg", desc: "Firm green cabbage heads." },
    { name: "Green Beans", unit: "kg", price: 80, minQty: 10, stock: 320, origin: "Kodaikanal, Tamil Nadu", image: IMG("photo-1567375698348-5d9d5ae99de0"), desc: "Stringless French beans, crisp and fresh." },
    { name: "Garlic", unit: "kg", price: 220, minQty: 10, stock: 250, origin: "Madhya Pradesh", image: IMG("photo-1540148426945-6cf22a6b2383"), desc: "Plump white garlic bulbs, well cured." },
    { name: "Ginger", unit: "kg", price: 120, minQty: 10, stock: 280, origin: "Wayanad, Kerala", image: IMG("photo-1615485290382-441e4d049cb5"), desc: "Fresh aromatic ginger, mature rhizomes." },
    { name: "Bottle Gourd (Lauki)", unit: "kg", price: 40, minQty: 30, stock: 500, origin: "Pune, Maharashtra", image: IMG("photo-1659261200833-ec8761558af7"), desc: "Tender bottle gourd, ideal length." },
    { name: "Red Chilli (Guntur)", unit: "kg", price: 100, minQty: 10, stock: 220, origin: "Guntur, Andhra Pradesh", image: "/products/chilli.jpg", desc: "Spicy fresh red chillies, graded." },
  ],
  fruits: [
    { name: "Bananas (Robusta)", unit: "kg", price: 60, minQty: 20, stock: 700, origin: "Theni, Tamil Nadu", image: IMG("photo-1571771894821-ce9b6c11b08e"), desc: "Premium Robusta bananas, even ripening." },
    { name: "Alphonso Mangoes", unit: "kg", price: 250, minQty: 10, stock: 300, origin: "Ratnagiri, Maharashtra", image: IMG("photo-1605027990121-cbae9e0642df"), desc: "GI-tagged Ratnagiri Alphonso, naturally ripened." },
    { name: "Pomegranate (Bhagwa)", unit: "kg", price: 200, minQty: 10, stock: 350, origin: "Solapur, Maharashtra", image: IMG("photo-1541344999736-83eca272f6fc"), desc: "Deep-red Bhagwa pomegranates, high arils." },
    { name: "Kinnow Oranges", unit: "kg", price: 80, minQty: 20, stock: 500, origin: "Abohar, Punjab", image: IMG("photo-1582979512210-99b6a53386f9"), desc: "Juicy Kinnow mandarins." },
    { name: "Green Grapes (Thompson)", unit: "kg", price: 130, minQty: 10, stock: 300, origin: "Nashik, Maharashtra", image: IMG("photo-1537640538966-79f369143f8f"), desc: "Seedless Thompson grapes, export grade." },
  ],
  "leafy-greens": [
    { name: "Palak (Spinach)", unit: "kg", price: 40, minQty: 10, stock: 200, origin: "Pune, Maharashtra", image: IMG("photo-1576045057995-568f588f82fb"), desc: "Fresh tender spinach, harvested daily." },
    { name: "Coriander (Dhania)", unit: "kg", price: 100, minQty: 10, stock: 180, origin: "Pune, Maharashtra", image: IMG("photo-1535189487909-a262ad10c165"), desc: "Aromatic coriander, cleaned bunches." },
    { name: "Methi (Fenugreek)", unit: "kg", price: 80, minQty: 10, stock: 160, origin: "Nashik, Maharashtra", image: IMG("photo-1515872474884-c6d09b4f1d2f"), desc: "Fresh methi leaves, cleaned." },
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

  const password = await bcrypt.hash("password123", 10);

  await prisma.user.create({
    data: { email: "admin@b2bmandi.com", password, name: "Mandi Admin", role: "ADMIN", businessName: "B2B Mandi", city: "Bengaluru" },
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
    data: { email: "buyer@kirana.com", password, name: "Suresh Kumar", role: "BUYER", businessName: "Suresh Kirana Store", city: "Bengaluru", phone: "9812345678", address: "12, Gandhi Bazaar, Basavanagudi", pincode: "560004", gstin: "29BUYER1234A1Z9" },
  });
  await prisma.user.create({
    data: { email: "chef@hotelblue.com", password, name: "Anita Desai", role: "BUYER", businessName: "Hotel Blue Orchid", city: "Pune", phone: "9823456789", address: "5, FC Road", pincode: "411004" },
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
