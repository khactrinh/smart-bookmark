import mongoose from 'mongoose';

const BookmarkSchema = new mongoose.Schema({
    url: { type: String, required: true },
    title: { type: String },
    description: { type: String },
    image: { type: String }, // Ảnh thumbnail của Youtube/Website
    category: { type: String, default: 'Uncategorized' },
    tags: [{ type: String }], // Mảng các tag
    userEmail: { type: String, required: true },
}, { timestamps: true }); // Tự động tạo createdAt (lưu theo ngày tháng)

export default mongoose.models.Bookmark || mongoose.model('Bookmark', BookmarkSchema);