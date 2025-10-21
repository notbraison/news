<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Tag extends Model
{
    protected $fillable = ['name', 'slug'];

    // Auto-generate slug on create/update
    protected static function booted()
    {
        static::creating(fn ($tag) => $tag->slug = Str::slug($tag->name));
        static::updating(fn ($tag) => $tag->slug = Str::slug($tag->name));
    }

    // Relationship to posts (many-to-many)
    public function posts()
    {
        return $this->belongsToMany(Post::class, 'post_tag', 'tag_id', 'post_id');
    }
}
