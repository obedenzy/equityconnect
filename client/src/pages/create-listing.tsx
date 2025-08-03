import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import Navigation from "@/components/navigation";
import DocumentUpload from "@/components/document-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Building2, DollarSign, FileText, Clock } from "lucide-react";

const listingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  amount: z.string().min(1, "Amount is required"),
  tier: z.enum(["starter", "growth", "scale", "enterprise"]),
  marketType: z.enum(["business", "real_estate"]),
  location: z.string().min(1, "Location is required"),
  industryType: z.string().min(1, "Industry type is required"),
  expectedReturns: z.string().min(1, "Expected returns information is required"),
  timeframe: z.string().min(1, "Timeframe is required"),
});

type ListingData = z.infer<typeof listingSchema>;

const tierOptions = [
  { value: "starter", label: "Starter", range: "$100K - $350K", fee: 500 },
  { value: "growth", label: "Growth", range: "$350K - $1M", fee: 1000 },
  { value: "scale", label: "Scale", range: "$1M - $3M", fee: 2500 },
  { value: "enterprise", label: "Enterprise", range: "$3M - $25M", fee: 5000 },
];

export default function CreateListing() {
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: tierPricing } = useQuery({
    queryKey: ["/api/tier-pricing"],
  });

  const form = useForm<ListingData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: "",
      description: "",
      amount: "",
      tier: "starter",
      marketType: "business",
      location: "",
      industryType: "",
      expectedReturns: "",
      timeframe: "",
    },
  });

  const createListingMutation = useMutation({
    mutationFn: async (data: ListingData) => {
      const res = await apiRequest("POST", "/api/listings", data);
      return await res.json();
    },
    onSuccess: (listing) => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      toast({
        title: "Listing Created",
        description: "Your funding request has been created. Proceed to payment to activate.",
      });
      setLocation(`/checkout/${listing.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const selectedTier = tierOptions.find(t => t.value === form.watch("tier"));
  const amount = Number(form.watch("amount"));

  const validateTierAmount = () => {
    const tier = form.watch("tier");
    if (!amount) return true;

    switch (tier) {
      case "starter":
        return amount >= 100000 && amount <= 350000;
      case "growth":
        return amount >= 350001 && amount <= 1000000;
      case "scale":
        return amount >= 1000001 && amount <= 3000000;
      case "enterprise":
        return amount >= 3000001 && amount <= 25000000;
      default:
        return true;
    }
  };

  const handleSubmit = (data: ListingData) => {
    if (!validateTierAmount()) {
      toast({
        title: "Invalid Amount",
        description: `Amount must be within the ${selectedTier?.range} range for ${selectedTier?.label} tier.`,
        variant: "destructive",
      });
      return;
    }

    createListingMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Create Funding Request</h1>
          <p className="text-slate-600">
            Post your equity injection request and connect with qualified investors
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-primary' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-white' : 'bg-slate-200'}`}>
                1
              </div>
              <span className="font-medium">Listing Details</span>
            </div>
            <div className="w-8 h-px bg-slate-200" />
            <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-primary' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-white' : 'bg-slate-200'}`}>
                2
              </div>
              <span className="font-medium">Documents</span>
            </div>
            <div className="w-8 h-px bg-slate-200" />
            <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-primary' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary text-white' : 'bg-slate-200'}`}>
                3
              </div>
              <span className="font-medium">Payment</span>
            </div>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          {step === 1 && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building2 className="w-5 h-5 mr-2" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="title">Listing Title</Label>
                      <Input
                        id="title"
                        {...form.register("title")}
                        placeholder="e.g., Restaurant Acquisition - Downtown Location"
                        error={form.formState.errors.title?.message}
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        {...form.register("description")}
                        rows={4}
                        placeholder="Provide detailed information about your acquisition opportunity, business model, market position, and why you're seeking equity injection..."
                        error={form.formState.errors.description?.message}
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        {form.watch("description").length}/50 characters minimum
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="marketType">Market Type</Label>
                        <Select 
                          value={form.watch("marketType")} 
                          onValueChange={(value) => form.setValue("marketType", value as "business" | "real_estate")}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="business">Business Acquisition</SelectItem>
                            <SelectItem value="real_estate">Real Estate Investment</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          {...form.register("location")}
                          placeholder="City, State"
                          error={form.formState.errors.location?.message}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="industryType">Industry/Property Type</Label>
                      <Input
                        id="industryType"
                        {...form.register("industryType")}
                        placeholder="e.g., Restaurant, Retail, Office Building, etc."
                        error={form.formState.errors.industryType?.message}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <DollarSign className="w-5 h-5 mr-2" />
                      Financial Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="amount">Equity Injection Amount</Label>
                        <Input
                          id="amount"
                          type="number"
                          {...form.register("amount")}
                          placeholder="1000000"
                          error={form.formState.errors.amount?.message}
                        />
                        {amount && !validateTierAmount() && (
                          <p className="text-xs text-red-500 mt-1">
                            Amount must be within {selectedTier?.range} for {selectedTier?.label} tier
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="tier">Investment Tier</Label>
                        <Select 
                          value={form.watch("tier")} 
                          onValueChange={(value) => form.setValue("tier", value as any)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {tierOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label} ({option.range})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="expectedReturns">Expected Returns</Label>
                      <Textarea
                        id="expectedReturns"
                        {...form.register("expectedReturns")}
                        rows={3}
                        placeholder="Describe the expected returns for investors (e.g., repayment terms, equity stake, projected ROI, etc.)"
                        error={form.formState.errors.expectedReturns?.message}
                      />
                    </div>

                    <div>
                      <Label htmlFor="timeframe">Investment Timeframe</Label>
                      <Input
                        id="timeframe"
                        {...form.register("timeframe")}
                        placeholder="e.g., 3-5 years, 18 months, etc."
                        error={form.formState.errors.timeframe?.message}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Tier Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedTier && (
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold text-lg">{selectedTier.label}</h3>
                          <p className="text-sm text-slate-600">{selectedTier.range}</p>
                        </div>
                        
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="text-sm font-semibold text-primary mb-1">Listing Fee</div>
                          <div className="text-2xl font-bold text-slate-900">
                            ${selectedTier.fee.toLocaleString()}
                          </div>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center text-green-600">
                            <FileText className="w-4 h-4 mr-2" />
                            Secure document upload
                          </div>
                          <div className="flex items-center text-green-600">
                            <Building2 className="w-4 h-4 mr-2" />
                            Investor messaging
                          </div>
                          <div className="flex items-center text-green-600">
                            <Clock className="w-4 h-4 mr-2" />
                            {selectedTier.value === "starter" ? "30" : 
                             selectedTier.value === "growth" ? "45" :
                             selectedTier.value === "scale" ? "60" : "90"}-day listing
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Next Steps</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs mr-3">
                          1
                        </div>
                        Complete listing details
                      </div>
                      <div className="flex items-center text-slate-500">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs mr-3">
                          2
                        </div>
                        Upload LOI and termsheet
                      </div>
                      <div className="flex items-center text-slate-500">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs mr-3">
                          3
                        </div>
                        Pay listing fee to activate
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Document Upload
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DocumentUpload />
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            {step > 1 && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setStep(step - 1)}
              >
                Previous
              </Button>
            )}
            
            <div className="ml-auto">
              {step < 2 ? (
                <Button 
                  type="button" 
                  onClick={() => setStep(step + 1)}
                  disabled={!form.formState.isValid}
                >
                  Next: Upload Documents
                </Button>
              ) : (
                <Button 
                  type="submit"
                  disabled={createListingMutation.isPending}
                >
                  {createListingMutation.isPending ? "Creating..." : "Create Listing & Proceed to Payment"}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
