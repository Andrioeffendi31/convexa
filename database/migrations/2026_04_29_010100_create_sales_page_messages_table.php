<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('sales_page_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sales_page_id')->constrained()->cascadeOnDelete();
            $table->string('role', 20);
            $table->text('content');
            $table->json('meta')->nullable();
            $table->foreignId('version_id')
                ->nullable()
                ->constrained('sales_page_versions')
                ->nullOnDelete();
            $table->timestamps();

            $table->index(['sales_page_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales_page_messages');
    }
};
