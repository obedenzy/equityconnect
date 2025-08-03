import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  MessageSquare, 
  Download, 
  Video,
  Plus,
  Building2,
  TrendingUp,
  Eye,
  Edit
} from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: listings, isLoading: listingsLoading } = useQuery({
    queryKey: ["/api/listings/my"],
    enabled: user?.role === "buyer",
  });

  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ["/api/conversations"],
  });

  if (!user) return null;

  const isBuyer = user.role === "buyer";

  const stats = {
    activeListings: listings?.filter((l: any) => l.status === "active").length || 0,
    totalInquiries: conversations?.length || 0,
    docDownloads: 8, // Mock data
    videoCalls: 5, // Mock data
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, {user.firstName}
          </h1>
          <p className="text-slate-600">
            {isBuyer 
              ? "Manage your funding requests and investor communications" 
              : "Browse opportunities and manage your investment activities"
            }
          </p>
        </div>

        <Tabs defaultValue={isBuyer ? "buyer" : "investor"} className="space-y-8">
          <TabsList>
            {isBuyer && <TabsTrigger value="buyer">Buyer Dashboard</TabsTrigger>}
            {!isBuyer && <TabsTrigger value="investor">Investor Dashboard</TabsTrigger>}
          </TabsList>

          <TabsContent value="buyer" className="space-y-8">
            {/* Stats Grid */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FileText className="h-8 w-8 text-primary" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-slate-600">Active Listings</div>
                      <div className="text-2xl font-bold text-slate-900">{stats.activeListings}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <MessageSquare className="h-8 w-8 text-green-500" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-slate-600">Investor Inquiries</div>
                      <div className="text-2xl font-bold text-slate-900">{stats.totalInquiries}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Download className="h-8 w-8 text-yellow-500" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-slate-600">Doc Downloads</div>
                      <div className="text-2xl font-bold text-slate-900">{stats.docDownloads}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Video className="h-8 w-8 text-purple-500" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-slate-600">Video Calls</div>
                      <div className="text-2xl font-bold text-slate-900">{stats.videoCalls}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Listings */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Your Funding Requests</CardTitle>
                    <Link href="/create-listing">
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        New Listing
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {listingsLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-20 bg-slate-100 rounded animate-pulse" />
                      ))}
                    </div>
                  ) : listings?.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600">No listings yet</p>
                      <Link href="/create-listing">
                        <Button className="mt-4">Create Your First Listing</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {listings?.slice(0, 3).map((listing: any) => (
                        <div key={listing.id} className="bg-slate-50 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-slate-900">{listing.title}</h4>
                            <Badge variant={listing.status === "active" ? "default" : "secondary"}>
                              {listing.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-slate-600 mb-3">
                            <span className="font-medium">{listing.tier} Tier</span> • 
                            <span className="font-mono ml-1">${Number(listing.amount).toLocaleString()}</span> • 
                            <span className="ml-1">{listing.marketType}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-500">
                              {format(new Date(listing.createdAt), "MMM d, yyyy")}
                            </span>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                              <Button size="sm" variant="ghost">
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Messages */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Messages</CardTitle>
                    <Link href="/messages">
                      <Button size="sm" variant="outline">View All</Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {conversationsLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-16 bg-slate-100 rounded animate-pulse" />
                      ))}
                    </div>
                  ) : conversations?.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600">No messages yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {conversations?.slice(0, 3).map((conversation: any) => (
                        <div key={conversation.id} className="bg-slate-50 rounded-lg p-4">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center">
                                <span className="text-white font-medium text-sm">
                                  {conversation.investor?.firstName?.[0] || "I"}
                                </span>
                              </div>
                            </div>
                            <div className="ml-3 flex-1">
                              <div className="flex justify-between items-center">
                                <h4 className="text-sm font-semibold text-slate-900">
                                  Investor Inquiry
                                </h4>
                                <span className="text-xs text-slate-500">
                                  {format(new Date(conversation.lastMessageAt), "MMM d")}
                                </span>
                              </div>
                              <p className="text-sm text-slate-600 mt-1">
                                New message about your listing...
                              </p>
                              <div className="flex space-x-3 mt-2">
                                <Button size="sm" variant="ghost">Reply</Button>
                                <Button size="sm" variant="ghost">
                                  <Video className="w-4 h-4 mr-1" />
                                  Schedule Call
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="investor" className="space-y-8">
            {/* Investor Dashboard */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-green-500 mr-4" />
                    <div>
                      <div className="text-sm font-medium text-slate-600">Opportunities Viewed</div>
                      <div className="text-2xl font-bold text-slate-900">24</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <MessageSquare className="h-8 w-8 text-blue-500 mr-4" />
                    <div>
                      <div className="text-sm font-medium text-slate-600">Active Conversations</div>
                      <div className="text-2xl font-bold text-slate-900">{stats.totalInquiries}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Building2 className="h-8 w-8 text-purple-500 mr-4" />
                    <div>
                      <div className="text-sm font-medium text-slate-600">Documents Accessed</div>
                      <div className="text-2xl font-bold text-slate-900">12</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Ready to find investment opportunities?</h3>
              <Link href="/browse">
                <Button size="lg">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Browse Opportunities
                </Button>
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
