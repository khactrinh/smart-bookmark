import mongoose from 'mongoose';

const BookmarkSchema = new mongoose.Schema({
    url: { type: String, required: true },
    title: { type: String },
    description: { type: String },
    image: { type: String }, // Ảnh thumbnail của Youtube/Website
    category: [String],
    note: { type: String }, // Ghi chú cá nhân
    tags: [String], // Mảng các tag
    collectionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Collection' }],
    userEmail: { type: String, required: true },
}, { timestamps: true }); // Tự động tạo createdAt (lưu theo ngày tháng)

BookmarkSchema.index({ userEmail: 1 });
BookmarkSchema.index({ category: 1 });
BookmarkSchema.index({ tags: 1 });
BookmarkSchema.index({ collectionIds: 1 });
BookmarkSchema.index({ createdAt: -1 });

// Force delete the model to ensure the schema is updated in Next.js hot-reloading
if (mongoose.models.Bookmark) {
    delete mongoose.models.Bookmark;
}

const Bookmark = mongoose.model('Bookmark', BookmarkSchema);
export default Bookmark;