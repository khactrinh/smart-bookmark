// import { NextResponse } from "next/server";
// import { connectDB } from "@/lib/mongodb";
// import Bookmark from "@/models/Bookmark";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";

// // DELETE
// export async function DELETE(
//     req: Request,
//     context: { params: Promise<{ id: string }> }
// ) {
//     try {
//         const session = await getServerSession(authOptions);

//         if (!session || !session.user?.email) {
//             return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//         }

//         await connectDB();

//         const { id } = await context.params;

//         await Bookmark.findOneAndDelete({
//             _id: id,
//             userEmail: session.user.email,
//         });

//         return NextResponse.json({ success: true });
//     } catch (error: any) {
//         return NextResponse.json(
//             { success: false, error: error.message },
//             { status: 500 }
//         );
//     }
// }

// // PUT
// export async function PUT(
//     req: Request,
//     context: { params: Promise<{ id: string }> }
// ) {
//     try {
//         const session = await getServerSession(authOptions);

//         if (!session || !session.user?.email) {
//             return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//         }

//         await connectDB();

//         const { id } = await context.params;
//         const body = await req.json();

//         const updated = await Bookmark.findOneAndUpdate(
//             { _id: id, userEmail: session.user.email },
//             {
//                 title: body.title,
//                 description: body.description,
//                 category: body.category,
//                 tags: body.tags,
//             },
//             { returnDocument: "after" }
//         );

//         return NextResponse.json({ success: true, data: updated });
//     } catch (error: any) {
//         return NextResponse.json(
//             { success: false, error: error.message },
//             { status: 500 }
//         );
//     }
// }


import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Bookmark from "@/models/Bookmark";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// DELETE
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const { id } = await params;

        console.log("DELETE ID:", id);

        await Bookmark.findOneAndDelete({
            _id: id,
            userEmail: session.user.email,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE ERROR:", error);

        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

// PUT
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const { id } = await params;
        const body = await req.json();

        console.log("PUT ID:", id);
        console.log("BODY:", body);

        const updateData: any = {
            title: body.title,
            description: body.description,
            category: body.category,
            tags: body.tags,
        };

        if (body.collectionIds !== undefined) {
            updateData.collectionIds = body.collectionIds;
        }

        const updated = await Bookmark.findOneAndUpdate(
            { _id: id, userEmail: session.user.email },
            updateData,
            { returnDocument: "after" }
        );

        if (!updated) {
            return NextResponse.json(
                { success: false, error: "Bookmark not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: updated });
    } catch (error) {
        console.error("PUT ERROR:", error);

        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}