<?php

namespace App\Http\Controllers;

use App\Models\Schedule;
use App\Models\Service;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    public function index(){

        $services = Service::all();
        $clients = [['id' => 1, 'name' => 'Daniel']];
        $barbers = [['id' => 1, 'name' => 'Daniel Barber']];

        return Inertia::render('schedules/index', [
            'services' => $services,
            'clients' => $clients,
            'barbers' => $barbers
        ]);
    }
}
