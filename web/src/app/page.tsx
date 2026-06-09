// src/app/page.tsx — Homepage
// Sections: Hero, Collections Grid, Featured Story, New Arrivals, Why Choose Us, Instagram Strip
import type { Metadata } from "next";
import HeroSection from "@/components/home/HeroSection";
import CollectionsGrid from "@/components/home/CollectionsGrid";
import FeaturedStory from "@/components/home/FeaturedStory";
import NewArrivals from "@/components/home/NewArrivals";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import InstagramStrip from "@/components/home/InstagramStrip";

export const metadata: Metadata = {
  title: "Drapes De Dzire — Premium Sarees Online | Authentic Indian Silk",
  description:
    "Discover India's finest handwoven sarees. Kanchipuram Silk, Banarasi Silk, Bridal & Designer sarees — crafted by master artisans. Pan-India delivery.",
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CollectionsGrid />
      <FeaturedStory />
      <NewArrivals />
      <WhyChooseUs />
      <InstagramStrip />
    </>
  );
}
