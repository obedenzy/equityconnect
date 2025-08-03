import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, DollarSign, Clock, Eye, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ListingCardProps {
  listing: {
    id: string;
    title: string;
    description: string;
    amount: string;
    tier: string;
    marketType: string;
    location: string;
    industryType: string;
    expectedReturns: string;
    timeframe: string;
    status: string;
    createdAt: string;
    buyerId: string;
  };
}

const tierLabels = {
  starter: "Starter",
  growth: "Growth",
  scale: "Scale", 
  enterprise: "Enterprise"
};

const tierColors = {
  starter: "bg-slate-100 text-slate-700",
  growth: "bg-blue-100 text-blue-700",
  scale: "bg-purple-100 text-purple-700",
  enterprise: "bg-amber-100 text-amber-700"
};

export default function ListingCard({ listing }: ListingCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const createConversationMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/conversations", {
        listingId: listing.id,
        buyerId: listing.buyerId,
        investorId: user?.id,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Conversation Started",
        description: "You can now message the buyer about this opportunity.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleContact = () => {
    if (!user) {
      toast({
        title: "Please Sign In",
        description: "You need to be signed in to contact buyers.",
        variant: "destructive",
      });
      return;
    }

    if (user.role !== "investor") {
      toast({
        title: "Investor Access Only",
        description: "Only investors can contact buyers about opportunities.",
        variant: "destructive",
      });
      return;
    }

    createConversationMutation.mutate();
  };

  return (
    <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-2">
          <Badge 
            className={`${tierColors[listing.tier as keyof typeof tierColors]} font-medium`}
          >
            {tierLabels[listing.tier as keyof typeof tierLabels]}
          </Badge>
          <Badge 
            variant={listing.status === "active" ? "default" : "secondary"}
            className={listing.status === "active" ? "bg-financial-success text-white" : ""}
          >
            {listing.status}
          </Badge>
        </div>
        
        <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">
          {listing.title}
        </h3>
        
        <div className="flex items-center text-sm text-slate-600 mt-2">
          <Building2 className="w-4 h-4 mr-1" />
          <span className="capitalize">{listing.marketType.replace('_', ' ')}</span>
          <span className="mx-2">•</span>
          <MapPin className="w-4 h-4 mr-1" />
          <span>{listing.location}</span>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        <p className="text-sm text-slate-600 line-clamp-3 mb-4">
          {listing.description}
        </p>
        
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Investment Amount</span>
            <div className="flex items-center font-semibold text-financial-blue">
              <DollarSign className="w-4 h-4 mr-1" />
              {Number(listing.amount).toLocaleString()}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Industry</span>
            <span className="text-sm font-medium">{listing.industryType}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Timeframe</span>
            <span className="text-sm font-medium">{listing.timeframe}</span>
          </div>
        </div>
        
        <div className="mt-auto">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              Posted {format(new Date(listing.createdAt), "MMM d, yyyy")}
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" className="flex-1">
              <Eye className="w-4 h-4 mr-1" />
              View Details
            </Button>
            
            <Button 
              size="sm" 
              className="flex-1 bg-financial-blue hover:bg-blue-800"
              onClick={handleContact}
              disabled={createConversationMutation.isPending || !user || user.role !== "investor"}
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              {createConversationMutation.isPending ? "Connecting..." : "Contact"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
