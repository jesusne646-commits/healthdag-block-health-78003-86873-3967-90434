import { Card } from "@/components/ui/card";
import { Shield, Lock, Key, Server } from "lucide-react";

const securityFeatures = [
  {
    icon: Shield,
    title: "NIST/ISO-Grade Security",
    description: "Military-grade encryption standards protecting your health data"
  },
  {
    icon: Lock,
    title: "End-to-End Encryption",
    description: "Your data is encrypted at rest and in transit, always"
  },
  {
    icon: Key,
    title: "Private Key Control",
    description: "Only you hold the keys to decrypt your medical records"
  },
  {
    icon: Server,
    title: "Decentralized Storage",
    description: "Data stored on BlockDAG network with IPFS for large files"
  }
];

const SecuritySection = () => {
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Security First
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your health data deserves the highest level of protection. We've built HealthDAG with security at its core.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {securityFeatures.map((feature, index) => (
            <Card 
              key={index}
              className="p-8 bg-card/50 backdrop-blur border-border hover:border-primary/50 transition-all hover:shadow-[0_0_30px_rgba(34,211,238,0.2)] group"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-background" />
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        <Card className="p-8 md:p-12 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30 text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
            Powered by BlockDAG Technology
          </h3>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            HealthDAG leverages the BlockDAG network to provide unprecedented security, transparency, and control over your healthcare data. 
            All transactions are immutable, verifiable, and completely under your control.
          </p>
        </Card>
      </div>
    </section>
  );
};

export default SecuritySection;
