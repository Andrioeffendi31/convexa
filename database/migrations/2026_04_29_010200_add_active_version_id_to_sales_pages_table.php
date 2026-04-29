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
        Schema::table('sales_pages', function (Blueprint $table) {
            $table->foreignId('active_version_id')
                ->nullable()
                ->after('public_token')
                ->constrained('sales_page_versions')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales_pages', function (Blueprint $table) {
            $table->dropConstrainedForeignId('active_version_id');
        });
    }
};
