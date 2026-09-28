<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BusinessHour extends Model
{
    protected $fillable = [
        'tenant_id',
        'day_of_week',
        'is_open',
        'start_time',
        'end_time',
    ];

    protected $casts = [
        'is_open' => 'boolean',
        'day_of_week' => 'integer',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function breaks(): HasMany
    {
        return $this->hasMany(BusinessHourBreak::class);
    }
}