<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tenant;
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
        
        $validated = $request->validate([
            'name' => ['required', 'string'],
            'email' => ['required', 'string'],
            'document' => ['nullable', 'string']
        ]);

        DB::transaction(function() use ($validated){
            $tenant = Tenant::create([
                'name' =>$validated['name'],
                'email' => $validated['email'],
                'document' > $validated['document']
            ]);

            $tenant->domains()->create([
                'domain' => $tenant->name . config('app.url')
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
