import { Card } from "@/components/ui/card";

const steps = [
  {
    number: "01",
    title: "Create Your Wallet",
    description: "Get started with a secure BlockDAG wallet embedded in the app"
  },
  {
    number: "02",
    title: "Upload Health Records",
    description: "Securely upload and encrypt your medical history, prescriptions, and lab results"
  },
  {
    number: "03",
    title: "Manage & Access",
    description: "Book appointments, pay bills, and get AI-powered health insights"
  },
  {
    number: "04",
    title: "Stay Protected",
    description: "Your data remains encrypted and accessible only by you and approved providers"
  }
];

const HowItWorks = () => {
  return (
    <section className="py-20 px-4 relative">
      <div className="container max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground">
            Get started in four simple steps
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <Card 
              key={index}
              className="p-6 bg-card/50 backdrop-blur border-border hover:border-accent/50 transition-all relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 text-8xl font-bold text-primary/5 group-hover:text-primary/10 transition-colors">
                {step.number}
              </div>
              
              <div className="relative z-10">
                <div className="text-4xl font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent mb-4">
                  {step.number}
                </div>
                
                <h3 className="text-xl font-semibold mb-3 text-foreground">
                  {step.title}
                </h3>
                
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
