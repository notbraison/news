<?php

namespace Database\Seeders;
//php artisan db:seed --class=CategorySeeder

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            'war',
            'government',
            'politics',
            'education',
            'health',
            'economy',
            'business',
            'fashion',
            'sport',
            'entertainment',
            'environment',
            'science',
            'technology',
            'crime',
            'law',
            'weather',
            'climate',
            'travel',
            'food',
            'religion',
            'opinion',
            'world',
            'local',
            'international',
            'culture',
            'lifestyle',
            'real estate',
            'automotive',
            'energy',
            'agriculture',
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(['name' => $category]);
        }
    }
}
