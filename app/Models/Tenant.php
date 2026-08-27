<?php

namespace App\Models;

use Stancl\Tenancy\Database\Concerns\HasDomains;
use Stancl\Tenancy\Database\Concerns\HasDatabase;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;

class Tenant extends BaseTenant
{
    use HasDatabase, HasDomains, HasUuids;

    public static function getCustomColumns(): array
    {
        return [
            'id',
            'name',
            'email',
            'document',
            'plan',
            'is_active',
        ];
    }
}