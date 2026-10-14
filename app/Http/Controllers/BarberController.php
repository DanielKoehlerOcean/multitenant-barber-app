<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class BarberController extends Controller
{
    public function index(){
        return Inertia::render('barbers/index', []);
    }


}
