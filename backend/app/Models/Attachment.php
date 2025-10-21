<?php

// app/Models/Attachment.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Attachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',// e.g., 'avatar', 'logo', 'pdf'
        'url',// link to cloud resource
        'metadata',// optional JSON metadata
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }
}
