<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OperationController extends Controller
{
    public function index(){
        return Inertia::render('settings/operation', []);
    }
}
