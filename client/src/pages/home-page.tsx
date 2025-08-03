import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import Navigation from "@/components/navigation";
import InvestmentTierCard from "@/components/investment-tier-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Building2, 
  TrendingUp, 
  Users, 
  Shield,
  FileText,
  MessageSquare,
  Video,
  CheckCircle
} from "lucide-react";

const tiers = [
  {
    name: "Starter",
    price: 500,
    range: "$100K - $350K",
    features: [
      "Secure document upload",
      "Investor messaging", 
      "Video call scheduling",
      "30-day listing period"
    ]
  },
  {
    name: "Growth",
    price: 1000,
    range: "$350K - $1M",
    features: [
      "Priority placement",
      "Enhanced investor matching",
      "All Starter features",
      "45-day listing period"
    ],
    popular: true
  },
  {
    name: "Scale", 
    price: 2500,
    range: "$1M - $3M",
    features: [
      "Premium placement",
      "Dedicated account manager",
      "All Growth features",
      "60-day listing period"
    ]
  },
  {
    name: "Enterprise",
    price: 5000,
    range: "$3M - $25M", 
    features: [
      "Featured placement",
      "White-glove service",
      "Custom matching criteria",
      "90-day listing period"
    ]
  }
];

export default function HomePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const handleGetStarted = () => {
    if (user) {
      setLocation("/dashboard");
    } else {
      setLocation("/auth");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Connect Buyers & Investors for{" "}
              <span className="text-primary">Equity Injections</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
              Secure funding for business acquisitions and real estate deals with our professional platform 
              connecting buyers seeking 10% equity injections with qualified investors.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="flex items-center"
              >
                <Building2 className="w-5 h-5 mr-2" />
                Post Funding Request
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => setLocation("/browse")}
                className="flex items-center"
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                Browse Opportunities
              </Button>
            </div>
          </div>

          {/* User Role Selection Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 ml-4">I'm a Buyer</h3>
                </div>
                <p className="text-slate-600 mb-6">
                  Seeking equity injection for business acquisition or real estate deals. 
                  Post your funding request and connect with qualified investors.
                </p>
                <ul className="space-y-3 mb-6">
                  {[
                    "Post detailed funding requests",
                    "Upload LOI and termsheets securely", 
                    "Communicate with investors directly",
                    "Schedule video calls for discussions"
                  ].map((feature) => (
                    <li key={feature} className="flex items-center text-sm text-slate-700">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full" 
                  onClick={() => setLocation("/auth?role=buyer")}
                >
                  Register as Buyer
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 ml-4">I'm an Investor</h3>
                </div>
                <p className="text-slate-600 mb-6">
                  Looking to provide equity funding for business and real estate deals. 
                  Browse opportunities and connect with qualified buyers.
                </p>
                <ul className="space-y-3 mb-6">
                  {[
                    "Browse curated investment opportunities",
                    "Filter by investment tier and market",
                    "Access secure documents with verification", 
                    "Set investment preferences and criteria"
                  ].map((feature) => (
                    <li key={feature} className="flex items-center text-sm text-slate-700">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full bg-green-500 hover:bg-green-600"
                  onClick={() => setLocation("/auth?role=investor")}
                >
                  Register as Investor
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Investment Tiers */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Investment Tiers & Listing Fees</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Choose the appropriate tier for your funding request. Professional documentation and verification included.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiers.map((tier) => (
              <InvestmentTierCard key={tier.name} tier={tier} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-slate-600">
              * All tiers include secure document management, investor communication tools, and video call scheduling.
              <br />No transaction fees or commissions. Platform acts as connection facilitator only.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Professional Platform Features</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Everything you need to connect and complete your equity injection deals securely.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6 text-center">
                <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Secure Documents</h3>
                <p className="text-slate-600">
                  Upload and share LOI and termsheets with complete access control and redaction capabilities.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <MessageSquare className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Private Messaging</h3>
                <p className="text-slate-600">
                  Communicate directly with investors and buyers without exposing personal contact information.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Video className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Video Calls</h3>
                <p className="text-slate-600">
                  Schedule and conduct secure video calls for detailed deal discussions and due diligence.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <span className="ml-2 text-xl font-bold">EquityConnect</span>
              </div>
              <p className="text-slate-300 mb-6 max-w-md">
                Professional platform connecting buyers seeking equity injections with qualified investors 
                for business and real estate acquisitions.
              </p>
              <div className="bg-slate-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Important Disclaimer</h4>
                <p className="text-sm text-slate-300">
                  EquityConnect is a connection facilitator only. We are not a broker, financial advisor, 
                  or intermediary. All investment decisions and transactions are solely between buyers and investors. 
                  Platform is not liable for transaction outcomes or legal compliance.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-slate-300">
                <li><Link href="#" className="hover:text-white transition-colors">How It Works</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/browse" className="hover:text-white transition-colors">Investment Tiers</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Security</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Legal & Support</h3>
              <ul className="space-y-2 text-slate-300">
                <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Platform Liability</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Support Center</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-700 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-slate-400 text-sm">
                © 2024 EquityConnect. All rights reserved. Not a registered investment advisor or broker-dealer.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
