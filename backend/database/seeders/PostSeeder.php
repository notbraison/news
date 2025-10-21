<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Post;
use App\Models\User;
use App\Models\Category;
use App\Models\Tag;

class PostSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if posts already exist
        if (Post::count() > 0) {
            $this->command->info('Posts already exist. Skipping post seeding.');
            return;
        }

        // Get existing users, categories, and tags
        $users = User::all();
        $categories = Category::all();
        $tags = Tag::all();

        if ($users->isEmpty() || $categories->isEmpty()) {
            $this->command->warn('Users or Categories not found. Please run UserSeeder and CategorySeeder first.');
            return;
        }

        $posts = [
            [
                'title' => 'Breaking: Major Policy Reform Announced',
                'body' => 'The government has announced a comprehensive policy reform that will affect millions of citizens across the country. This landmark decision comes after months of consultation with stakeholders and experts in various fields.',
                'status' => 'published',
                'published_at' => now()->subDays(2),
                'user_id' => $users->first()->id,
                'categories' => $categories->whereIn('name', ['Politics', 'Policy'])->pluck('id')->toArray(),
                'tags' => $tags->whereIn('name', ['breaking', 'policy', 'reform', 'government'])->pluck('id')->toArray(),
            ],
            [
                'title' => 'Tech Startup Raises $10M in Series A Funding',
                'body' => 'A local technology startup has successfully raised $10 million in Series A funding, marking a significant milestone for the country\'s growing tech ecosystem. The company plans to expand its operations and hire more local talent.',
                'status' => 'published',
                'published_at' => now()->subDays(1),
                'user_id' => $users->first()->id,
                'categories' => $categories->whereIn('name', ['Technology', 'Business'])->pluck('id')->toArray(),
                'tags' => $tags->whereIn('name', ['technology', 'startup', 'investment', 'business'])->pluck('id')->toArray(),
            ],
            [
                'title' => 'New Education Initiative Launched',
                'body' => 'The Ministry of Education has launched a new initiative aimed at improving digital literacy among students. The program will provide tablets and internet access to schools in rural areas.',
                'status' => 'published',
                'published_at' => now()->subHours(6),
                'user_id' => $users->first()->id,
                'categories' => $categories->whereIn('name', ['Education'])->pluck('id')->toArray(),
                'tags' => $tags->whereIn('name', ['education', 'technology', 'school', 'digital'])->pluck('id')->toArray(),
            ],
            [
                'title' => 'Sports: National Team Qualifies for International Tournament',
                'body' => 'The national football team has qualified for the upcoming international tournament after a thrilling victory in the final qualifying match. Fans across the country are celebrating this historic achievement.',
                'status' => 'published',
                'published_at' => now()->subHours(12),
                'user_id' => $users->first()->id,
                'categories' => $categories->whereIn('name', ['Sports'])->pluck('id')->toArray(),
                'tags' => $tags->whereIn('name', ['sport', 'football', 'tournament', 'national'])->pluck('id')->toArray(),
            ],
            [
                'title' => 'Environmental Conservation Project Announced',
                'body' => 'A major environmental conservation project has been announced to protect endangered wildlife in the region. The initiative involves collaboration between government agencies and international conservation organizations.',
                'status' => 'published',
                'published_at' => now()->subHours(18),
                'user_id' => $users->first()->id,
                'categories' => $categories->whereIn('name', ['Environment'])->pluck('id')->toArray(),
                'tags' => $tags->whereIn('name', ['environment', 'wildlife', 'conservation', 'government'])->pluck('id')->toArray(),
            ],
            [
                'title' => 'Healthcare System Improvements Announced',
                'body' => 'The Ministry of Health has announced significant improvements to the healthcare system, including new hospitals and medical equipment. These changes aim to provide better healthcare access for all citizens.',
                'status' => 'published',
                'published_at' => now()->subHours(24),
                'user_id' => $users->first()->id,
                'categories' => $categories->whereIn('name', ['Health'])->pluck('id')->toArray(),
                'tags' => $tags->whereIn('name', ['health', 'hospital', 'medicine', 'government'])->pluck('id')->toArray(),
            ],
            [
                'title' => 'Economic Growth Report Shows Positive Trends',
                'body' => 'The latest economic growth report indicates positive trends in key sectors including agriculture, manufacturing, and services. Experts predict continued growth in the coming quarters.',
                'status' => 'published',
                'published_at' => now()->subDays(3),
                'user_id' => $users->first()->id,
                'categories' => $categories->whereIn('name', ['Economy'])->pluck('id')->toArray(),
                'tags' => $tags->whereIn('name', ['economy', 'business', 'growth', 'analysis'])->pluck('id')->toArray(),
            ],
            [
                'title' => 'Infrastructure Development Project Completed',
                'body' => 'A major infrastructure development project has been completed, connecting several rural communities to the national grid and improving transportation networks.',
                'status' => 'published',
                'published_at' => now()->subDays(4),
                'user_id' => $users->first()->id,
                'categories' => $categories->whereIn('name', ['Infrastructure'])->pluck('id')->toArray(),
                'tags' => $tags->whereIn('name', ['infrastructure', 'development', 'transport', 'government'])->pluck('id')->toArray(),
            ],
        ];

        foreach ($posts as $postData) {
            $categories = $postData['categories'];
            $tags = $postData['tags'];

            // Remove arrays from post data
            unset($postData['categories'], $postData['tags']);

            // Use firstOrCreate to prevent duplicates
            $post = Post::firstOrCreate(
                ['title' => $postData['title']], // Check by title
                $postData
            );

            // Attach categories and tags only if post was just created
            if ($post->wasRecentlyCreated) {
                if (!empty($categories)) {
                    $post->categories()->attach($categories);
                }
                if (!empty($tags)) {
                    $post->tags()->attach($tags);
                }
            }
        }

        $this->command->info('Posts seeded successfully!');
    }
}
