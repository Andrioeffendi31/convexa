<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SalesPageMessage extends Model
{
    protected $fillable = [
        'sales_page_id',
        'role',
        'content',
        'meta',
        'version_id',
    ];

    protected $casts = [
        'meta' => 'array',
    ];

    public function salesPage(): BelongsTo
    {
        return $this->belongsTo(SalesPage::class);
    }

    public function version(): BelongsTo
    {
        return $this->belongsTo(SalesPageVersion::class, 'version_id');
    }
}
