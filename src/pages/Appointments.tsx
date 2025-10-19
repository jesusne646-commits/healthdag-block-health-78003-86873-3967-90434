import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ArrowLeft, Search, Calendar as CalendarIcon, Star, MapPin, Wallet as WalletIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import healthdagLogo from "@/assets/healthdag-logo.png";
import Footer from "@/components/Footer";
import { SignaturePrompt } from "@/components/SignaturePrompt";
import { useSignature } from "@/hooks/useSignature";

type Hospital = {
  id: string;
  name: string;
  location: string;
  city: string;
  specialties: string[];
  rating?: number;
};

const Appointments = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [showWalletNotice, setShowWalletNotice] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { requestSignature, isWaitingForSignature } = useSignature();

  const specialties = Array.from(new Set(hospitals.flatMap(h => h.specialties || [])));
  const cities = Array.from(new Set(hospitals.map(h => h.city)));

  useEffect(() => {
    fetchHospitals();
    setShowWalletNotice(true);
  }, []);

  useEffect(() => {
    let filtered = hospitals;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((hospital) =>
        hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hospital.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by specialty
    if (selectedSpecialty) {
      filtered = filtered.filter(h => h.specialties?.includes(selectedSpecialty));
    }

    // Filter by city
    if (selectedCity) {
      filtered = filtered.filter(h => h.city === selectedCity);
    }

    // Filter by rating
    if (minRating > 0) {
      filtered = filtered.filter(h => (h.rating || 0) >= minRating);
    }

    setFilteredHospitals(filtered);
  }, [searchQuery, selectedSpecialty, selectedCity, minRating, hospitals]);

  const fetchHospitals = async () => {
    const { data, error } = await (supabase as any)
      .from("hospitals")
      .select("*")
      .order("name");

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load hospitals",
        variant: "destructive",
      });
    } else {
      setHospitals(data || []);
      setFilteredHospitals(data || []);
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHospital) return;

    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    // Request signature for encryption
    const message = `Booking encrypted appointment at ${selectedHospital.name} on ${appointmentDate}`;
    const signature = await requestSignature(message);
    
    if (!signature) {
      setLoading(false);
      return;
    }

    const { error } = await (supabase as any).from("appointments").insert({
      user_id: user.id,
      hospital_id: selectedHospital.id,
      appointment_date: appointmentDate,
      reason: reason,
      status: "pending",
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Appointment booked successfully!",
      });
      setSelectedHospital(null);
      setAppointmentDate("");
      setReason("");
    }

    setLoading(false);
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
            Book Appointment
          </h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {!selectedHospital ? (
          <>
            <div className="mb-6 space-y-4">
              <div>
                <Label htmlFor="search">Search Hospitals</Label>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by hospital name or city..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="specialty">Filter by Specialty</Label>
                  <select
                    id="specialty"
                    className="w-full mt-2 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                  >
                    <option value="">All Specialties</option>
                    {specialties.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="city">Filter by City</Label>
                  <select
                    id="city"
                    className="w-full mt-2 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                  >
                    <option value="">All Cities</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="rating">Minimum Rating</Label>
                  <select
                    id="rating"
                    className="w-full mt-2 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={minRating}
                    onChange={(e) => setMinRating(Number(e.target.value))}
                  >
                    <option value="0">All Ratings</option>
                    <option value="4">4+ Stars</option>
                    <option value="4.5">4.5+ Stars</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredHospitals.map((hospital) => (
                <Card
                  key={hospital.id}
                  className="cursor-pointer hover:shadow-lg transition-all hover:border-primary/50"
                  onClick={() => setSelectedHospital(hospital)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{hospital.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {hospital.location}, {hospital.city}
                        </CardDescription>
                      </div>
                      {hospital.rating && (
                        <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full">
                          <Star className="w-4 h-4 text-primary fill-primary" />
                          <span className="text-sm font-semibold text-primary">{hospital.rating}</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {hospital.specialties?.map((specialty, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Book Appointment at {selectedHospital.name}</CardTitle>
              <CardDescription>{selectedHospital.location}, {selectedHospital.city}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBookAppointment} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Appointment Date & Time</Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Visit</Label>
                  <Textarea
                    id="reason"
                    placeholder="Describe your symptoms or reason for visit..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedHospital(null)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {loading ? "Booking..." : "Confirm Booking"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>

      <AlertDialog open={showWalletNotice} onOpenChange={setShowWalletNotice}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <WalletIcon className="w-5 h-5 text-primary" />
              Wallet Requirement
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Note that booking an appointment is <span className="font-semibold text-foreground">free</span>, but you need to have at least <span className="font-semibold text-primary">1000 BDAG</span> in your wallet to proceed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Got it</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SignaturePrompt
        open={isWaitingForSignature}
        title="Encrypting Appointment"
        description="This appointment is being encrypted on the blockchain. Please sign the transaction in your wallet to confirm your identity and secure your medical data."
      />

      <Footer />
    </div>
  );
};

export default Appointments;
