import { config } from './config';

export interface BreakingNewsResponse {
  success: boolean;
  data: string[];
  source: 'cache' | 'newsapi' | 'newsdata' | 'fallback';
  message?: string;
}

class BreakingNewsService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.api.baseUrl;
  }

  async getBreakingNews(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/breaking-news`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: BreakingNewsResponse = await response.json();
      
      if (data.success && data.data) {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to fetch breaking news');
      }
    } catch (error) {
      console.error('Breaking news fetch error:', error);
      // Return fallback news on error
      return this.getFallbackNews();
    }
  }

  private getFallbackNews(): string[] {
    return [
      "Trump promised 200 trade deals. He's made 3",
      "Trump threatens 50% tariffs on Brazil if it doesn't stop the Bolsonaro 'witch hunt' trial",
      "Bessent outlines final tariff warning as trade deadline nears",
      "Trump wants to talk business with Africa in hopes of countering China. But a US summit excluded big players",
      "Moscow ramps up attacks with fiery explosions seen in Kyiv. At least two are dead and more than a dozen wounded.",
    ];
  }
}

export const breakingNewsService = new BreakingNewsService(); 