import { NextResponse } from "next/server";
import { fetchMetadata } from "@/lib/scraper";

export async function POST(req: Request) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json(
                { success: false, error: "Missing URL" },
                { status: 400 }
            );
        }

        const metadata = await fetchMetadata(url);

        return NextResponse.json({
            success: true,
            data: metadata,
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}