import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Category from '@/models/Category';
import Bookmark from '@/models/Bookmark';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function checkAuth() {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");
    return session.user.email;
}

// LẤY DANH SÁCH CHỦ ĐỀ
export async function GET() {
    try {
        const userEmail = await checkAuth(); await connectDB();
        const categories = await Category.find({ userEmail }).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: categories });
    } catch (e) { return NextResponse.json({ error: e.message }, { status: 401 }) }
}

// THÊM MỚI
export async function POST(req) {
    try {
        const userEmail = await checkAuth(); await connectDB();
        const { name } = await req.json();
        const newCat = await Category.create({ name, userEmail });
        return NextResponse.json({ success: true, data: newCat });
    } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

// SỬA TÊN (Đồng bộ đổi tên toàn bộ Bookmark cũ)
export async function PUT(req) {
    try {
        const userEmail = await checkAuth(); await connectDB();
        const { id, newName, oldName } = await req.json();
        await Category.findOneAndUpdate({ _id: id, userEmail }, { name: newName });
        await Bookmark.updateMany({ category: oldName, userEmail }, { category: newName }); // Tự động cập nhật bookmark
        return NextResponse.json({ success: true });
    } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

// XOÁ CHỦ ĐỀ
export async function DELETE(req) {
    try {
        const userEmail = await checkAuth(); await connectDB();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const name = searchParams.get('name');

        await Category.findOneAndDelete({ _id: id, userEmail });
        await Bookmark.updateMany({ category: name, userEmail }, { category: "Uncategorized" }); // Đưa bookmark về rỗng
        return NextResponse.json({ success: true });
    } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}