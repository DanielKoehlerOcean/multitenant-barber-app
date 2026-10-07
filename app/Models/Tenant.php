<?php

namespace App\Models;

use Stancl\Tenancy\Database\Concerns\HasDomains;
use Stancl\Tenancy\Database\Concerns\HasDatabase;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tenant extends BaseTenant
{
    use HasDatabase, HasDomains, HasUuids;

    public static function getCustomColumns(): array
    {
        return [
            'id',
            'name',
            'slug',
            'email',
            'document',
            'plan',
            'is_active',
        ];
    }

    public function users()
    {
        // Relação de quais usuários têm acesso a esta barbearia e qual a permissão deles
        return $this->belongsToMany(User::class, 'tenant_users')
                    ->withPivot('role')
                    ->withTimestamps();
    }

}