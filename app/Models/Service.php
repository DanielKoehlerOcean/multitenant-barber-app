<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class Service extends Model
{
    use BelongsToTenant;

    protected $fillable = ['tenant_id', 'name', 'value', 'duration', 'photo_path', 'mime_type', 'original_name', 'file_size'];

    public function schedules()
    {
        // Acessa os agendamentos e recupera o histórico de preço/duração da tabela pivô
        return $this->belongsToMany(Schedule::class)
                    ->withPivot('value', 'duration')
                    ->withTimestamps();
    }

    
}