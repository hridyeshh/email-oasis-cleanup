import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
import { gmailService } from '@/services/gmailService';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the authorization code from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (code) {
          // Exchange code for access token
          await gmailService.setCredentials(code);
          
          // Redirect back to home page
          navigate('/', { replace: true });
        } else {
          // No code found, redirect to home
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        // Redirect to home page on error
        navigate('/', { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
            Completing Authentication...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Please wait while we complete your Gmail authentication.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallback; 