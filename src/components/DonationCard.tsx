import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Heart, Clock, Hospital, TrendingUp } from "lucide-react";

interface DonationCardProps {
  campaign: {
    id: string;
    title: string;
    description: string;
    illness_category: string;
    target_amount: number;
    raised_amount: number;
    urgency_level: string;
    patient_age: number;
    end_date: string | null;
    hospitals: {
      name: string;
    };
    profiles: {
      full_name: string;
    };
  };
  onDonate: () => void;
}

export const DonationCard = ({ campaign, onDonate }: DonationCardProps) => {
  const progressPercentage = (Number(campaign.raised_amount) / Number(campaign.target_amount)) * 100;
  const daysRemaining = campaign.end_date
    ? Math.max(0, Math.ceil((new Date(campaign.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case "critical": return "bg-red-500 text-white";
      case "urgent": return "bg-orange-500 text-white";
      case "moderate": return "bg-yellow-500 text-white";
      case "low": return "bg-green-500 text-white";
      default: return "bg-muted";
    }
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-pink-500 to-red-500" />
      
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">
              {campaign.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {campaign.profiles.full_name?.split(" ")[0] || "Anonymous"}, {campaign.patient_age}
            </p>
          </div>
          <Badge className={getUrgencyColor(campaign.urgency_level)}>
            {campaign.urgency_level}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Hospital className="w-4 h-4" />
          <span className="truncate">{campaign.hospitals.name}</span>
          <Badge variant="outline" className="ml-auto text-xs">
            Verified
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {campaign.description}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-primary">
                {Number(campaign.raised_amount).toFixed(2)} BDAG
              </div>
              <div className="text-xs text-muted-foreground">
                of {Number(campaign.target_amount).toFixed(2)} BDAG goal
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-primary">
                {progressPercentage.toFixed(0)}%
              </div>
              <div className="text-xs text-muted-foreground">raised</div>
            </div>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs">{campaign.illness_category}</span>
          </div>
          {daysRemaining !== null && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="text-xs">{daysRemaining} days left</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Button
          onClick={onDonate}
          className="w-full bg-gradient-to-r from-rose-500 via-pink-500 to-red-500 hover:from-rose-600 hover:via-pink-600 hover:to-red-600 text-white gap-2"
        >
          <Heart className="w-4 h-4" />
          Donate Now
        </Button>
      </CardFooter>
    </Card>
  );
};
