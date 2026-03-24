"use client";
import { useState, useEffect } from "react";

export default function EditBookmarkModal({
    isOpen,
    onClose,
    bookmark,
    onSuccess,
}: any) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [tags, setTags] = useState("");

    useEffect(() => {
        if (bookmark) {
            setTitle(bookmark.title || "");
            setDescription(bookmark.description || "");
            setCategory(bookmark.category || "");
            setTags((bookmark.tags || []).join(", "));
        }
    }, [bookmark]);

    if (!isOpen || !bookmark) return null;

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        const res = await fetch(`/api/bookmarks/${bookmark._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title,
                description,
                category,
                tags: tags.split(",").map((t) => t.trim()),
            }),
        });

        const data = await res.json();

        if (data.success) {
            onSuccess();
            onClose();
        } else {
            alert("Lỗi update");
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded-xl w-96 flex flex-col gap-3"
            >
                <h2 className="font-bold text-lg">Edit Bookmark</h2>

                <input value={title} onChange={(e) => setTitle(e.target.value)} />
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
                <input value={category} onChange={(e) => setCategory(e.target.value)} />
                <input value={tags} onChange={(e) => setTags(e.target.value)} />

                <button type="submit" className="bg-black text-white p-2 rounded">
                    Save
                </button>
            </form>
        </div>
    );
}