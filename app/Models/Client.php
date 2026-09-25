<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class Client extends Model
{
    use BelongsToTenant; // Isola o cliente para a barbearia atual

    protected $fillable = ['tenant_id', 'name', 'telefone'];

    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }
}