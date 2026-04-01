import mongoose from 'mongoose';

const CollectionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    userEmail: { type: String, required: true },
    shareId: { type: String, unique: true, sparse: true }
}, { timestamps: true });

CollectionSchema.index({ userEmail: 1 });
CollectionSchema.index({ shareId: 1 });

export default mongoose.models.Collection || mongoose.model('Collection', CollectionSchema);
