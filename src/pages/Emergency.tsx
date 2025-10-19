import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, QrCode, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import healthdagLogo from "@/assets/healthdag-logo.png";
import Footer from "@/components/Footer";

const Emergency = () => {
  const [bloodType, setBloodType] = useState("");
  const [allergies, setAllergies] = useState<string[]>([]);
  const [allergyInput, setAllergyInput] = useState("");
  const [medicalConditions, setMedicalConditions] = useState<string[]>([]);
  const [conditionInput, setConditionInput] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchEmergencyData();
  }, []);

  const fetchEmergencyData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data, error } = await (supabase as any)
      .from("emergency_access")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!error && data) {
      setBloodType(data.blood_type || "");
      setAllergies(data.allergies || []);
      setMedicalConditions(data.medical_conditions || []);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const emergencyData = {
      user_id: user.id,
      blood_type: bloodType,
      allergies: allergies,
      medical_conditions: medicalConditions,
      qr_code: `QR_${user.id.substring(0, 8)}`,
    };

    const { error } = await (supabase as any)
      .from("emergency_access")
      .upsert(emergencyData, { onConflict: "user_id" });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Emergency information saved successfully!",
      });
    }

    setLoading(false);
  };

  const addAllergy = () => {
    if (allergyInput.trim()) {
      setAllergies([...allergies, allergyInput.trim()]);
      setAllergyInput("");
    }
  };

  const removeAllergy = (index: number) => {
    setAllergies(allergies.filter((_, i) => i !== index));
  };

  const addCondition = () => {
    if (conditionInput.trim()) {
      setMedicalConditions([...medicalConditions, conditionInput.trim()]);
      setConditionInput("");
    }
  };

  const removeCondition = (index: number) => {
    setMedicalConditions(medicalConditions.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20">
      <header className="border-b border-primary/20 bg-background/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <img src={healthdagLogo} alt="HealthDAG" className="w-8 h-8" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Emergency Access
          </h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Emergency Medical Information</CardTitle>
            <CardDescription>
              This information will be accessible to medical staff in emergencies via QR code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="blood-type">Blood Type</Label>
                <Input
                  id="blood-type"
                  placeholder="e.g., A+, O-, AB+"
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Allergies</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add allergy (e.g., Penicillin)"
                    value={allergyInput}
                    onChange={(e) => setAllergyInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addAllergy())}
                  />
                  <Button type="button" onClick={addAllergy}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {allergies.map((allergy, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-destructive/10 text-destructive rounded-full text-sm flex items-center gap-2"
                    >
                      {allergy}
                      <button
                        type="button"
                        onClick={() => removeAllergy(index)}
                        className="hover:text-destructive/70"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Medical Conditions</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add condition (e.g., Diabetes)"
                    value={conditionInput}
                    onChange={(e) => setConditionInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCondition())}
                  />
                  <Button type="button" onClick={addCondition}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {medicalConditions.map((condition, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2"
                    >
                      {condition}
                      <button
                        type="button"
                        onClick={() => removeCondition(index)}
                        className="hover:text-primary/70"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center gap-3 mb-4">
                  <QrCode className="w-8 h-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">QR Code Access</p>
                    <p className="text-sm text-muted-foreground">
                      Generate a QR code for emergency responders
                    </p>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Saving..." : "Save Emergency Information"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default Emergency;
