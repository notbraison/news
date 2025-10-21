<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PostView extends Model
{
    protected $fillable = [
        'post_id',//Required foreign key to the posts table.
        'user_id',//Nullable FK to users for anonymous or logged-in views.
        'viewed_at',//Timestamp of when the post was viewed.
    ];

    public $timestamps = false;

    protected $dates = ['viewed_at'];

    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
