<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Post extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'slug',
        'body',
        'status',
        'published_at',
    ];

    protected $casts = [
        'published_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function ($post) {
            $post->slug = Str::slug($post->title);
        });

        static::updating(function ($post) {
            $post->slug = Str::slug($post->title);
        });
    }

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'post_tag', 'post_id', 'tag_id');
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'post_category');
    }

    public function media()
    {
        return $this->hasMany(Media::class)->orderBy('order', 'asc');
    }

    public function images()
    {
        return $this->hasMany(Media::class)->where('type', 'image')->orderBy('order', 'asc');
    }

    public function featuredImage()
    {
        return $this->hasOne(Media::class)->where('type', 'image')->where('subtype', 'featured');
    }

    public function secondaryImages()
    {
        return $this->hasMany(Media::class)->where('type', 'image')->where('subtype', 'secondary')->orderBy('order', 'asc');
    }

    public function getImageUrlAttribute()
    {
        $image = $this->media()->where('type', 'image')->where('subtype', 'featured')->first();
        return $image ? $image->url : null;
    }

    public function getSecondaryImageUrlAttribute()
    {
        $image = $this->media()->where('type', 'image')->where('subtype', 'secondary')->first();
        return $image ? $image->url : null;
    }

    public function getAllImagesAttribute()
    {
        return $this->media()->where('type', 'image')->orderBy('order', 'asc')->get();
    }
}
