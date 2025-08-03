import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CheckCircle, CreditCard, FileText, Clock } from "lucide-react";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ listing }: { listing: any }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const confirmPaymentMutation = useMutation({
    mutationFn: async ({ paymentIntentId, listingId }: { paymentIntentId: string; listingId: string }) => {
      const res = await apiRequest("POST", "/api/confirm-payment", { paymentIntentId, listingId });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      toast({
        title: "Payment Successful",
        description: "Your listing is now active and visible to investors!",
      });
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Payment Confirmation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    if (!stripe || !elements) {
      setIsProcessing(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/dashboard",
      },
      redirect: "if_required",
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      confirmPaymentMutation.mutate({
        paymentIntentId: paymentIntent.id,
        listingId: listing.id,
      });
    }
    
    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing || confirmPaymentMutation.isPending}
        className="w-full"
        size="lg"
      >
        {isProcessing || confirmPaymentMutation.isPending 
          ? "Processing..." 
          : `Pay $${Number(listing.listingFee).toLocaleString()} & Activate Listing`
        }
      </Button>
    </form>
  );
};

export default function Checkout() {
  const params = useParams();
  const listingId = params.listingId;
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState("");

  const { data: listing, isLoading: listingLoading } = useQuery({
    queryKey: ["/api/listings", listingId],
    enabled: !!listingId,
  });

  const { data: tierPricing } = useQuery({
    queryKey: ["/api/tier-pricing"],
  });

  useEffect(() => {
    if (listing && tierPricing) {
      // Create PaymentIntent
      apiRequest("POST", "/api/create-payment-intent", { 
        listingId: listing.id,
        tier: listing.tier 
      })
        .then((res) => res.json())
        .then((data) => {
          setClientSecret(data.clientSecret);
        })
        .catch((error) => {
          toast({
            title: "Payment Setup Failed",
            description: error.message,
            variant: "destructive",
          });
        });
    }
  }, [listing, tierPricing, toast]);

  if (listingLoading || !listing) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-screen flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-screen flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  const tierLabels = {
    starter: "Starter",
    growth: "Growth", 
    scale: "Scale",
    enterprise: "Enterprise"
  };

  const tierRanges = {
    starter: "$100K - $350K",
    growth: "$350K - $1M",
    scale: "$1M - $3M", 
    enterprise: "$3M - $25M"
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Complete Your Listing</h1>
          <p className="text-slate-600">
            Pay the listing fee to activate your funding request and start connecting with investors
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm listing={listing} />
                </Elements>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What happens next?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Listing Activation</h4>
                      <p className="text-sm text-slate-600">Your listing becomes visible to qualified investors immediately</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Investor Matching</h4>
                      <p className="text-sm text-slate-600">Our platform matches you with investors based on your criteria</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Direct Communication</h4>
                      <p className="text-sm text-slate-600">Receive and respond to investor inquiries through our secure platform</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Listing Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Listing Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{listing.title}</h3>
                  <p className="text-slate-600 text-sm mt-1">{listing.description.slice(0, 150)}...</p>
                </div>

                <div className="flex items-center justify-between py-2 border-t">
                  <span className="text-slate-600">Investment Amount</span>
                  <span className="font-semibold">${Number(listing.amount).toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-t">
                  <span className="text-slate-600">Investment Tier</span>
                  <Badge variant="outline">
                    {tierLabels[listing.tier as keyof typeof tierLabels]} ({tierRanges[listing.tier as keyof typeof tierRanges]})
                  </Badge>
                </div>

                <div className="flex items-center justify-between py-2 border-t">
                  <span className="text-slate-600">Market Type</span>
                  <span className="font-medium capitalize">{listing.marketType.replace('_', ' ')}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-t">
                  <span className="text-slate-600">Location</span>
                  <span className="font-medium">{listing.location}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Listing Fee</span>
                    <span className="font-semibold">${Number(listing.listingFee).toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-t border-slate-200">
                    <span className="font-semibold">Total</span>
                    <span className="text-xl font-bold">${Number(listing.listingFee).toLocaleString()}</span>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 mt-4">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-primary mr-2" />
                      <div className="text-sm">
                        <div className="font-medium text-primary">
                          {listing.tier === "starter" ? "30" : 
                           listing.tier === "growth" ? "45" :
                           listing.tier === "scale" ? "60" : "90"}-day listing period
                        </div>
                        <div className="text-slate-600">Your listing will be active for the full tier duration</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Secure Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-slate-600">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    SSL encrypted payment processing
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    PCI DSS compliant
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    No hidden fees or commissions
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Instant listing activation
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
