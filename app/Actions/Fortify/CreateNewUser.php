<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;
use App\Models\Tenant;
use App\Models\TenantUser;
use Illuminate\Support\Facades\DB;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
        ])->validate();

        $host = request()->getHost();

        $tenant = Tenant::whereHas('domains', function ($query) use ($host) {
            $query->where('domain', $host);
        })->first();

        return DB::transaction(function () use ($input, $tenant) {
            $user = User::create([
                'name' => $input['name'],
                'email' => $input['email'],
                'password' => $input['password'],
                'role' => 'tenant',
            ]);

            if ($tenant) {
                TenantUser::create([
                    'user_id' => $user->id,
                    'tenant_id' => $tenant->id,
                    'role' => 'client',
                ]);
            }

            return $user;
        });
    }
}
