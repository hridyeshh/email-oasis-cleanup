
import { Button } from "@/components/ui/button";
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

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  subscriptions: Subscription[];
}

const categories = [
  { id: "all", label: "All", icon: "📧" },
  { id: "newsletter", label: "Newsletters", icon: "📰" },
  { id: "jobs", label: "Jobs", icon: "💼" },
  { id: "education", label: "Education", icon: "🎓" },
  { id: "shopping", label: "Shopping", icon: "🛒" },
  { id: "entertainment", label: "Entertainment", icon: "🎬" }
];

const CategoryFilter = ({ selectedCategory, onCategoryChange, subscriptions }: CategoryFilterProps) => {
  const getCategoryCount = (categoryId: string) => {
    if (categoryId === "all") return subscriptions.length;
    return subscriptions.filter(sub => sub.category === categoryId).length;
  };

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => {
        const count = getCategoryCount(category.id);
        const isSelected = selectedCategory === category.id;
        
        return (
          <Button
            key={category.id}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange(category.id)}
            className={`flex items-center gap-2 ${isSelected ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-blue-50'}`}
          >
            <span>{category.icon}</span>
            <span>{category.label}</span>
            <Badge 
              variant={isSelected ? "secondary" : "outline"} 
              className={`ml-1 ${isSelected ? 'bg-blue-100 text-blue-800' : ''}`}
            >
              {count}
            </Badge>
          </Button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
