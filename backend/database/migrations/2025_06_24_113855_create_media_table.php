<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained()->onDelete('cascade');
            $table->string('type'); // e.g., image, video
            $table->string('subtype')->nullable(); // e.g., featured, secondary, gallery
            $table->string('url');  // cloud-hosted link
            $table->string('alt_text')->nullable();
            $table->json('metadata')->nullable(); // e.g., width, height, file size, etc.
            $table->integer('order')->default(0); // for ordering multiple images
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media');
    }
};
