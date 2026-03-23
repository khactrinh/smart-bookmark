import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Bookmark from '@/models/Bookmark';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function DELETE(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await connectDB();
        const { id } = await params;

        // Xoá đúng ID và đúng người sở hữu
        await Bookmark.findOneAndDelete({ _id: id, userEmail: session.user.email });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}