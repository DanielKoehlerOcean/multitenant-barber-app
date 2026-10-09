<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

use Illuminate\Database\Eloquent\Casts\Attribute;

class Schedule extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id', 'payment_types_id', 'client_id', 'barber_id', 
        'status', 'started_at', 'end_at', 'paid_value'
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'end_at' => 'datetime',
    ];

    protected $appends = [
        'total_value'
    ];

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function barber() // Referência ao barbeiro na tabela users
    {
        return $this->belongsTo(User::class, 'barber_id');
    }

    public function paymentType()
    {
        return $this->belongsTo(PaymentType::class, 'payment_types_id');
    }

    public function services()
    {
        return $this->belongsToMany(Service::class)
                    ->withPivot('value', 'duration')
                    ->withTimestamps();
    }

        protected function totalValue(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->services->sum(
                fn ($item) => ($item->value ?? 0) 
            )
        );
    }
}