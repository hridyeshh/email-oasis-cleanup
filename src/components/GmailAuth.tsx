import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, LogOut, AlertCircle } from 'lucide-react';
import { gmailService } from '@/services/gmailService';

interface GmailAuthProps {
  onAuthChange: (isAuthenticated: boolean) => void;
}

const GmailAuth = ({ onAuthChange }: GmailAuthProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = () => {
      const hasStoredToken = gmailService.loadStoredToken();
      const authenticated = hasStoredToken && gmailService.isAuthenticated();
      setIsAuthenticated(authenticated);
      onAuthChange(authenticated);
    };

    checkAuth();

    // Note: OAuth callback is now handled by the AuthCallback page component
  }, [onAuthChange]);

  const handleLogin = () => {
    setError(null);
    setIsLoading(true);
    
    try {
      const authUrl = gmailService.getAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      setError('Failed to initiate Gmail authentication. Please check your configuration.');
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    gmailService.signOut();
    setIsAuthenticated(false);
    onAuthChange(false);
  };

  if (isAuthenticated) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-green-600" />
            Gmail Connected
          </CardTitle>
          <CardDescription>
            Your Gmail account is connected and ready to analyze your subscriptions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Disconnect Gmail
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-blue-600" />
          Connect Your Gmail
        </CardTitle>
        <CardDescription>
          Connect your Gmail account to analyze your email subscriptions and manage them efficiently.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            This will allow Email Oasis to:
          </p>
          <ul className="text-sm text-gray-600 space-y-1 ml-4">
            <li>• Read your email headers to identify subscriptions</li>
            <li>• Count unread emails from each sender</li>
            <li>• Categorize your subscriptions automatically</li>
          </ul>
        </div>
        
        <Button onClick={handleLogin} disabled={isLoading} className="w-full">
          {isLoading ? 'Connecting...' : 'Connect Gmail Account'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default GmailAuth; 