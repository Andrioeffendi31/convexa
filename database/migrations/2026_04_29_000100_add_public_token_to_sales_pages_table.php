<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('sales_pages', function (Blueprint $table) {
            $table->string('public_token', 26)->nullable()->unique()->after('template_key');
        });

        DB::table('sales_pages')
            ->select('id')
            ->orderBy('id')
            ->chunkById(100, function ($rows) {
                foreach ($rows as $row) {
                    DB::table('sales_pages')
                        ->where('id', $row->id)
                        ->update(['public_token' => (string) Str::ulid()]);
                }
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales_pages', function (Blueprint $table) {
            $table->dropColumn('public_token');
        });
    }
};
