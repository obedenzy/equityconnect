
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, TrendingUp } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(["buyer", "investor"]),
  company: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  // Investor-specific fields
  preferredReturnType: z.enum(["repayment", "equity", "both"]).optional(),
  investmentFocus: z.array(z.enum(["sba_loan", "non_sba_acquisition", "real_estate"])).optional(),
  preferredIndustry: z.array(z.enum(["retail", "franchise", "manufacturing", "healthcare", "technology", "services", "commercial", "multi_family", "industrial", "hospitality"])).optional(),
  preferredLocation: z.string().optional(),
  preferredInvestmentRange: z.enum(["5k-350k", "350k-1M", "1M-3M", "3M-5M", "5M-10M", "10M-25M", "above-25M"]).optional(),
});

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("login");

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      role: "buyer",
      company: "",
      phone: "",
      bio: "",
      preferredReturnType: "both",
      investmentFocus: [],
      preferredIndustry: [],
      preferredLocation: "",
      preferredInvestmentRange: "5k-350k",
    },
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  const handleLogin = async (data: LoginData) => {
    loginMutation.mutate(data);
  };

  const handleRegister = async (data: RegisterData) => {
    // Convert arrays to proper format for database
    const formattedData = {
      ...data,
      investmentFocus: data.investmentFocus || [],
      preferredIndustry: data.preferredIndustry || [],
    };
    registerMutation.mutate(formattedData);
  };

  if (user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
      {/* Left Column - Forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <span className="ml-2 text-2xl font-bold text-slate-900">EquityConnect</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome Back</h1>
            <p className="text-slate-600">Sign in to your account or create a new one</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Sign In</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        {...loginForm.register("email")}
                      />
                      {loginForm.formState.errors.email && (
                        <p className="text-sm text-red-500 mt-1">{loginForm.formState.errors.email.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        {...loginForm.register("password")}
                      />
                      {loginForm.formState.errors.password && (
                        <p className="text-sm text-red-500 mt-1">{loginForm.formState.errors.password.message}</p>
                      )}
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Signing In..." : "Sign In"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Create Account</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Select 
                        value={registerForm.watch("role")} 
                        onValueChange={(value) => registerForm.setValue("role", value as "buyer" | "investor")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="buyer">Buyer (Seeking Investment)</SelectItem>
                          <SelectItem value="investor">Investor (Providing Funds)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          {...registerForm.register("firstName")}
                        />
                        {registerForm.formState.errors.firstName && (
                          <p className="text-sm text-red-500 mt-1">{registerForm.formState.errors.firstName.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          {...registerForm.register("lastName")}
                        />
                        {registerForm.formState.errors.lastName && (
                          <p className="text-sm text-red-500 mt-1">{registerForm.formState.errors.lastName.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        {...registerForm.register("email")}
                      />
                      {registerForm.formState.errors.email && (
                        <p className="text-sm text-red-500 mt-1">{registerForm.formState.errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        {...registerForm.register("password")}
                      />
                      {registerForm.formState.errors.password && (
                        <p className="text-sm text-red-500 mt-1">{registerForm.formState.errors.password.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="company">Company (Optional)</Label>
                      <Input
                        id="company"
                        {...registerForm.register("company")}
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone (Optional)</Label>
                      <Input
                        id="phone"
                        {...registerForm.register("phone")}
                      />
                    </div>

                    {registerForm.watch("role") === "investor" && (
                      <>
                        {/* Investment Focus */}
                        <div>
                          <Label>Investment Focus</Label>
                          <div className="space-y-2 mt-2">
                            {[
                              { value: "sba_loan" as const, label: "SBA Loan" },
                              { value: "non_sba_acquisition" as const, label: "Non-SBA Acquisition" },
                              { value: "real_estate" as const, label: "Real Estate" }
                            ].map((option) => (
                              <div key={option.value} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`investmentFocus-${option.value}`}
                                  checked={(registerForm.watch("investmentFocus") || []).includes(option.value)}
                                  onCheckedChange={(checked) => {
                                    const current = registerForm.watch("investmentFocus") || [];
                                    if (checked) {
                                      registerForm.setValue("investmentFocus", [...current, option.value]);
                                    } else {
                                      registerForm.setValue("investmentFocus", current.filter(v => v !== option.value));
                                    }
                                  }}
                                />
                                <Label htmlFor={`investmentFocus-${option.value}`} className="text-sm font-normal">
                                  {option.label}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Preferred Industry */}
                        <div>
                          <Label>Preferred Industry</Label>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            {[
                              { value: "retail" as const, label: "Retail" },
                              { value: "franchise" as const, label: "Franchise" },
                              { value: "manufacturing" as const, label: "Manufacturing" },
                              { value: "healthcare" as const, label: "Healthcare" },
                              { value: "technology" as const, label: "Technology" },
                              { value: "services" as const, label: "Services" },
                              { value: "commercial" as const, label: "Commercial" },
                              { value: "multi_family" as const, label: "Multi-Family" },
                              { value: "industrial" as const, label: "Industrial" },
                              { value: "hospitality" as const, label: "Hospitality" }
                            ].map((option) => (
                              <div key={option.value} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`preferredIndustry-${option.value}`}
                                  checked={(registerForm.watch("preferredIndustry") || []).includes(option.value)}
                                  onCheckedChange={(checked) => {
                                    const current = registerForm.watch("preferredIndustry") || [];
                                    if (checked) {
                                      registerForm.setValue("preferredIndustry", [...current, option.value]);
                                    } else {
                                      registerForm.setValue("preferredIndustry", current.filter(v => v !== option.value));
                                    }
                                  }}
                                />
                                <Label htmlFor={`preferredIndustry-${option.value}`} className="text-sm font-normal">
                                  {option.label}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Preferred Location */}
                        <div>
                          <Label htmlFor="preferredLocation">Preferred Location</Label>
                          <Input
                            id="preferredLocation"
                            {...registerForm.register("preferredLocation")}
                            placeholder="e.g., California, New York, Texas"
                          />
                        </div>

                        {/* Investment Range */}
                        <div>
                          <Label htmlFor="preferredInvestmentRange">Investment Range</Label>
                          <Select 
                            value={registerForm.watch("preferredInvestmentRange")} 
                            onValueChange={(value) => registerForm.setValue("preferredInvestmentRange", value as any)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select investment range" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5k-350k">$5k - $350k</SelectItem>
                              <SelectItem value="350k-1M">$350k - $1M</SelectItem>
                              <SelectItem value="1M-3M">$1M - $3M</SelectItem>
                              <SelectItem value="3M-5M">$3M - $5M</SelectItem>
                              <SelectItem value="5M-10M">$5M - $10M</SelectItem>
                              <SelectItem value="10M-25M">$10M - $25M</SelectItem>
                              <SelectItem value="above-25M">Above $25M</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Investment Preference */}
                        <div>
                          <Label htmlFor="preferredReturnType">Investment Preference</Label>
                          <Select 
                            value={registerForm.watch("preferredReturnType")} 
                            onValueChange={(value) => registerForm.setValue("preferredReturnType", value as "repayment" | "equity" | "both")}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select investment preference" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="repayment">Repayment</SelectItem>
                              <SelectItem value="equity">Equity</SelectItem>
                              <SelectItem value="both">Both</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}

                    <div>
                      <Label htmlFor="bio">Bio (Optional)</Label>
                      <Textarea
                        id="bio"
                        {...registerForm.register("bio")}
                        placeholder="Tell us about yourself and your experience..."
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right Column - Hero */}
      <div className="flex-1 bg-primary text-white p-8 flex items-center justify-center">
        <div className="max-w-md text-center">
          <TrendingUp className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Connect & Invest</h2>
          <p className="text-blue-100 mb-6">
            Join thousands of buyers and investors who trust EquityConnect for their 
            equity injection needs. Secure, professional, and efficient.
          </p>
          <div className="bg-blue-800 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Platform Features</h3>
            <ul className="text-sm text-blue-100 space-y-1">
              <li>• Secure document management</li>
              <li>• Professional messaging system</li>
              <li>• Video call integration</li>
              <li>• Tiered investment matching</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
