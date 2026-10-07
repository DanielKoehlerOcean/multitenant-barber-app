<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BarberWorkingHourBreak extends Model
{

    protected $fillable = [
        'barber_working_hour_id',
        'start_time',
        'end_time',
    ];

    public function barberWorkingHour(): BelongsTo
    {
        return $this->belongsTo(BarberWorkingHour::class);
    }
}