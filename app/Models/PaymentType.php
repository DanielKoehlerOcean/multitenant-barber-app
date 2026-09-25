<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentType extends Model
{
    protected $fillable = ['type'];

    public function schedules()
    {
        return $this->hasMany(Schedule::class, 'payment_types_id');
    }
}