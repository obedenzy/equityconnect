import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import ListingCard from "@/components/listing-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Building2, TrendingUp } from "lucide-react";

export default function BrowseOpportunities() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTier, setSelectedTier] = useState("");
  const [selectedMarketType, setSelectedMarketType] = useState("");

  const { data: listings, isLoading } = useQuery({
    queryKey: ["/api/listings", { tier: selectedTier, marketType: selectedMarketType }],
  });

  const filteredListings = listings?.filter((listing: any) => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Investment Opportunities</h1>
          <p className="text-slate-600">
            Browse active funding requests from qualified buyers seeking equity injections
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filter Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search opportunities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedTier} onValueChange={setSelectedTier}>
                <SelectTrigger>
                  <SelectValue placeholder="Investment Tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Tiers</SelectItem>
                  <SelectItem value="starter">Starter ($100K-$350K)</SelectItem>
                  <SelectItem value="growth">Growth ($350K-$1M)</SelectItem>
                  <SelectItem value="scale">Scale ($1M-$3M)</SelectItem>
                  <SelectItem value="enterprise">Enterprise ($3M-$25M)</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedMarketType} onValueChange={setSelectedMarketType}>
                <SelectTrigger>
                  <SelectValue placeholder="Market Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Markets</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="real_estate">Real Estate</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedTier("");
                  setSelectedMarketType("");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building2 className="h-8 w-8 text-primary mr-4" />
                <div>
                  <div className="text-sm font-medium text-slate-600">Active Listings</div>
                  <div className="text-2xl font-bold text-slate-900">
                    {filteredListings?.length || 0}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-500 mr-4" />
                <div>
                  <div className="text-sm font-medium text-slate-600">Total Investment Sought</div>
                  <div className="text-2xl font-bold text-slate-900">
                    ${filteredListings?.reduce((acc: number, listing: any) => acc + Number(listing.amount), 0).toLocaleString() || "0"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Filter className="h-8 w-8 text-blue-500 mr-4" />
                <div>
                  <div className="text-sm font-medium text-slate-600">Markets Available</div>
                  <div className="text-2xl font-bold text-slate-900">2</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Listings Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 bg-white rounded-lg shadow animate-pulse" />
            ))}
          </div>
        ) : filteredListings?.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Building2 className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No opportunities found</h3>
              <p className="text-slate-600 mb-4">
                Try adjusting your filters or check back later for new listings.
              </p>
              <Button variant="outline" onClick={() => {
                setSearchTerm("");
                setSelectedTier("");
                setSelectedMarketType("");
              }}>
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings?.map((listing: any) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

        {/* Call to Action */}
        {!isLoading && filteredListings?.length > 0 && (
          <div className="mt-12 text-center">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Don't see what you're looking for?
            </h3>
            <p className="text-slate-600 mb-4">
              Set up alerts for new opportunities that match your investment criteria.
            </p>
            <Button variant="outline">Set Up Investment Alerts</Button>
          </div>
        )}
      </div>
    </div>
  );
}
