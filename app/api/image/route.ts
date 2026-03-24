import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");

    if (!url) {
        return NextResponse.json({ error: "Missing url" }, { status: 400 });
    }

    try {
        const res = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0",
            },
        });

        const contentType = res.headers.get("content-type") || "image/png";
        const buffer = await res.arrayBuffer();

        return new NextResponse(buffer, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=86400",
            },
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 });
    }
}