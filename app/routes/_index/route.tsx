import type { MetaFunction } from "@remix-run/cloudflare";
import Navbar from "./navbar";
import Hero from "./hero";
import Features from "./features";
import About from "./about";
import FAQs from "./faq";
import Footer from "./footer";



export const meta: MetaFunction = () => {
  return [
    { title: "Kelas Tech" },
    { name: "description", content: "A platform for Malaysian tech enthusiasts to learn and teach together." },
  ];
};

export default function LandingPage() {

  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      {/* <About /> */}
      <FAQs />
      <Footer />
    </>
  );
}