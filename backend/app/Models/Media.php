<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Media extends Model
{
    protected $fillable = [
        'post_id',
        'type',
        'subtype', // featured, secondary, gallery, etc.
        'url',
        'alt_text',
        'metadata',
        'order', // for ordering multiple images
    ];

    protected $casts = [
        'metadata' => 'array',
        'order' => 'integer',
    ];

    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    // Scopes for easy querying
    public function scopeFeatured($query)
    {
        return $query->where('type', 'image')->where('subtype', 'featured');
    }

    public function scopeSecondary($query)
    {
        return $query->where('type', 'image')->where('subtype', 'secondary');
    }

    public function scopeImages($query)
    {
        return $query->where('type', 'image');
    }
}
