import { useState, useEffect } from "react";
import { Mail, Search, Filter, Settings, User, ChevronDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import SubscriptionCard from "@/components/SubscriptionCard";
import CategoryFilter from "@/components/CategoryFilter";
import StatsOverview from "@/components/StatsOverview";
import GmailAuth from "@/components/GmailAuth";
import { gmailService, EmailSubscription } from "@/services/gmailService";

// Mock subscription data as fallback
const mockSubscriptions: EmailSubscription[] = [
  {
    id: "1",
    name: "Medium Daily Digest",
    email: "noreply@medium.com",
    category: "newsletter",
    frequency: "Daily",
    lastEmail: "2024-01-05",
    description: "Daily curated stories from Medium writers",
    unreadCount: 12,
    isActive: true
  },
  {
    id: "2",
    name: "LinkedIn Job Alerts",
    email: "jobs-noreply@linkedin.com",
    category: "jobs",
    frequency: "Weekly",
    lastEmail: "2024-01-04",
    description: "Personalized job recommendations",
    unreadCount: 3,
    isActive: true
  },
  {
    id: "3",
    name: "Coursera Course Updates",
    email: "no-reply@coursera.org",
    category: "education",
    frequency: "Weekly",
    lastEmail: "2024-01-03",
    description: "Updates on your enrolled courses",
    unreadCount: 5,
    isActive: true
  },
  {
    id: "4",
    name: "Amazon Deals",
    email: "store-news@amazon.com",
    category: "shopping",
    frequency: "Daily",
    lastEmail: "2024-01-05",
    description: "Daily deals and recommendations",
    unreadCount: 25,
    isActive: true
  },
  {
    id: "5",
    name: "TechCrunch Newsletter",
    email: "newsletter@techcrunch.com",
    category: "newsletter",
    frequency: "Daily",
    lastEmail: "2024-01-05",
    description: "Latest tech news and startup updates",
    unreadCount: 8,
    isActive: true
  },
  {
    id: "6",
    name: "Spotify Weekly Recap",
    email: "no-reply@spotify.com",
    category: "entertainment",
    frequency: "Weekly",
    lastEmail: "2024-01-01",
    description: "Your weekly music statistics",
    unreadCount: 1,
    isActive: false
  }
];

const Index = () => {
  const [subscriptions, setSubscriptions] = useState<EmailSubscription[]>([]);
  const [isGmailAuthenticated, setIsGmailAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [usingMockData, setUsingMockData] = useState(false);

  // Load initial data
  useEffect(() => {
    if (isGmailAuthenticated) {
      loadGmailSubscriptions();
    } else {
      // Load mock data as fallback
      setSubscriptions(mockSubscriptions);
      setUsingMockData(true);
    }
  }, [isGmailAuthenticated]);

  const loadGmailSubscriptions = async () => {
    if (!isGmailAuthenticated) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const gmailSubscriptions = await gmailService.fetchSubscriptions();
      setSubscriptions(gmailSubscriptions);
      setUsingMockData(false);
    } catch (error) {
      console.error('Failed to load Gmail subscriptions:', error);
      setError('Failed to load Gmail subscriptions. Please try again.');
      // Fallback to mock data
      setSubscriptions(mockSubscriptions);
      setUsingMockData(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthChange = (authenticated: boolean) => {
    setIsGmailAuthenticated(authenticated);
  };

  const handleRefresh = () => {
    if (isGmailAuthenticated) {
      loadGmailSubscriptions();
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesCategory = selectedCategory === "all" || sub.category === selectedCategory;
    const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleUnsubscribe = (id: string) => {
    setSubscriptions(prev => prev.map(sub => 
      sub.id === id ? { ...sub, isActive: false } : sub
    ));
  };

  const handleResubscribe = (id: string) => {
    setSubscriptions(prev => prev.map(sub => 
      sub.id === id ? { ...sub, isActive: true } : sub
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-8 w-8 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">Email Oasis</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {isGmailAuthenticated && (
                <Button onClick={handleRefresh} variant="ghost" size="sm" disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  {isLoading ? 'Loading...' : 'Refresh'}
                </Button>
              )}
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="ghost" size="sm">
                <User className="h-4 w-4 mr-2" />
                Account
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Gmail Authentication */}
        <GmailAuth onAuthChange={handleAuthChange} />

        {/* Data Source Alert */}
        {usingMockData && (
          <Alert className="mb-6">
            <AlertDescription>
              Currently showing sample data. Connect your Gmail account above to see your actual email subscriptions.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Overview */}
        <StatsOverview subscriptions={subscriptions} />

        {/* Search and Filter Bar */}
        <div className="mb-8">
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search subscriptions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/50"
                  />
                </div>
                <CategoryFilter 
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  subscriptions={subscriptions}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscriptions Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Your Subscriptions
              <Badge variant="secondary" className="ml-2">
                {filteredSubscriptions.length}
              </Badge>
            </h2>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Bulk Actions
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {isLoading ? (
            <Card className="bg-white/70 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <RefreshCw className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Loading your subscriptions...</h3>
                <p className="text-gray-500">This may take a moment while we analyze your emails.</p>
              </CardContent>
            </Card>
          ) : filteredSubscriptions.length === 0 ? (
            <Card className="bg-white/70 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No subscriptions found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredSubscriptions.map((subscription) => (
                <SubscriptionCard
                  key={subscription.id}
                  subscription={subscription}
                  onUnsubscribe={handleUnsubscribe}
                  onResubscribe={handleResubscribe}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
