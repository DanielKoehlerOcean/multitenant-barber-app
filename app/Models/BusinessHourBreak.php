<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BusinessHourBreak extends Model
{
    protected $fillable = [
        'business_hour_id',
        'start_time',
        'end_time',
    ];

    public function businessHour(): BelongsTo
    {
        return $this->belongsTo(BusinessHour::class);
    }
}