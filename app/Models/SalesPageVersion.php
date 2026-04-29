<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SalesPageVersion extends Model
{
    protected $fillable = [
        'sales_page_id',
        'version_number',
        'template_key',
        'html_content',
        'sections',
        'generation_meta',
        'source_user_message_id',
        'summary',
    ];

    protected $casts = [
        'sections' => 'array',
        'generation_meta' => 'array',
    ];

    public function salesPage(): BelongsTo
    {
        return $this->belongsTo(SalesPage::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(SalesPageMessage::class, 'version_id');
    }
}
