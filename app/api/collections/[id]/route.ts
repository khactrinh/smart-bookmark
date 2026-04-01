import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Collection from '@/models/Collection';
import Bookmark from '@/models/Bookmark';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function checkAuth() {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    if (!email) throw new Error("Unauthorized");
    return email;
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const userEmail = await checkAuth();
        await connectDB();
        
        const { id } = await params;
        const collection = await Collection.findOne({ _id: id, userEmail });
        if (!collection) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
        
        // Also get bookmarks
        const bookmarks = await Bookmark.find({ userEmail, collectionIds: id }).sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: collection, bookmarks });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: error.message === "Unauthorized" ? 401 : 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const userEmail = await checkAuth();
        await connectDB();
        const { name, description } = await req.json();
        const { id } = await params;

        const collection = await Collection.findOneAndUpdate(
            { _id: id, userEmail },
            { name, description },
            { new: true }
        );

        if (!collection) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
        
        return NextResponse.json({ success: true, data: collection });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const userEmail = await checkAuth();
        await connectDB();
        const { id } = await params;

        const collection = await Collection.findOneAndDelete({ _id: id, userEmail });
        if (!collection) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

        // Build a pull update for bookmarks in this collection
        await Bookmark.updateMany(
            { userEmail, collectionIds: id },
            { $pull: { collectionIds: id } }
        );

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
