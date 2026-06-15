import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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
  { name: "Staples & Grains", slug: "staples", image: IMG("photo-1586201375761-83865001e31c") },
  { name: "Leafy Greens", slug: "leafy-greens", image: IMG("photo-1576045057995-568f588f82fb") },
  { name: "Dairy", slug: "dairy", image: IMG("photo-1550583724-b2692b85b150") },
];

// products keyed by category slug
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
    { name: "Fresh Tomatoes (Hybrid)", unit: "crate", price: 480, minQty: 5, stock: 320, origin: "Nashik, Maharashtra", image: IMG("photo-1546470427-e26264be0b0d"), desc: "Farm-fresh hybrid tomatoes, graded and crated for retail. Each crate ~25kg." },
    { name: "Red Onions", unit: "bag", price: 920, minQty: 10, stock: 540, origin: "Lasalgaon, Maharashtra", image: IMG("photo-1518977956812-cd3dbadaaf31"), desc: "Premium Nashik red onions. 50kg jute bag, well cured for long storage." },
    { name: "Potatoes (Jyoti)", unit: "bag", price: 760, minQty: 10, stock: 610, origin: "Agra, Uttar Pradesh", image: IMG("photo-1518977676601-b53f82aba655"), desc: "Grade-A Jyoti potatoes, uniform size. 50kg bag, ideal for restaurants & kirana." },
    { name: "Green Capsicum", unit: "crate", price: 640, minQty: 3, stock: 180, origin: "Pune, Maharashtra", image: IMG("photo-1563565375-f3fdfdbefa83"), desc: "Crisp green bell peppers, hand-picked. ~10kg crate." },
    { name: "Cauliflower", unit: "crate", price: 420, minQty: 4, stock: 150, origin: "Karnal, Haryana", image: IMG("photo-1568584711271-6c929fb49b60"), desc: "Snow-white cauliflower heads, tightly packed. ~15kg crate." },
    { name: "Carrots (Ooty)", unit: "crate", price: 580, minQty: 4, stock: 210, origin: "Ooty, Tamil Nadu", image: IMG("photo-1598170845058-32b9d6a5da37"), desc: "Sweet red Ooty carrots, washed and graded. ~20kg crate." },
  ],
  fruits: [
    { name: "Bananas (Robusta)", unit: "crate", price: 540, minQty: 5, stock: 280, origin: "Theni, Tamil Nadu", image: IMG("photo-1571771894821-ce9b6c11b08e"), desc: "Premium Robusta bananas, even ripening. ~20kg crate." },
    { name: "Alphonso Mangoes", unit: "crate", price: 2400, minQty: 2, stock: 90, origin: "Ratnagiri, Maharashtra", image: IMG("photo-1605027990121-cbae9e0642df"), desc: "GI-tagged Ratnagiri Alphonso. Box of ~4 dozen, naturally ripened." },
    { name: "Pomegranate (Bhagwa)", unit: "crate", price: 1850, minQty: 2, stock: 120, origin: "Solapur, Maharashtra", image: IMG("photo-1541344999736-83eca272f6fc"), desc: "Deep-red Bhagwa pomegranates, high arils. ~10kg crate." },
    { name: "Kinnow Oranges", unit: "bag", price: 1100, minQty: 4, stock: 160, origin: "Abohar, Punjab", image: IMG("photo-1582979512210-99b6a53386f9"), desc: "Juicy Kinnow mandarins. 20kg mesh bag." },
    { name: "Green Grapes (Thompson)", unit: "crate", price: 980, minQty: 3, stock: 140, origin: "Nashik, Maharashtra", image: IMG("photo-1537640538966-79f369143f8f"), desc: "Seedless Thompson grapes, export grade. ~8kg crate." },
  ],
  staples: [
    { name: "Sona Masoori Rice", unit: "bag", price: 2650, minQty: 5, stock: 400, origin: "Raichur, Karnataka", image: IMG("photo-1586201375761-83865001e31c"), desc: "Aged Sona Masoori raw rice. 25kg bag, low starch." },
    { name: "Toor Dal (Unpolished)", unit: "bag", price: 3200, minQty: 4, stock: 220, origin: "Gulbarga, Karnataka", image: IMG("photo-1596797038530-2c107229654b"), desc: "Premium unpolished toor dal. 30kg bag." },
    { name: "Whole Wheat (Lokwan)", unit: "bag", price: 1450, minQty: 5, stock: 350, origin: "Indore, Madhya Pradesh", image: IMG("photo-1574323347407-f5e1ad6d020b"), desc: "MP Lokwan wheat, mill-grade. 30kg bag." },
    { name: "Sunflower Oil (Refined)", unit: "crate", price: 2280, minQty: 2, stock: 130, origin: "Gujarat", image: IMG("photo-1474979266404-7eaacbcd87c5"), desc: "Refined sunflower oil, 15L tin x 1 per case. Crate of single tin." },
  ],
  "leafy-greens": [
    { name: "Palak (Spinach)", unit: "crate", price: 260, minQty: 4, stock: 110, origin: "Pune, Maharashtra", image: IMG("photo-1576045057995-568f588f82fb"), desc: "Fresh tender spinach bunches. ~8kg crate, harvested daily." },
    { name: "Coriander (Dhania)", unit: "crate", price: 320, minQty: 4, stock: 95, origin: "Pune, Maharashtra", image: IMG("photo-1535189487909-a262ad10c165"), desc: "Aromatic coriander bunches. ~6kg crate." },
    { name: "Methi (Fenugreek)", unit: "crate", price: 300, minQty: 4, stock: 80, origin: "Nashik, Maharashtra", image: IMG("photo-1515872474884-c6d09b4f1d2f"), desc: "Fresh methi leaves, cleaned bunches. ~6kg crate." },
  ],
  dairy: [
    { name: "Cow Milk (Toned)", unit: "crate", price: 1320, minQty: 2, stock: 200, origin: "Anand, Gujarat", image: IMG("photo-1550583724-b2692b85b150"), desc: "Toned cow milk, 500ml pouch x 24 per crate. Chilled supply." },
    { name: "Paneer (Fresh)", unit: "kg", price: 320, minQty: 10, stock: 140, origin: "Karnal, Haryana", image: IMG("photo-1631452180519-c014fe946bc7"), desc: "Fresh full-cream paneer, vacuum packed. Min order 10kg." },
    { name: "Table Butter", unit: "kg", price: 440, minQty: 10, stock: 100, origin: "Anand, Gujarat", image: IMG("photo-1589985270826-4b7bb135bc9d"), desc: "Salted table butter, 500g blocks. Min order 10kg." },
  ],
};

async function main() {
  console.log("🌱 Seeding B2B Mandi…");

  // wipe (dev only) in FK-safe order
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash("password123", 10);

  // --- Admin ---
  await prisma.user.create({
    data: {
      email: "admin@b2bmandi.com",
      password,
      name: "Mandi Admin",
      role: "ADMIN",
      businessName: "B2B Mandi",
      city: "Bengaluru",
    },
  });

  // --- Sellers ---
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

  // --- Buyers ---
  await prisma.user.create({
    data: {
      email: "buyer@kirana.com",
      password,
      name: "Suresh Kumar",
      role: "BUYER",
      businessName: "Suresh Kirana Store",
      city: "Bengaluru",
      phone: "9812345678",
      address: "12, Gandhi Bazaar, Basavanagudi",
      pincode: "560004",
      gstin: "29BUYER1234A1Z9",
    },
  });
  await prisma.user.create({
    data: {
      email: "chef@hotelblue.com",
      password,
      name: "Anita Desai",
      role: "BUYER",
      businessName: "Hotel Blue Orchid",
      city: "Pune",
      phone: "9823456789",
      address: "5, FC Road",
      pincode: "411004",
    },
  });

  // --- Categories + Products ---
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

  console.log(
    `✅ Seeded ${CATEGORIES.length} categories, ${sellers.length} sellers, 3 buyers, ${productCount} products.`,
  );
  console.log("\n🔐 Demo logins (password: password123):");
  console.log("   Buyer:  buyer@kirana.com");
  console.log("   Seller: ramesh@greenfarms.com");
  console.log("   Admin:  admin@b2bmandi.com");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
