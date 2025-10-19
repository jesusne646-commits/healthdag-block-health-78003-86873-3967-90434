import Hero from "@/components/Hero";
import Features from "@/components/Features";
import SecuritySection from "@/components/SecuritySection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <Features />
      <SecuritySection />
      <Footer />
    </div>
  );
};

export default Index;
