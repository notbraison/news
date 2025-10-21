<?php

namespace App\Http\Controllers;

use App\Models\Media;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MediaController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'post_id' => 'required|exists:posts,id',
            'type' => 'required|string',
            'subtype' => 'nullable|string', // featured, secondary, gallery, etc.
            'url' => 'required|url',
            'alt_text' => 'nullable|string',
            'order' => 'nullable|integer',
        ]);

        // If no order is provided, set it to the next available order
        if (!isset($data['order'])) {
            $maxOrder = Media::where('post_id', $data['post_id'])
                ->where('type', $data['type'])
                ->max('order');
            $data['order'] = ($maxOrder ?? -1) + 1;
        }

        $media = Media::create($data);
        return response()->json($media, 201);
    }

    public function storeMultiple(Request $request)
    {
        $request->validate([
            'post_id' => 'required|exists:posts,id',
            'images' => 'required|array',
            'images.*.url' => 'required|url',
            'images.*.type' => 'required|string',
            'images.*.subtype' => 'nullable|string',
            'images.*.alt_text' => 'nullable|string',
            'images.*.order' => 'nullable|integer',
        ]);

        $postId = $request->post_id;
        $images = $request->images;

        DB::beginTransaction();
        try {
            $createdMedia = [];
            foreach ($images as $index => $imageData) {
                // Set order if not provided
                if (!isset($imageData['order'])) {
                    $maxOrder = Media::where('post_id', $postId)
                        ->where('type', $imageData['type'])
                        ->max('order');
                    $imageData['order'] = ($maxOrder ?? -1) + 1;
                }

                $media = Media::create([
                    'post_id' => $postId,
                    'type' => $imageData['type'],
                    'subtype' => $imageData['subtype'] ?? null,
                    'url' => $imageData['url'],
                    'alt_text' => $imageData['alt_text'] ?? null,
                    'order' => $imageData['order'],
                ]);

                $createdMedia[] = $media;
            }

            DB::commit();
            return response()->json($createdMedia, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to create media items'], 500);
        }
    }

    public function updateOrder(Request $request)
    {
        $request->validate([
            'media_items' => 'required|array',
            'media_items.*.id' => 'required|exists:media,id',
            'media_items.*.order' => 'required|integer',
        ]);

        DB::beginTransaction();
        try {
            foreach ($request->media_items as $item) {
                Media::where('id', $item['id'])->update(['order' => $item['order']]);
            }

            DB::commit();
            return response()->json(['message' => 'Order updated successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to update order'], 500);
        }
    }

    public function destroy(Media $media)
    {
        $media->delete();
        return response()->noContent();
    }

    public function findByUrl(Request $request)
    {
        $url = $request->query('url');
        if (!$url) {
            return response()->json(['message' => 'URL is required'], 400);
        }
        $media = Media::where('url', $url)->first();
        if (!$media) {
            return response()->json(['message' => 'Media not found'], 404);
        }
        return response()->json($media);
    }

    public function deleteByUrl(Request $request)
    {
        $url = $request->query('url');
        if (!$url) {
            return response()->json(['message' => 'URL is required'], 400);
        }
        $media = Media::where('url', $url)->first();
        if (!$media) {
            return response()->json(['message' => 'Media not found'], 404);
        }
        $media->delete();
        return response()->json(['message' => 'Media deleted successfully']);
    }

    public function getByPost($postId)
    {
        $media = Media::where('post_id', $postId)
            ->orderBy('order', 'asc')
            ->get();
        return response()->json($media);
    }
}
