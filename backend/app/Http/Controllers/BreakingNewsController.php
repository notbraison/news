<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class BreakingNewsController extends Controller
{
    private const CACHE_DURATION = 3600; // 1 hour
    private const MAX_REQUESTS_PER_DAY = 100;
    private const EAST_AFRICA_QUERY = 'east africa OR kenya OR uganda OR tanzania OR ethiopia OR rwanda OR burundi OR south sudan OR somalia OR eritrea OR djibouti';

        public function getBreakingNews(): JsonResponse
    {
        try {
            // Check if manual mode is enabled
            $useManualNews = Cache::get('breaking_news_manual_mode', false);
            if ($useManualNews) {
                $manualNews = Cache::get('breaking_news_manual', []);
                if (!empty($manualNews)) {
                    return response()->json([
                        'success' => true,
                        'data' => $manualNews,
                        'source' => 'manual'
                    ]);
                }
            }

            // Check cache first
            $cachedNews = Cache::get('breaking_news');
            if ($cachedNews) {
                return response()->json([
                    'success' => true,
                    'data' => $cachedNews,
                    'source' => 'cache'
                ]);
            }

            // Check request limits
            $today = now()->format('Y-m-d');
            $requestCount = Cache::get("news_api_requests_{$today}", 0);

            if ($requestCount >= self::MAX_REQUESTS_PER_DAY) {
                // Return cached data or fallback
                $fallbackNews = Cache::get('breaking_news_fallback', $this->getFallbackNews());
                return response()->json([
                    'success' => true,
                    'data' => $fallbackNews,
                    'source' => 'fallback',
                    'message' => 'Daily request limit reached'
                ]);
            }

            // Try NewsAPI first (if enabled)
            $useNewsAPI = Cache::get('breaking_news_use_newsapi', true);
            $newsApiKey = config('services.newsapi.key');
            if ($useNewsAPI && $newsApiKey) {
                $newsApiResponse = $this->fetchFromNewsAPI($newsApiKey);
                if ($newsApiResponse) {
                    $this->incrementRequestCount($today);
                    $this->cacheNews($newsApiResponse);
                    return response()->json([
                        'success' => true,
                        'data' => $newsApiResponse,
                        'source' => 'newsapi'
                    ]);
                }
            }

            // Try NewsData.io as fallback (if enabled)
            $useNewsData = Cache::get('breaking_news_use_newsdata', true);
            $newsDataKey = config('services.newsdata.key');
            if ($useNewsData && $newsDataKey) {
                $newsDataResponse = $this->fetchFromNewsData($newsDataKey);
                if ($newsDataResponse) {
                    $this->cacheNews($newsDataResponse);
                    return response()->json([
                        'success' => true,
                        'data' => $newsDataResponse,
                        'source' => 'newsdata'
                    ]);
                }
            }

            // Return fallback news
            $fallbackNews = $this->getFallbackNews();
            $this->cacheNews($fallbackNews);

            return response()->json([
                'success' => true,
                'data' => $fallbackNews,
                'source' => 'fallback'
            ]);

                } catch (\Exception $e) {
            Log::error('Breaking news fetch error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch breaking news',
                'data' => $this->getFallbackNews()
            ], 500);
        }
    }

    public function getSettings(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'use_manual_news' => Cache::get('breaking_news_manual_mode', false),
                'manual_news' => Cache::get('breaking_news_manual', []),
                'use_newsapi' => Cache::get('breaking_news_use_newsapi', true),
                'use_newsdata' => Cache::get('breaking_news_use_newsdata', true),
            ]
        ]);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $request->validate([
            'use_manual_news' => 'boolean',
            'manual_news' => 'array',
            'manual_news.*' => 'string|max:500',
            'use_newsapi' => 'boolean',
            'use_newsdata' => 'boolean',
        ]);

        Cache::put('breaking_news_manual_mode', $request->use_manual_news, now()->addDays(30));
        Cache::put('breaking_news_manual', $request->manual_news, now()->addDays(30));
        Cache::put('breaking_news_use_newsapi', $request->use_newsapi, now()->addDays(30));
        Cache::put('breaking_news_use_newsdata', $request->use_newsdata, now()->addDays(30));

        // Clear breaking news cache to force refresh
        Cache::forget('breaking_news');

        return response()->json([
            'success' => true,
            'message' => 'Breaking news settings updated successfully'
        ]);
    }

    private function fetchFromNewsAPI(string $apiKey): ?array
    {
        try {
            $response = Http::timeout(10)->get('https://newsapi.org/v2/top-headlines', [
                'language' => 'en',
                'pageSize' => 5,
                'q' => self::EAST_AFRICA_QUERY,
                'apiKey' => $apiKey
            ]);

            if ($response->successful()) {
                $data = $response->json();
                if (isset($data['articles']) && is_array($data['articles'])) {
                    return array_map(function ($article) {
                        return $this->cleanHeadline($article['title'] ?? '');
                    }, array_filter($data['articles'], function ($article) {
                        return !empty($article['title']);
                    }));
                }
            }
        } catch (\Exception $e) {
            Log::error('NewsAPI error: ' . $e->getMessage());
        }

        return null;
    }

    private function fetchFromNewsData(string $apiKey): ?array
    {
        try {
            $response = Http::timeout(10)->get('https://newsdata.io/api/1/news', [
                'language' => 'en',
                'category' => 'top',
                'q' => self::EAST_AFRICA_QUERY,
                'apikey' => $apiKey
            ]);

            if ($response->successful()) {
                $data = $response->json();
                if (isset($data['results']) && is_array($data['results'])) {
                    return array_map(function ($article) {
                        return $this->cleanHeadline($article['title'] ?? '');
                    }, array_filter($data['results'], function ($article) {
                        return !empty($article['title']);
                    }));
                }
            }
        } catch (\Exception $e) {
            Log::error('NewsData error: ' . $e->getMessage());
        }

        return null;
    }

    private function cleanHeadline(string $text): string
    {
        // Remove text in parentheses or square brackets
        $cleaned = preg_replace('/\s*\[[^\]]*\]|\s*\([^\)]*\)/', '', $text);
        // Remove trailing source after ' - ' or ' | '
        $cleaned = preg_replace('/\s*[-|]\s*[^-\|]+$/', '', $cleaned);
        return trim($cleaned);
    }

    private function getFallbackNews(): array
    {
        return [
            "Trump promised 200 trade deals. He's made 3",
            "Trump threatens 50% tariffs on Brazil if it doesn't stop the Bolsonaro 'witch hunt' trial",
            "Bessent outlines final tariff warning as trade deadline nears",
            "Trump wants to talk business with Africa in hopes of countering China. But a US summit excluded big players",
            "Moscow ramps up attacks with fiery explosions seen in Kyiv. At least two are dead and more than a dozen wounded.",
        ];
    }

    private function incrementRequestCount(string $date): void
    {
        $key = "news_api_requests_{$date}";
        $count = Cache::get($key, 0);
        Cache::put($key, $count + 1, now()->addDays(1));
    }

    private function cacheNews(array $news): void
    {
        Cache::put('breaking_news', $news, self::CACHE_DURATION);
        Cache::put('breaking_news_fallback', $news, now()->addDays(1));
    }
}
