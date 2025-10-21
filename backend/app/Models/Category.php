<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Category extends Model
{
    protected $fillable = ['name', 'slug', 'description'];

    protected $appends = ['posts_count'];

    // Automatically generate slug from name
    public static function booted()
    {
        static::creating(fn ($category) => $category->slug = Str::slug($category->name));
        static::updating(fn ($category) => $category->slug = Str::slug($category->name));
    }

    // Relationships
    public function posts()
{
    return $this->belongsToMany(Post::class, 'post_category');
}

    // Accessor for posts_count
    public function getPostsCountAttribute()
    {
        return $this->posts()->count();
    }
}
