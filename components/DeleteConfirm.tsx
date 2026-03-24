"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Trash2 } from "lucide-react";

export function DeleteConfirm({ onConfirm, triggerClass = "" }: { onConfirm: () => void, triggerClass?: string }) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <button className={triggerClass}>
                    <Trash2 size={16} />
                </button>
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Bạn chắc chắn muốn xoá?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Hành động này không thể hoàn tác. Bookmark sẽ bị xoá vĩnh viễn.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel>Huỷ</AlertDialogCancel>
                    <AlertDialogAction asChild>
                        <button
                            onClick={() => onConfirm()}
                            className="bg-red-500 text-white px-4 py-2 rounded"
                        >
                            Xoá
                        </button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}