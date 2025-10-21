<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PostRevision extends Model
{
    protected $fillable = [
        'post_id',//Connects revision to the original post
        'editor_id',//Tracks which user made the edit
        'body_snapshot',//Stores the post content at that version
    ];

    public function post() {
        return $this->belongsTo(Post::class);
    }

    public function editor() {
        return $this->belongsTo(User::class, 'editor_id');
    }
}
