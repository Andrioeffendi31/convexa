<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sales_pages', function (Blueprint $table) {
            $table->json('brief_meta')->nullable()->after('unique_selling_points');
        });
    }

    public function down(): void
    {
        Schema::table('sales_pages', function (Blueprint $table) {
            $table->dropColumn('brief_meta');
        });
    }
};
