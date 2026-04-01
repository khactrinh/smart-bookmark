import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Collection from '@/models/Collection';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import crypto from 'crypto';

async function checkAuth() {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    if (!email) throw new Error("Unauthorized");
    return email;
}

export async function GET(req: Request) {
    try {
        const userEmail = await checkAuth();
        await connectDB();
        
        const collections = await Collection.find({ userEmail }).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: collections });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: error.message === "Unauthorized" ? 401 : 500 });
    }
}

export async function POST(req: Request) {
    try {
        const userEmail = await checkAuth();
        await connectDB();
        
        const { name, description } = await req.json();
        const shareId = crypto.randomUUID();

        const collection = await Collection.create({
            name, description, userEmail, shareId
        });

        return NextResponse.json({ success: true, data: collection }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
