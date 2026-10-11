import { ContactUs } from "@/components/sections/marketing/home/contact-us";
import { Cta } from "@/components/sections/marketing/home/cta";
import { FeaturedCategories } from "@/components/sections/marketing/home/featured-categories";
import { Hero } from "@/components/sections/marketing/home/hero";
import { Mentors } from "@/components/sections/marketing/home/mentors";
import { Testimonials } from "@/components/sections/marketing/home/testimonials";
import { WhyChooseUs } from "@/components/sections/marketing/home/why-choose-us";

export default function Home() {
  return (
    <div>
      <Hero />
      <FeaturedCategories />
      <WhyChooseUs />
      <Cta />
      <Mentors />
      <Testimonials />
      <ContactUs />
    </div>
  );
}