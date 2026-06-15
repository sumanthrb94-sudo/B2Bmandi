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
    { name: "Fresh Tomatoes (Hybrid)", unit: "crate", price: 480, minQty: 5, stock: 320, origin: "Nashik, Maharashtra", image: "/products/tomato.jpg", desc: "Farm-fresh hybrid tomatoes, graded and crated for retail. Each crate ~25kg." },
    { name: "Red Onions", unit: "bag", price: 920, minQty: 10, stock: 540, origin: "Lasalgaon, Maharashtra", image: "/products/onion.jpg", desc: "Premium Nashik red onions. 50kg jute bag, well cured for long storage." },
    { name: "Potatoes (Jyoti)", unit: "bag", price: 760, minQty: 10, stock: 610, origin: "Agra, Uttar Pradesh", image: "/products/potato.jpg", desc: "Grade-A Jyoti potatoes, uniform size. 50kg bag, ideal for restaurants & kirana." },
    { name: "Green Capsicum", unit: "crate", price: 640, minQty: 3, stock: 180, origin: "Pune, Maharashtra", image: IMG("photo-1563565375-f3fdfdbefa83"), desc: "Crisp green bell peppers, hand-picked. ~10kg crate." },
    { name: "Cauliflower", unit: "crate", price: 420, minQty: 4, stock: 150, origin: "Karnal, Haryana", image: IMG("photo-1568584711271-6c929fb49b60"), desc: "Snow-white cauliflower heads, tightly packed. ~15kg crate." },
    { name: "Carrots (Ooty)", unit: "crate", price: 580, minQty: 4, stock: 210, origin: "Ooty, Tamil Nadu", image: IMG("photo-1598170845058-32b9d6a5da37"), desc: "Sweet red Ooty carrots, washed and graded. ~20kg crate." },
    { name: "Brinjal (Bharta)", unit: "crate", price: 360, minQty: 4, stock: 170, origin: "Kolar, Karnataka", image: IMG("photo-1605196560547-b2f7281b7355"), desc: "Glossy purple brinjal, big bharta variety. ~12kg crate." },
    { name: "Lady Finger (Okra)", unit: "crate", price: 520, minQty: 3, stock: 140, origin: "Anand, Gujarat", image: IMG("photo-1664289397922-3f9c3d9b9b6e"), desc: "Tender green okra, hand-picked daily. ~8kg crate." },
    { name: "Green Peas", unit: "crate", price: 880, minQty: 3, stock: 130, origin: "Pune, Maharashtra", image: IMG("photo-1587735243615-c03f25aaff15"), desc: "Sweet shelled green peas, cold-chain handled. ~10kg crate." },
    { name: "Cucumber", unit: "crate", price: 340, minQty: 4, stock: 200, origin: "Bengaluru Rural, Karnataka", image: IMG("photo-1604977042946-1eecc30f269e"), desc: "Crunchy salad cucumbers, even sized. ~15kg crate." },
    { name: "Cabbage", unit: "crate", price: 300, minQty: 5, stock: 240, origin: "Ooty, Tamil Nadu", image: "/products/cabbage.jpg", desc: "Firm green cabbage heads. ~20kg crate." },
    { name: "Green Beans", unit: "crate", price: 620, minQty: 3, stock: 120, origin: "Kodaikanal, Tamil Nadu", image: IMG("photo-1567375698348-5d9d5ae99de0"), desc: "Stringless French beans, crisp and fresh. ~8kg crate." },
    { name: "Garlic", unit: "bag", price: 2400, minQty: 2, stock: 90, origin: "Madhya Pradesh", image: IMG("photo-1540148426945-6cf22a6b2383"), desc: "Plump white garlic bulbs, well cured. 10kg mesh bag." },
    { name: "Ginger", unit: "bag", price: 1800, minQty: 2, stock: 110, origin: "Wayanad, Kerala", image: IMG("photo-1615485290382-441e4d049cb5"), desc: "Fresh aromatic ginger, mature rhizomes. 10kg bag." },
    { name: "Bottle Gourd (Lauki)", unit: "crate", price: 280, minQty: 4, stock: 160, origin: "Pune, Maharashtra", image: IMG("photo-1659261200833-ec8761558af7"), desc: "Tender bottle gourd, ideal length. ~15kg crate." },
    { name: "Red Chilli (Guntur)", unit: "crate", price: 740, minQty: 2, stock: 100, origin: "Guntur, Andhra Pradesh", image: "/products/chilli.jpg", desc: "Spicy fresh red chillies, graded. ~6kg crate." },
  ],
  fruits: [
    { name: "Bananas (Robusta)", unit: "crate", price: 540, minQty: 5, stock: 280, origin: "Theni, Tamil Nadu", image: IMG("photo-1571771894821-ce9b6c11b08e"), desc: "Premium Robusta bananas, even ripening. ~20kg crate." },
    { name: "Alphonso Mangoes", unit: "crate", price: 2400, minQty: 2, stock: 90, origin: "Ratnagiri, Maharashtra", image: IMG("photo-1605027990121-cbae9e0642df"), desc: "GI-tagged Ratnagiri Alphonso. Box of ~4 dozen, naturally ripened." },
    { name: "Pomegranate (Bhagwa)", unit: "crate", price: 1850, minQty: 2, stock: 120, origin: "Solapur, Maharashtra", image: IMG("photo-1541344999736-83eca272f6fc"), desc: "Deep-red Bhagwa pomegranates, high arils. ~10kg crate." },
    { name: "Kinnow Oranges", unit: "bag", price: 1100, minQty: 4, stock: 160, origin: "Abohar, Punjab", image: IMG("photo-1582979512210-99b6a53386f9"), desc: "Juicy Kinnow mandarins. 20kg mesh bag." },
    { name: "Green Grapes (Thompson)", unit: "crate", price: 980, minQty: 3, stock: 140, origin: "Nashik, Maharashtra", image: IMG("photo-1537640538966-79f369143f8f"), desc: "Seedless Thompson grapes, export grade. ~8kg crate." },
  ],
  "leafy-greens": [
    { name: "Palak (Spinach)", unit: "crate", price: 260, minQty: 4, stock: 110, origin: "Pune, Maharashtra", image: IMG("photo-1576045057995-568f588f82fb"), desc: "Fresh tender spinach bunches. ~8kg crate, harvested daily." },
    { name: "Coriander (Dhania)", unit: "crate", price: 320, minQty: 4, stock: 95, origin: "Pune, Maharashtra", image: IMG("photo-1535189487909-a262ad10c165"), desc: "Aromatic coriander bunches. ~6kg crate." },
    { name: "Methi (Fenugreek)", unit: "crate", price: 300, minQty: 4, stock: 80, origin: "Nashik, Maharashtra", image: IMG("photo-1515872474884-c6d09b4f1d2f"), desc: "Fresh methi leaves, cleaned bunches. ~6kg crate." },
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
