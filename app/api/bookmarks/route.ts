import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Bookmark from '@/models/Bookmark';
import { fetchMetadata } from '@/lib/scraper';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Category from '@/models/Category';

// Middleware kiểm tra auth
async function checkAuth(): Promise<string> {
    const session = await getServerSession(authOptions);

    const email = session?.user?.email;

    if (!email) {
        throw new Error("Unauthorized");
    }

    return email;
}


export async function POST(req: Request) {
    try {
        const userEmail = await checkAuth();
        await connectDB();

        const { url, category, tags, title, description, note, collectionIds, forceMerge } = await req.json();

        // Check for existing bookmarks with the same URL for this user
        const existingBookmarks = await Bookmark.find({ url, userEmail });

        if (existingBookmarks.length > 0 && !forceMerge) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'DUPLICATE_URL', 
                    duplicateCount: existingBookmarks.length 
                }, 
                { status: 409 }
            );
        }

        let newBookmark;

        if (existingBookmarks.length > 0 && forceMerge) {
            // Keep the first one, update it, and remove the others
            const bookmarkToKeep = existingBookmarks[0];
            const idsToDelete = existingBookmarks.slice(1).map(b => b._id);
            
            if (idsToDelete.length > 0) {
                await Bookmark.deleteMany({ _id: { $in: idsToDelete } });
            }

            // Merge tags, collectionIds, and categories
            const allTags = new Set<string>();
            const allCollections = new Set<string>();
            const allCategories = new Set<string>();
            
            existingBookmarks.forEach(b => {
                if (Array.isArray(b.tags)) b.tags.forEach((t: any) => allTags.add(String(t)));
                if (Array.isArray(b.collectionIds)) b.collectionIds.forEach((c: any) => allCollections.add(c.toString()));
                if (Array.isArray(b.category)) {
                    b.category.forEach((c: any) => {
                        const catStr = typeof c === 'string' ? c : (c.type || String(c));
                        allCategories.add(catStr);
                    });
                }
                else if (b.category) allCategories.add(String(b.category));
            });
            if (Array.isArray(tags)) tags.forEach((t: string) => allTags.add(t));
            if (Array.isArray(collectionIds)) collectionIds.forEach((c: string) => allCollections.add(c));
            if (Array.isArray(category)) category.forEach((c: string) => allCategories.add(c));
            else if (category && typeof category === "string") allCategories.add(category);
            
            const tagsArray = Array.from(allTags);
            const collectionsArray = Array.from(allCollections);
            const categoriesArray = Array.from(allCategories);
            if (categoriesArray.length === 0) categoriesArray.push("Uncategorized");
            
            const now = new Date();
            
            // Use findByIdAndUpdate with overwriteImmutable: true to bypass Mongoose's immutable createdAt
            const updatedBookmark = await Bookmark.findByIdAndUpdate(
                bookmarkToKeep._id,
                {
                    $set: {
                        tags: tagsArray,
                        collectionIds: collectionsArray,
                        category: categoriesArray,
                        createdAt: now,
                        updatedAt: now
                    }
                },
                { new: true, overwriteImmutable: true }
            );
            
            newBookmark = updatedBookmark || bookmarkToKeep;
        } else {
            // No duplicates, or it's the first time
            // fallback metadata
            const metadata = await fetchMetadata(url);

            const categoryArray = Array.isArray(category) ? category : (category ? [category] : ["Uncategorized"]);
            const tagsArray = Array.isArray(tags) ? tags : (tags ? [tags] : []);

            newBookmark = await Bookmark.create({
                url,
                category: categoryArray,
                tags: tagsArray,
                collectionIds: collectionIds || [],
                title: title || metadata.title,
                description: description || metadata.description,
                note: note || "",
                image: metadata.image,
                userEmail,
            });
        }

        // Sync categories to Category collection (Non-blocking)
        if (newBookmark && Array.isArray(newBookmark.category)) {
            try {
                const syncPromises = newBookmark.category
                    .filter(catName => typeof catName === 'string' && catName.trim() !== "" && catName !== "Uncategorized")
                    .map(async (catName: string) => {
                        return Category.findOneAndUpdate(
                            { name: catName.trim(), userEmail },
                            { name: catName.trim(), userEmail },
                            { upsert: true, new: true }
                        );
                    });
                await Promise.all(syncPromises);
            } catch (syncError) {
                console.error("Category sync error (ignored):", syncError);
            }
        }

        return NextResponse.json({ success: true, data: newBookmark }, { status: 201 });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json(
            { success: false, error: message },
            { status: message === "Unauthorized" ? 401 : 500 }
        );
    }
}

export async function GET(req: Request) {
    try {
        const userEmail = await checkAuth(); // Lấy email người dùng
        await connectDB();
        const { searchParams } = new URL(req.url);

        const page = Number(searchParams.get('page') ?? 1);
        const limit = Number(searchParams.get('limit') ?? 10);
        const category = searchParams.get('category');
        const tag = searchParams.get('tag');
        const search = searchParams.get('search');
        const collectionId = searchParams.get('collectionId');
        const isRandom = searchParams.get('random') === 'true';

        // BỘ LỌC CỐ ĐỊNH: Chỉ lấy bookmark của user đang đăng nhập
        let filter: any = { userEmail };

        if (category) filter.category = category;
        if (tag) filter.tags = { $in: [tag] };
        if (collectionId) filter.collectionIds = collectionId;

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { url: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
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
        const message =
            error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ success: false, error: message }, { status: message === "Unauthorized" ? 401 : 500 });
    }
}