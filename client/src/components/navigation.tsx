import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Building2, User, LogOut, MessageSquare, Settings } from "lucide-react";

export default function Navigation() {
  const { user, logoutMutation } = useAuth();
  const [location, setLocation] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const isActivePage = (path: string) => {
    return location === path || location.startsWith(path + "/");
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 bg-financial-blue rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold text-slate-900">EquityConnect</span>
            </Link>
            
            {user && (
              <div className="hidden md:ml-8 md:flex md:space-x-8">
                <Link 
                  href="/browse" 
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    isActivePage("/browse") 
                      ? "text-financial-blue border-b-2 border-financial-blue" 
                      : "text-slate-700 hover:text-financial-blue"
                  }`}
                >
                  Browse Opportunities
                </Link>
                
                {user.role === "buyer" && (
                  <Link 
                    href="/create-listing" 
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      isActivePage("/create-listing") 
                        ? "text-financial-blue border-b-2 border-financial-blue" 
                        : "text-slate-700 hover:text-financial-blue"
                    }`}
                  >
                    Create Listing
                  </Link>
                )}
                
                <Link 
                  href="/messages" 
                  className={`px-3 py-2 text-sm font-medium transition-colors flex items-center ${
                    isActivePage("/messages") 
                      ? "text-financial-blue border-b-2 border-financial-blue" 
                      : "text-slate-700 hover:text-financial-blue"
                  }`}
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Messages
                </Link>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Badge variant="outline" className="hidden sm:flex">
                  {user.role === "buyer" ? "Buyer" : "Investor"}
                </Badge>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-financial-blue text-white">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user.firstName} {user.lastName}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setLocation("/dashboard")}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocation("/profile")}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/auth">
                  <Button variant="ghost" className="text-slate-700 hover:text-financial-blue">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button className="bg-financial-blue text-white hover:bg-blue-800">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
