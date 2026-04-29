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
        Schema::create('sales_page_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sales_page_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('version_number');
            $table->string('template_key')->default('aurora');
            $table->json('sections');
            $table->json('generation_meta')->nullable();
            $table->unsignedBigInteger('source_user_message_id')->nullable();
            $table->string('summary', 160)->nullable();
            $table->timestamps();

            $table->unique(['sales_page_id', 'version_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales_page_versions');
    }
};
