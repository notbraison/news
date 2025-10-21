<?php

// app/Http/Controllers/AttachmentController.php

namespace App\Http\Controllers;

use App\Models\Attachment;
use Illuminate\Http\Request;

class AttachmentController extends Controller
{
    public function index()
    {
        return Attachment::with('user')->latest()->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'type' => 'required|string|max:255',
            'url' => 'required|url',
            'metadata' => 'nullable|array',
        ]);

        $attachment = Attachment::create($data);

        return response()->json($attachment, 201);
    }

    public function show(Attachment $attachment)
    {
        return $attachment->load('user');
    }

    public function destroy(Attachment $attachment)
    {
        $attachment->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
