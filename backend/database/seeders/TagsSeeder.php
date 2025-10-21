<?php

namespace Database\Seeders;
//   php artisan db:seed --class=TagsSeeder

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Tag;

class TagsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tags = [
            'breaking', 'exclusive', 'opinion', 'analysis', 'interview', 'feature', 'investigation',
            'elections', 'corruption', 'policy', 'reform', 'parliament', 'president', 'government',
            'conflict', 'war', 'peace', 'diplomacy', 'sanctions', 'protest', 'security',
            'crime', 'law', 'court', 'justice', 'police', 'arrest', 'trial',
            'education', 'school', 'university', 'scholarship', 'teacher', 'student',
            'health', 'medicine', 'covid-19', 'pandemic', 'vaccine', 'hospital', 'doctor', 'mental health',
            'economy', 'business', 'market', 'stock', 'trade', 'investment', 'startup', 'entrepreneur',
            'technology', 'ai', 'blockchain', 'cybersecurity', 'innovation', 'science', 'research',
            'environment', 'climate', 'weather', 'disaster', 'wildlife', 'conservation', 'energy', 'agriculture',
            'transport', 'infrastructure', 'road', 'rail', 'aviation', 'shipping',
            'sport', 'football', 'basketball', 'athletics', 'olympics', 'tournament', 'championship',
            'entertainment', 'music', 'film', 'movie', 'tv', 'celebrity', 'award', 'festival',
            'fashion', 'style', 'lifestyle', 'travel', 'food', 'culture', 'art', 'heritage',
            'real estate', 'housing', 'urban', 'development', 'migration', 'demographics',
            'religion', 'faith', 'church', 'mosque', 'temple',
            'local', 'international', 'africa', 'europe', 'asia', 'america', 'middle east',
        ];

        foreach ($tags as $tag) {
            Tag::firstOrCreate(['name' => $tag]);
        }
    }
}
