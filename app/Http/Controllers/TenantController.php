<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tenant;
use App\Models\User;
use App\Models\TenantUser;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Stancl\Tenancy\Database\Models\Domain;
use Illuminate\Validation\ValidationException;

class TenantController extends Controller
{

    public function index(Request $request){
        return Inertia::render('tenants', []);
    }

    public function create(Request $request){

        return Inertia::render('tenants/create', [
            'tenants' => Tenant::all() ?? []
        ]);
    }
    
    public function store(Request $request){
        
        $validated = $request->validate([
            'name' => ['required', 'string'],
            'email' => ['required', 'string'],
            'document' => ['nullable', 'string'],
            'slug' => ['required', 'string'],
            'plan' => ['required', 'string']
        ]);

        $user = auth('central')->user();

        abort_unless($user, 401);

        DB::transaction(function() use ($validated, $user){
            $lockedUser = User::whereKey($user->id)
                ->lockForUpdate()
                ->firstOrFail();

            $alreadyOwnsTenant = TenantUser::where('user_id', $lockedUser->id)
                ->where('role', 'owner')
                ->exists();

            if ($alreadyOwnsTenant) {
                throw ValidationException::withMessages([
                    'tenant' => 'Você já possui uma barbearia cadastrada.',
                ]);
            }

            $tenant = Tenant::create($validated);

            $baseDomain = parse_url(config('app.url'), PHP_URL_HOST);

            $tenant->domains()->create([
                'domain' => $tenant->slug . '.' . $baseDomain,
            ]);

            TenantUser::create([
                'user_id' => $lockedUser->id,
                'tenant_id' => $tenant->id,
                'role' => 'owner',
            ]);
        });
    }

    public function update(Request $request, string $id){
        $validated = $request->validate([
            'name' => ['nullable', 'string'],
            'email' => ['nullable', 'string'],
            'document'=> ['nullable', 'string']
        ]);

        $tenant = Tenant::findOrFail($id);

        DB::transaction(function() use ($tenant, $validated){
            $tenant->update([
                'name' =>$validated['name'],
                'email' => $validated['email'],
                'document' > $validated['document']
            ]);

            $tenant->domains()->update([
                    'domain' => $tenant->name . config('app.url')
                ]);
        });
    }

    public function disabled(Request $request, $id){
        $tenant = Tenant::findOrFail($id);

        $tenant->update([
            'is_active' => false
        ]);
    }
}
