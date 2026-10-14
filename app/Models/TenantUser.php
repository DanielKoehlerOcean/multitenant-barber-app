<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class TenantUser extends Model
{
    use BelongsToTenant;

    protected $fillable = ['user_id', 'tenant_id', 'role'];
}
