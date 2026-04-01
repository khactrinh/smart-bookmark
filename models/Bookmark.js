import mongoose from 'mongoose';

const BookmarkSchema = new mongoose.Schema({
    url: { type: String, required: true },
    title: { type: String },
    description: { type: String },
    image: { type: String }, // Ảnh thumbnail của Youtube/Website
    category: { type: String, default: 'Uncategorized' },
    tags: [{ type: String }], // Mảng các tag
    collectionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Collection' }],
    userEmail: { type: String, required: true },
}, { timestamps: true }); // Tự động tạo createdAt (lưu theo ngày tháng)

BookmarkSchema.index({ userEmail: 1 });
BookmarkSchema.index({ category: 1 });
BookmarkSchema.index({ tags: 1 });
BookmarkSchema.index({ collectionIds: 1 });
BookmarkSchema.index({ createdAt: -1 });

export default mongoose.models.Bookmark || mongoose.model('Bookmark', BookmarkSchema);