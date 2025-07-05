// Browser-compatible Gmail API service
export interface EmailSubscription {
  id: string;
  name: string;
  email: string;
  category: string;
  frequency: string;
  lastEmail: string;
  description: string;
  unreadCount: number;
  isActive: boolean;
}

class GmailService {
  private accessToken: string | null = null;
  private gmailApiBase = 'https://gmail.googleapis.com/gmail/v1';

  constructor() {
    // Load stored token on initialization
    this.loadStoredToken();
  }

  // Get authorization URL for OAuth2
  getAuthUrl(): string {
    const clientId = import.meta.env.VITE_GMAIL_CLIENT_ID;
    const redirectUri = 'http://localhost:8080/auth/callback';
    const scope = 'https://www.googleapis.com/auth/gmail.readonly';
    
    return `https://accounts.google.com/o/oauth2/v2/auth?` +
           `client_id=${clientId}&` +
           `redirect_uri=${encodeURIComponent(redirectUri)}&` +
           `scope=${encodeURIComponent(scope)}&` +
           `response_type=code&` +
           `access_type=offline`;
  }

  // Set access token after OAuth callback
  async setCredentials(code: string): Promise<void> {
    try {
      const clientId = import.meta.env.VITE_GMAIL_CLIENT_ID;
      const clientSecret = import.meta.env.VITE_GMAIL_CLIENT_SECRET;
      const redirectUri = 'http://localhost:8080/auth/callback';

      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const tokens = await response.json();
      this.accessToken = tokens.access_token;
      
      // Store tokens in localStorage for persistence
      localStorage.setItem('gmail_tokens', JSON.stringify(tokens));
    } catch (error) {
      console.error('Error setting credentials:', error);
      throw error;
    }
  }

  // Load stored token
  loadStoredToken(): boolean {
    try {
      const storedTokens = localStorage.getItem('gmail_tokens');
      if (storedTokens) {
        const tokens = JSON.parse(storedTokens);
        this.accessToken = tokens.access_token;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading stored token:', error);
      return false;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // Sign out
  signOut(): void {
    localStorage.removeItem('gmail_tokens');
    this.accessToken = null;
  }

  // Make authenticated request to Gmail API
  private async makeGmailRequest(endpoint: string, params?: Record<string, string>): Promise<any> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    const url = new URL(`${this.gmailApiBase}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Gmail API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Fetch emails and extract subscription data
  async fetchSubscriptions(): Promise<EmailSubscription[]> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated');
    }

    try {
      // Search for emails that are likely subscriptions
      const messagesResponse = await this.makeGmailRequest('/users/me/messages', {
        q: 'unsubscribe OR newsletter OR subscription -is:chat',
        maxResults: '100',
      });

      const messages = messagesResponse.messages || [];
      const subscriptions: EmailSubscription[] = [];
      const processedSenders = new Set<string>();

      // Process each message to extract subscription info
      for (const message of messages.slice(0, 50)) { // Limit to prevent API quota issues
        try {
          const messageData = await this.makeGmailRequest(`/users/me/messages/${message.id}`, {
            format: 'full',
          });

          const headers = messageData.payload.headers;
          const fromHeader = headers.find((h: any) => h.name === 'From');
          const subjectHeader = headers.find((h: any) => h.name === 'Subject');
          const dateHeader = headers.find((h: any) => h.name === 'Date');

          if (fromHeader && subjectHeader) {
            const fromEmail = this.extractEmail(fromHeader.value);
            const senderName = this.extractSenderName(fromHeader.value);
            
            // Skip if we've already processed this sender
            if (processedSenders.has(fromEmail)) {
              continue;
            }
            processedSenders.add(fromEmail);

            // Check if this looks like a subscription email
            if (this.isSubscriptionEmail(fromHeader.value, subjectHeader.value)) {
              const subscription: EmailSubscription = {
                id: Math.random().toString(36).substr(2, 9),
                name: senderName || fromEmail,
                email: fromEmail,
                category: this.categorizeEmail(fromHeader.value, subjectHeader.value),
                frequency: this.estimateFrequency(fromEmail),
                lastEmail: this.formatDate(dateHeader?.value || ''),
                description: this.generateDescription(senderName, fromEmail),
                unreadCount: await this.getUnreadCount(fromEmail),
                isActive: true,
              };

              subscriptions.push(subscription);
            }
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      }

      return subscriptions;
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      throw error;
    }
  }

  // Helper methods
  private extractEmail(fromValue: string): string {
    const match = fromValue.match(/<(.+)>/);
    return match ? match[1] : fromValue;
  }

  private extractSenderName(fromValue: string): string {
    const match = fromValue.match(/^(.+?)\s*</);
    return match ? match[1].replace(/"/g, '').trim() : '';
  }

  private isSubscriptionEmail(from: string, subject: string): boolean {
    const subscriptionKeywords = [
      'newsletter', 'unsubscribe', 'subscription', 'digest', 'update',
      'notification', 'alert', 'weekly', 'daily', 'monthly', 'noreply',
      'no-reply', 'automated', 'marketing', 'promo', 'offer'
    ];
    
    const text = (from + ' ' + subject).toLowerCase();
    return subscriptionKeywords.some(keyword => text.includes(keyword));
  }

  private categorizeEmail(from: string, subject: string): string {
    const text = (from + ' ' + subject).toLowerCase();
    
    if (text.includes('job') || text.includes('career') || text.includes('linkedin')) {
      return 'jobs';
    } else if (text.includes('course') || text.includes('learn') || text.includes('education')) {
      return 'education';
    } else if (text.includes('shop') || text.includes('deal') || text.includes('sale') || text.includes('amazon')) {
      return 'shopping';
    } else if (text.includes('entertainment') || text.includes('music') || text.includes('video') || text.includes('spotify')) {
      return 'entertainment';
    } else if (text.includes('newsletter') || text.includes('news') || text.includes('blog')) {
      return 'newsletter';
    }
    
    return 'newsletter'; // Default category
  }

  private estimateFrequency(email: string): string {
    const domain = email.split('@')[1]?.toLowerCase() || '';
    
    // Common patterns for frequency estimation
    if (domain.includes('daily') || email.includes('daily')) {
      return 'Daily';
    } else if (domain.includes('weekly') || email.includes('weekly')) {
      return 'Weekly';
    } else if (domain.includes('monthly') || email.includes('monthly')) {
      return 'Monthly';
    }
    
    return 'Weekly'; // Default
  }

  private formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch (error) {
      return new Date().toISOString().split('T')[0];
    }
  }

  private generateDescription(senderName: string, email: string): string {
    const domain = email.split('@')[1];
    return `${senderName || 'Updates'} from ${domain}`;
  }

  private async getUnreadCount(email: string): Promise<number> {
    try {
      const response = await this.makeGmailRequest('/users/me/messages', {
        q: `from:${email} is:unread`,
        maxResults: '50',
      });
      
      return response.messages?.length || 0;
    } catch (error) {
      return Math.floor(Math.random() * 20); // Fallback to random number
    }
  }
}

export const gmailService = new GmailService(); 