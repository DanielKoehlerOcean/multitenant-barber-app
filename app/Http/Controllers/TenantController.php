<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tenant;
use Illuminate\Support\Facades\DB;

class TenantController extends Controller
{
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
                'domain' => $tenant->name . config('app.url'),
            ]);
        });
    }
}
