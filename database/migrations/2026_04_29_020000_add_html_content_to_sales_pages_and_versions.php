<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sales_pages', function (Blueprint $table) {
            if (! Schema::hasColumn('sales_pages', 'html_content')) {
                $table->longText('html_content')->nullable()->after('sections');
            }
        });

        Schema::table('sales_page_versions', function (Blueprint $table) {
            if (! Schema::hasColumn('sales_page_versions', 'html_content')) {
                $table->longText('html_content')->nullable()->after('template_key');
            }
        });

        DB::table('sales_pages')
            ->whereNull('html_content')
            ->whereNotNull('export_html')
            ->update([
                'html_content' => DB::raw('export_html'),
            ]);
    }

    public function down(): void
    {
        Schema::table('sales_page_versions', function (Blueprint $table) {
            if (Schema::hasColumn('sales_page_versions', 'html_content')) {
                $table->dropColumn('html_content');
            }
        });

        Schema::table('sales_pages', function (Blueprint $table) {
            if (Schema::hasColumn('sales_pages', 'html_content')) {
                $table->dropColumn('html_content');
            }
        });
    }
};
