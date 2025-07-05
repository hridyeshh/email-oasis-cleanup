
import { Mail, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmailSubscription } from "@/services/gmailService";

interface StatsOverviewProps {
  subscriptions: EmailSubscription[];
}

const StatsOverview = ({ subscriptions }: StatsOverviewProps) => {
  const totalSubscriptions = subscriptions.length;
  const activeSubscriptions = subscriptions.filter(sub => sub.isActive).length;
  const totalUnread = subscriptions.reduce((sum, sub) => sum + sub.unreadCount, 0);
  const dailySubscriptions = subscriptions.filter(sub => sub.frequency === "Daily").length;

  const stats = [
    {
      title: "Total Subscriptions",
      value: totalSubscriptions,
      icon: Mail,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Active",
      value: activeSubscriptions,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Unread Emails",
      value: totalUnread,
      icon: AlertCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Daily Frequency",
      value: dailySubscriptions,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-white/70 backdrop-blur-sm hover:bg-white/90 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-full ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsOverview;
