"use client";

import { X } from "lucide-react";

type Props = {
    isOpen: boolean;
    title?: string;
    description?: string;
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
};

export default function ConfirmModal({
    isOpen,
    title = "Xác nhận",
    description = "Bạn có chắc chắn muốn thực hiện hành động này?",
    onConfirm,
    onCancel,
    loading = false,
}: Props) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 animate-in fade-in zoom-in-95 text-center">

                {/* ICON */}
                <div className="w-12 h-12 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-500 text-xl">
                    ⚠️
                </div>

                {/* TITLE */}
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                    {title}
                </h2>

                {/* DESCRIPTION */}
                <p className="text-sm text-gray-600 mb-6">
                    {description}
                </p>

                {/* ACTIONS */}
                <div className="flex justify-center gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
                    >
                        Huỷ
                    </button>

                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                    >
                        Xoá
                    </button>
                </div>
            </div>
        </div>
    );
}