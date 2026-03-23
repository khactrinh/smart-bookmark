import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Bookmark from '@/models/Bookmark';
import { fetchMetadata } from '@/lib/scraper';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Middleware kiểm tra auth
async function checkAuth() {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");
    return session.user.email;
}

export async function POST(req) {
    try {
        const userEmail = await checkAuth(); // Lấy email người dùng
        await connectDB();

        const { url, category, tags } = await req.json();
        const metadata = await fetchMetadata(url);

        const newBookmark = await Bookmark.create({
            url, category, tags,
            title: metadata.title,
            description: metadata.description,
            image: metadata.image,
            userEmail, // Gắn email người dùng vào record
        });

        return NextResponse.json({ success: true, data: newBookmark }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: error.message === "Unauthorized" ? 401 : 500 });
    }
}

export async function GET(req) {
    try {
        const userEmail = await checkAuth(); // Lấy email người dùng
        await connectDB();
        const { searchParams } = new URL(req.url);

        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const category = searchParams.get('category');
        const tag = searchParams.get('tag');
        const search = searchParams.get('search');
        const isRandom = searchParams.get('random') === 'true';

        // BỘ LỌC CỐ ĐỊNH: Chỉ lấy bookmark của user đang đăng nhập
        let filter = { userEmail };

        if (category) filter.category = category;
        if (tag) filter.tags = { $in: [tag] };

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { url: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }

        let bookmarks;
        let total = 0;

        if (isRandom) {
            bookmarks = await Bookmark.aggregate([
                { $match: filter },
                { $sample: { size: limit } }
            ]);
            total = bookmarks.length;
        } else {
            const skip = (page - 1) * limit;
            bookmarks = await Bookmark.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
            total = await Bookmark.countDocuments(filter);
        }

        return NextResponse.json({
            success: true, data: bookmarks,
            pagination: { total, page, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: error.message === "Unauthorized" ? 401 : 500 });
    }
}