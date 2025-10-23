import { Button } from "@/components/ui/button";
import { Shield, Lock, Brain } from "lucide-react";
import healthdagLogo from "@/assets/healthdag-logo.png";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden px-4 py-20">
      {/* Fixed header with theme toggle */}
      <div className="absolute top-0 left-0 right-0 z-50 border-b border-primary/10 bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-end gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
      
      {/* Main content - centered */}
      <div className="flex-1 flex items-center justify-center">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-secondary/20" />
        
        {/* Animated glow effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
        
        <div className="container relative z-10 max-w-6xl mx-auto">
          <div className="text-center space-y-8">
          {/* Logo */}
          <div className="flex justify-center mb-8 animate-fade-in">
            <img 
              src={healthdagLogo} 
              alt="HealthDAG Logo" 
              className="w-32 h-32 md:w-40 md:h-40 drop-shadow-[0_0_40px_rgba(34,211,238,0.4)]"
            />
          </div>
          
          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-fade-in-up">
            HealthDAG
          </h1>
          
          <p className="text-2xl md:text-3xl text-accent font-semibold mb-4 animate-fade-in-up delay-100">
            Decentralized Healthcare Management
          </p>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-200">
            Securely manage health records, pay bills, and book appointments on a decentralized BlockDAG network. 
            NIST/ISO-grade security with encrypted data access and AI-assisted healthcare management.
          </p>
          
          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-6 py-8 animate-fade-in-up delay-300">
            <div className="flex items-center gap-2 text-foreground/80">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-sm">NIST/ISO-Grade Security</span>
            </div>
            <div className="flex items-center gap-2 text-foreground/80">
              <Lock className="w-5 h-5 text-primary" />
              <span className="text-sm">End-to-End Encryption</span>
            </div>
            <div className="flex items-center gap-2 text-foreground/80">
              <Brain className="w-5 h-5 text-primary" />
              <span className="text-sm">AI-Powered Insights</span>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-400">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary to-accent hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all text-lg px-8 py-6"
              onClick={() => window.location.href = '/auth'}
            >
              Get Started
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-primary/50 hover:bg-primary/10 text-lg px-8 py-6"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Learn More
            </Button>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
