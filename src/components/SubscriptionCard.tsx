
import { Mail, Calendar, TrendingUp, UserX, UserCheck, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Subscription {
  id: number;
  name: string;
  email: string;
  category: string;
  frequency: string;
  lastEmail: string;
  description: string;
  unreadCount: number;
  isActive: boolean;
}

interface SubscriptionCardProps {
  subscription: Subscription;
  onUnsubscribe: (id: number) => void;
  onResubscribe: (id: number) => void;
}

const categoryColors = {
  newsletter: "bg-blue-100 text-blue-800",
  jobs: "bg-green-100 text-green-800",
  education: "bg-purple-100 text-purple-800",
  shopping: "bg-orange-100 text-orange-800",
  entertainment: "bg-pink-100 text-pink-800",
  default: "bg-gray-100 text-gray-800"
};

const SubscriptionCard = ({ subscription, onUnsubscribe, onResubscribe }: SubscriptionCardProps) => {
  const categoryColor = categoryColors[subscription.category as keyof typeof categoryColors] || categoryColors.default;

  return (
    <Card className={`bg-white/70 backdrop-blur-sm hover:bg-white/90 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${!subscription.isActive ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{subscription.name}</h3>
            <p className="text-sm text-gray-500">{subscription.email}</p>
          </div>
          <Badge className={categoryColor} variant="secondary">
            {subscription.category}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">{subscription.description}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{subscription.frequency}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Mail className="h-4 w-4" />
            <span>{subscription.unreadCount} unread</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <TrendingUp className="h-4 w-4" />
            <span>Last: {subscription.lastEmail}</span>
          </div>
        </div>
        
        <div className="flex gap-2 pt-2">
          {subscription.isActive ? (
            <Button 
              variant="destructive" 
              size="sm" 
              className="flex-1"
              onClick={() => onUnsubscribe(subscription.id)}
            >
              <UserX className="h-4 w-4 mr-1" />
              Unsubscribe
            </Button>
          ) : (
            <Button 
              variant="default" 
              size="sm" 
              className="flex-1"
              onClick={() => onResubscribe(subscription.id)}
            >
              <UserCheck className="h-4 w-4 mr-1" />
              Resubscribe
            </Button>
          )}
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionCard;
