// scripts/seed-banners.ts
import { prisma } from '../src/lib/prisma';

const slides = [
  {
    type: 'HERO',
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6153c?auto=format&fit=crop&w=1920&q=80',
    publicId: 'mock_hero_1',
    title: 'Heritage in Every Thread',
    subtitle: 'Kanchipuram Silk',
    description: 'Centuries of craftsmanship, woven into timeless elegance. Discover our curated collection of authentic handwoven silk sarees.',
    ctaText: 'Explore Kanchipuram',
    redirectUrl: '/collections/kanchipuram-silk',
    accentColor: '#D4AF37',
    orderNum: 1,
    isActive: true,
  },
  {
    type: 'HERO',
    imageUrl: 'https://images.unsplash.com/photo-1583391733958-d25e07fac04f?auto=format&fit=crop&w=1920&q=80',
    publicId: 'mock_hero_2',
    title: 'Draped in Royalty',
    subtitle: 'Banarasi Silk',
    description: 'From the sacred looms of Varanasi — opulent Banarasi silks adorned with intricate zari work, fit for a queen.',
    ctaText: 'Shop Banarasi',
    redirectUrl: '/collections/banarasi-silk',
    accentColor: '#E2C456',
    orderNum: 2,
    isActive: true,
  },
  {
    type: 'HERO',
    imageUrl: 'https://images.unsplash.com/photo-1610189013233-5c8e221371ba?auto=format&fit=crop&w=1920&q=80',
    publicId: 'mock_hero_3',
    title: 'Your Perfect Bridal Look',
    subtitle: 'Bridal Collection',
    description: 'Begin your forever in breathtaking luxury. Handpicked bridal sarees crafted for your most cherished moments.',
    ctaText: 'View Bridal Collection',
    redirectUrl: '/collections/bridal',
    accentColor: '#D4AF37',
    orderNum: 3,
    isActive: true,
  },
];

async function main() {
  console.log('Seeding banners...');
  for (const slide of slides) {
    const existing = await prisma.banner.findFirst({
      where: { publicId: slide.publicId },
    });
    if (!existing) {
      await prisma.banner.create({
        data: slide,
      });
      console.log(`Created banner: ${slide.title}`);
    } else {
      console.log(`Banner already exists: ${slide.title}`);
    }
  }
  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
