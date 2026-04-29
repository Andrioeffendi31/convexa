<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SalesPage extends Model
{
    protected $fillable = [
        'user_id',
        'product_name',
        'product_description',
        'key_features',
        'target_audience',
        'price',
        'unique_selling_points',
        'brief_meta',
        'template_key',
        'public_token',
        'active_version_id',
        'html_content',
        'sections',
        'generation_meta',
        'export_html',
    ];

    protected $casts = [
        'key_features' => 'array',
        'unique_selling_points' => 'array',
        'brief_meta' => 'array',
        'sections' => 'array',
        'generation_meta' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function versions(): HasMany
    {
        return $this->hasMany(SalesPageVersion::class)->orderBy('version_number');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(SalesPageMessage::class)->orderBy('created_at');
    }

    public function activeVersion(): BelongsTo
    {
        return $this->belongsTo(SalesPageVersion::class, 'active_version_id');
    }
}
