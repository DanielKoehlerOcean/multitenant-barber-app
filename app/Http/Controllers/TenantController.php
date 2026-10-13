<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tenant;
use App\Models\TenantUser;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TenantController extends Controller
{

    public function index(Request $request){
        return Inertia::render('tenants', []);
    }

    public function create(Request $request){
        return Inertia::render('tenants/create', []);
    }
    

    public function store(Request $request){
        
        $user = auth()->user();

        $validated = $request->validate([
            'name' => ['required', 'string'],
            'email' => ['required', 'string'],
            'document' => ['nullable', 'string'],
            'slug' => ['required', 'string']
        ]);

        DB::transaction(function() use ($validated, $user){
            $tenant = Tenant::create($validated);

            $tenant->domains()->create([
                'domain' => $tenant->slug . '.' . config('app.url')
            ]);

            TenantUser::create([
                'user_id' => $user->id,
                'tenant_id', $tenant->id,
                'role' => 'admin'
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
