import { Card } from "@/components/ui/card";
import { Shield, Brain, Calendar, CreditCard, Wallet, FileText, AlertCircle } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Encrypted Health Record Vault",
    description: "Patient data stored in encrypted form on-chain. Only your private key or approved wallets can decrypt. Large files stored on IPFS with encrypted metadata.",
    gradient: "from-primary to-accent"
  },
  {
    icon: Brain,
    title: "AI-Powered Medical Insights",
    description: "AI scans health data locally to suggest lifestyle improvements and detect risks. Includes healthdagAI chatbot for instant health Q&A based on your records.",
    gradient: "from-accent to-primary"
  },
  {
    icon: Calendar,
    title: "Appointment Booking",
    description: "Search hospitals and doctors, book appointments for free with wallet signature. Priority access for BDAG token holders with instant confirmation.",
    gradient: "from-primary to-accent"
  },
  {
    icon: CreditCard,
    title: "Bill Payment via BlockDAG",
    description: "All payments processed through smart contracts with transparent pricing, instant receipts, and immutable history. Support for split payments with insurance.",
    gradient: "from-accent to-primary"
  },
  {
    icon: Wallet,
    title: "Embedded BlockDAG Wallet",
    description: "In-app wallet showing BDAG balance, transaction history, and access control permissions. Auto top-up from other crypto wallets or exchanges.",
    gradient: "from-primary to-accent"
  },
  {
    icon: FileText,
    title: "Medical Record Delivery",
    description: "Labs and hospitals send verified test results directly to your account with digital signature verification. AI-based summarization included.",
    gradient: "from-accent to-primary"
  },
  {
    icon: AlertCircle,
    title: "Emergency Access Mode",
    description: "Paramedics scan your QR code for critical info (blood type, allergies) via geo-fenced temporary decryption keys valid only within emergency radius.",
    gradient: "from-primary to-accent"
  }
];

const Features = () => {
  return (
    <section id="features" className="py-20 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/20 to-background" />
      
      <div className="container max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Core Modules
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need for secure, decentralized healthcare management
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="p-6 bg-card/50 backdrop-blur border-border hover:border-primary/50 transition-all hover:shadow-[0_0_30px_rgba(34,211,238,0.2)] group"
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6 text-background" />
              </div>
              
              <h3 className="text-xl font-semibold mb-3 text-foreground">
                {feature.title}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
