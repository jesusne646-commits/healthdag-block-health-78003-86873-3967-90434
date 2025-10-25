import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Search, ArrowLeft } from "lucide-react";
import { DonationCard } from "@/components/DonationCard";
import { DonationModal } from "@/components/DonationModal";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import healthdagLogo from "@/assets/healthdag-logo.png";

interface Campaign {
  id: string;
  title: string;
  description: string;
  illness_category: string;
  target_amount: number;
  raised_amount: number;
  urgency_level: string;
  patient_age: number;
  patient_story: string;
  end_date: string | null;
  hospital_id: string;
  hospitals: {
    name: string;
  };
  profiles: {
    full_name: string;
    wallet_address: string;
  };
}

const Donations = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      // First get campaigns
      const { data: campaignsData, error: campaignsError } = await supabase
        .from("donation_campaigns")
        .select("*, hospitals(name)")
        .eq("status", "active")
        .not("verified_at", "is", null)
        .order("urgency_level", { ascending: true })
        .order("created_at", { ascending: false });

      if (campaignsError) throw campaignsError;

      // Then get profiles for each patient
      if (campaignsData && campaignsData.length > 0) {
        const patientIds = campaignsData.map((c) => c.patient_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, full_name, wallet_address")
          .in("id", patientIds);

        if (profilesError) throw profilesError;

        // Merge data
        const mergedData = campaignsData.map((campaign) => ({
          ...campaign,
          profiles: profilesData?.find((p) => p.id === campaign.patient_id) || {
            full_name: "Anonymous",
            wallet_address: "",
          },
        }));

        setCampaigns(mergedData);
      } else {
        setCampaigns([]);
      }
    } catch (error: any) {
      console.error("Fetch campaigns error:", error);
      toast({
        title: "Error",
        description: "Failed to load donation campaigns",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || campaign.illness_category === categoryFilter;
    const matchesUrgency = urgencyFilter === "all" || campaign.urgency_level === urgencyFilter;
    return matchesSearch && matchesCategory && matchesUrgency;
  });

  const totalRaised = campaigns.reduce((sum, c) => sum + Number(c.raised_amount), 0);
  const patientsHelped = campaigns.filter(c => c.raised_amount >= c.target_amount).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/dashboard")}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
              <img src={healthdagLogo} alt="HealthDAG" className="w-12 h-12 drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Donate to Patients
              </h1>
            </div>
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-4">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-br from-rose-500 via-pink-500 to-red-500 rounded-full">
              <Heart className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
            Support Patients in Need
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            100% transparent blockchain donations. Every BDAG helps save a life.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 max-w-4xl mx-auto">
            <div className="p-6 bg-card rounded-xl border">
              <div className="text-3xl font-bold text-primary">{totalRaised.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Total BDAG Raised</div>
            </div>
            <div className="p-6 bg-card rounded-xl border">
              <div className="text-3xl font-bold text-primary">{campaigns.length}</div>
              <div className="text-sm text-muted-foreground">Active Campaigns</div>
            </div>
            <div className="p-6 bg-card rounded-xl border">
              <div className="text-3xl font-bold text-primary">{patientsHelped}</div>
              <div className="text-sm text-muted-foreground">Patients Helped</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by illness" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Cancer">Cancer</SelectItem>
                <SelectItem value="Heart Surgery">Heart Surgery</SelectItem>
                <SelectItem value="Kidney Treatment">Kidney Treatment</SelectItem>
                <SelectItem value="Accident Recovery">Accident Recovery</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Urgency Levels</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Campaign Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-[400px] rounded-xl" />
            ))}
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No campaigns found</h3>
            <p className="text-muted-foreground">
              {searchTerm || categoryFilter !== "all" || urgencyFilter !== "all"
                ? "Try adjusting your filters"
                : "Check back soon for new campaigns"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign) => (
              <DonationCard
                key={campaign.id}
                campaign={campaign}
                onDonate={() => setSelectedCampaign(campaign)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Donation Modal */}
      {selectedCampaign && (
        <DonationModal
          campaign={selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
          onSuccess={() => {
            setSelectedCampaign(null);
            fetchCampaigns();
          }}
        />
      )}
    </div>
  );
};

export default Donations;
