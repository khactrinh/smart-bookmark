import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Bookmark from '@/models/Bookmark';
import { fetchMetadata } from '@/lib/scraper';

// [POST] THÊM BOOKMARK MỚI
export async function POST(req) {
    try {
        await connectDB();
        const { url, category, tags } = await req.json();

        // Tự động nhận diện Title, Image, Description
        const metadata = await fetchMetadata(url);

        const newBookmark = await Bookmark.create({
            url,
            category,
            tags,
            title: metadata.title,
            description: metadata.description,
            image: metadata.image,
        });

        return NextResponse.json({ success: true, data: newBookmark }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// [GET] LẤY DANH SÁCH (CÓ FILTER, PHÂN TRANG, RANDOM)
// Thay thế hàm GET hiện tại bằng đoạn code sau:

export async function GET(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);

        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const category = searchParams.get('category');
        const tag = searchParams.get('tag');
        const search = searchParams.get('search'); // Lấy từ khóa tìm kiếm
        const isRandom = searchParams.get('random') === 'true';

        // Tạo bộ lọc
        let filter = {};
        if (category) filter.category = category;
        if (tag) filter.tags = { $in: [tag] };

        // Thêm logic tìm kiếm (Tìm trong Title, Description, URL hoặc Tags)
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } }, // 'i' là không phân biệt hoa/thường
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
            bookmarks = await Bookmark.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);
            total = await Bookmark.countDocuments(filter);
        }

        return NextResponse.json({
            success: true,
            data: bookmarks,
            pagination: { total, page, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}