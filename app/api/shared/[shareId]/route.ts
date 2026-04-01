import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Collection from '@/models/Collection';
import Bookmark from '@/models/Bookmark';

export async function GET(req: Request, { params }: { params: Promise<{ shareId: string }> }) {
    try {
        await connectDB();
        
        const { shareId } = await params;
        
        // Find collection by shareId and make sure it is accessible
        const collection = await Collection.findOne({ shareId });
        
        if (!collection) {
            return NextResponse.json({ success: false, error: 'Shared collection not found' }, { status: 404 });
        }
        
        // Also fetch the bookmarks belonging to this collection.
        // Bỏ qua filter userEmail vì đây là collection được chia sẻ public.
        const bookmarks = await Bookmark.find({ collectionIds: collection._id }).sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: collection, bookmarks });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
