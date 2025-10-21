<?php

// database/migrations/2025_06_26_XXXXXX_create_attachments_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('type'); // e.g., 'avatar', 'logo', 'pdf'
            $table->string('url'); // link to cloud resource
            $table->json('metadata')->nullable(); // optional JSON metadata
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('attachments');
    }
};

