// src/lib/catalog.ts
// Curated dataset of 50 luxury sarees with various fabrics, colours, occasions, and premium image sources.
// Used as local fallback for development, demo, and initial client browsing.

export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  publicId: string;
  isPrimary: boolean;
  orderNum: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  fabric: string;
  colour: string;
  occasion: string;
  stock: number;
  careInstructions: string;
  deliveryInfo: string;
  returnPolicy: string;
  isActive: boolean;
  categoryId: string;
  categorySlug?: string;
  variantGroupId?: string | null;
  images: ProductImage[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export const MOCK_CATEGORIES: Category[] = [
  {
    id: "cat-kanchipuram",
    name: "Kanchipuram Silk",
    slug: "kanchipuram-silk",
    description: "South India's crown jewel. Rich mulberry silk woven with pure gold zari borders, perfect for bridal wear and grand celebrations.",
  },
  {
    id: "cat-banarasi",
    name: "Banarasi Silk",
    slug: "banarasi-silk",
    description: "Centuries of royal heritage from Varanasi. Famous for its intricate brocade work, floral motifs, and heavy gold and silver embroidery.",
  },
  {
    id: "cat-chanderi",
    name: "Chanderi",
    slug: "chanderi",
    description: "Luxurious, lightweight, and sheer. Woven with a blend of fine silk and cotton, decorated with traditional coin motifs.",
  },
  {
    id: "cat-georgette",
    name: "Georgette",
    slug: "georgette",
    description: "Flowing silhouettes in pure crêpe georgette. Embellished with delicate hand embroidery, sequins, and Lucknowi Chikankari.",
  },
  {
    id: "cat-organza",
    name: "Organza",
    slug: "organza",
    description: "Contemporary romance. Sheer, crisp silk organza sarees adorned with hand-painted floral patterns and delicate scalloped borders.",
  },
  {
    id: "cat-bridal",
    name: "Bridal Special",
    slug: "bridal",
    description: "Masterpiece heirloom drapes meticulously crafted over months to make your wedding day absolutely unforgettable.",
  },
  {
    id: "cat-designer",
    name: "Designer Wear",
    slug: "designer",
    description: "Modern interpretations of traditional weaves. Contemporary color blocks, experimental patterns, and unconventional borders.",
  },
];

// Rich, high-quality images from Unsplash representing premium Indian sarees and textures
const SARREE_IMAGES = [
  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80", // Crimson Maroon Red
  "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80", // Royal Gold
  "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80", // Emerald Green
  "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&w=800&q=80", // Midnight Blue
  "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&w=800&q=80", // Rose Pink
  "https://images.unsplash.com/photo-1561414927-6d86591d0c4f?auto=format&fit=crop&w=800&q=80", // Mustard Yellow Gold
  "https://images.unsplash.com/photo-1590156221120-e22137563004?auto=format&fit=crop&w=800&q=80", // Ivory White Cream
  "https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&w=800&q=80", // Peach Salmon
];

// Helper to generate 50 unique, luxury sarees programmatically but with realistic values
const generateMockProducts = (): Product[] => {
  const products: Product[] = [];
  
  const fabrics = ["Kanchipuram Silk", "Banarasi Silk", "Chanderi", "Georgette", "Organza"];
  const colours = ["Deep Crimson", "Royal Blue", "Forest Green", "Mustard Gold", "Peach Pink", "Ivory White", "Midnight Black"];
  const occasions = ["Bridal", "Festive", "Designer", "Casual"];
  
  const fabricDescriptions: Record<string, string> = {
    "Kanchipuram Silk": "Handwoven with pure mulberry silk and heavy gold zari threads from Kanchipuram, featuring traditional border patterns of temple spikes and floral creepers.",
    "Banarasi Silk": "Exquisite Varanasi handloom featuring heavy gold brocade embroidery, Mughal-inspired floral motifs, and a spectacular pallu weave.",
    "Chanderi": "A beautiful sheer weave blending premium silk and fine cotton. Exceptionally lightweight with gold buttis handwoven across the body.",
    "Georgette": "Made from premium double-crêpe silk yarns, offering a graceful, fluid drape. Embellished with beautiful tone-on-tone hand embroidery.",
    "Organza": "A crisp, semi-translucent silk organza drape, featuring hand-painted floral details, soft pastel hues, and subtle gold thread work along the border."
  };

  // Explicit array of 50 luxury sarees to ensure perfect, hand-crafted detail
  for (let i = 1; i <= 50; i++) {
    const fabric = fabrics[(i - 1) % fabrics.length];
    const colour = colours[(i - 1) % colours.length];
    const occasion = occasions[(i - 1) % occasions.length];
    
    // Select category based on fabric and occasion
    let category = MOCK_CATEGORIES[0]; // Kanchipuram
    if (occasion === "Bridal") {
      category = MOCK_CATEGORIES[5]; // Bridal Special
    } else if (occasion === "Designer") {
      category = MOCK_CATEGORIES[6]; // Designer Wear
    } else {
      const catIndex = MOCK_CATEGORIES.findIndex(c => c.name.includes(fabric.split(" ")[0]));
      if (catIndex !== -1) category = MOCK_CATEGORIES[catIndex];
    }

    // Set prices realistically based on category/fabric
    let basePrice = 12500 + (i * 720); // base price ranges from ~13k to ~48k
    if (category.slug === "bridal") basePrice += 15000; // Bridal sarees are more premium
    if (fabric === "Kanchipuram Silk" || fabric === "Banarasi Silk") basePrice += 8000;

    const id = `prod-saree-${i}`;
    const name = `${colour} ${fabric} — ${i % 2 === 0 ? "Heritage Zari" : "Royal Brocade"}`;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    // Choose images from our premium pool
    const primaryImgIndex = (i - 1) % SARREE_IMAGES.length;
    const secondaryImgIndex = (i * 2) % SARREE_IMAGES.length;
    const tertiaryImgIndex = (i * 3) % SARREE_IMAGES.length;

    const images: ProductImage[] = [
      {
        id: `img-${id}-1`,
        productId: id,
        imageUrl: SARREE_IMAGES[primaryImgIndex],
        publicId: `cloudinary_saree_${i}_1`,
        isPrimary: true,
        orderNum: 0
      },
      {
        id: `img-${id}-2`,
        productId: id,
        imageUrl: SARREE_IMAGES[secondaryImgIndex],
        publicId: `cloudinary_saree_${i}_2`,
        isPrimary: false,
        orderNum: 1
      },
      {
        id: `img-${id}-3`,
        productId: id,
        imageUrl: SARREE_IMAGES[tertiaryImgIndex],
        publicId: `cloudinary_saree_${i}_3`,
        isPrimary: false,
        orderNum: 2
      }
    ];

    products.push({
      id,
      name,
      slug,
      description: `${fabricDescriptions[fabric]} This saree stands out with its beautiful ${colour.toLowerCase()} shade and luxurious weave. Specially curated by Drapes De Dzire for a modern woman who appreciates traditional Indian craftsmanship.`,
      basePrice,
      fabric,
      colour,
      occasion,
      stock: i % 10 === 0 ? 0 : 5 + (i % 4), // Some items out of stock for inventory checking
      careInstructions: "Dry clean only. Store wrapped in clean, soft cotton or muslin cloth in a dark wardrobe. Avoid direct contact with perfume sprays or metal hangers to prevent zari tarnishing.",
      deliveryInfo: "Complimentary premium packing. Shipped within 24-48 hours. Pan-India tracked shipping via DHL/Delhivery. Delivery timelines: 3-5 business days for major cities, 5-7 days for regional districts.",
      returnPolicy: "Easy returns and exchanges allowed within 7 days of delivery. The product must be completely unused, untampered, and returned in its original brand box with all tags and certification labels intact.",
      isActive: true,
      categoryId: category.id,
      categorySlug: category.slug,
      images
    });
  }

  return products;
};

export const MOCK_PRODUCTS: Product[] = generateMockProducts();
