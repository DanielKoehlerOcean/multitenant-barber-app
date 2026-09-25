<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Service;
use Illuminate\Support\Facades\Storage;

class ServiceController extends Controller
{
    public function index(){

        $services = Service::all();

        return Inertia::render('services/index', [
            'services' => $services
        ]);
    }

    public function store(Request $request){
        $validated = $request->validate([
            'name' => ['required'],
            'value' => ['required'],
            'duration' => ['required'],
            'photo' => ['nullable', 'image', 'max:2048']
        ]);

        if($request->hasFile('photo')){
            $file = $request->file('photo');
            $path = $file->store('service_photos');
            
            $validated['photo_path'] = $path;
            $validated['mime_type'] = $file->getMimeType();
            $validated['original_name'] = $file->getClientOriginalName();
            $validated['file_size'] = $file->getSize();
        }

        Service::create($validated);

        return redirect()->back()->with('message', 'Serviço cadastrado com sucesso');

    }

    public function update(Request $request, $id){
        $validated = $request->validate([
            'name' => ['required'],
            'value' => ['required'],
            'duration' => ['required'],
            'photo' => ['nullable', 'image', 'max:2048']
        ]);

        if($request->hasFile('photo')){
            $file = $request->file('photo');
            $path = $file->store('service_photos');
            
            $validated['photo_path'] = $path;
            $validated['mime_type'] = $file->getMimeType();
            $validated['original_name'] = $file->getClientOriginalName();
            $validated['file_size'] = $file->getSize();
        }

        $service = Service::findOrFail($id);

        $service->update($validated);

        return redirect()->back()->with('message', 'Serviço Atualizado com sucesso');
    }
    
    public function destroy($id){
        $service = Service::findOrFail($id);

        $service->delete();

        return redirect()->back()->with('message', 'Serviço deletado com sucesso');
    }

    public function photo(Service $service)
    {
        // Verifica se o serviço tem foto e se o arquivo realmente existe no disco
        if (!$service->photo_path || !Storage::exists($service->photo_path)) {
            abort(404, 'Imagem não encontrada');
        }

        // Retorna o arquivo com os headers corretos para o navegador (mime type, etc)
        return Storage::response($service->photo_path);
    }
}
