import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

interface TierProps {
  tier: {
    name: string;
    price: number;
    range: string;
    features: string[];
    popular?: boolean;
  };
}

export default function InvestmentTierCard({ tier }: TierProps) {
  return (
    <Card 
      className={`relative hover:shadow-xl transition-shadow ${
        tier.popular ? "border-2 border-financial-blue" : "border border-slate-200"
      }`}
    >
      {tier.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-financial-blue text-white">POPULAR</Badge>
        </div>
      )}
      
      <CardContent className="p-6 text-center">
        <h3 className="text-lg font-bold text-slate-900 mb-2">{tier.name}</h3>
        <div className="text-3xl font-bold text-financial-blue mb-1 font-mono">
          ${tier.price.toLocaleString()}
        </div>
        <p className="text-sm text-slate-600 mb-4">listing fee</p>
        
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="text-sm font-semibold text-financial-blue mb-1">Investment Range</div>
          <div className="text-lg font-bold text-slate-900 font-mono">{tier.range}</div>
        </div>
        
        <ul className="space-y-3 text-sm text-slate-700 mb-6">
          {tier.features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <CheckCircle className="w-4 h-4 text-financial-success mr-2 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
        
        <Button 
          className={`w-full ${
            tier.popular 
              ? "bg-financial-blue text-white hover:bg-blue-800" 
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Select Tier
        </Button>
      </CardContent>
    </Card>
  );
}
