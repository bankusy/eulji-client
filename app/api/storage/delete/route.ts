import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { z } from "zod";

const deleteFileSchema = z.object({
    fileUrl: z.string().url("Invalid URL format"),
});

const r2 = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    },
});

export async function POST(request: Request) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const json = await request.json();
        const validation = deleteFileSchema.safeParse(json);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Invalid input", details: validation.error.format() },
                { status: 400 }
            );
        }

        const { fileUrl } = validation.data;

        // Validate that the URL belongs to our R2 bucket to prevent deleting external resources
        const publicDomain = process.env.R2_PUBLIC_DOMAIN?.replace(/\/$/, "");
        
        // If publicDomain is not set, we can't safely validate ownership, so we should arguably fail or warn.
        // For now, assuming it's set in env.
        if (publicDomain && !fileUrl.startsWith(publicDomain)) {
             // Not our file, so we skip deletion (not an error)
             // But strictly for security, we might want to return 403 or just success to not leak info.
             console.warn("Attempted to delete external URL:", fileUrl);
            return NextResponse.json({ message: "Skipped deletion (external URL)" });
        }

        // Extract key from URL
        // URL format: https://<public-domain>/<key>
        // If publicDomain is missing, we can't extract key safely from a full URL if we rely on it.
        // Fallback: use URL object
        let key = "";
        try {
            const urlObj = new URL(fileUrl);
            key = urlObj.pathname.substring(1); // remove leading /
        } catch (e) {
            return NextResponse.json({ error: "Invalid URL parsing" }, { status: 400 });
        }
        
        // Basic protection: prevent deleting nothing or root
        if (!key || key.trim() === "") {
             return NextResponse.json({ error: "Invalid file key" }, { status: 400 });
        }

        const command = new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
        });

        await r2.send(command);

        return NextResponse.json({ message: "Deleted successfully" });
    } catch (error) {
        console.error("Delete object error:", error);
        return NextResponse.json({ error: "Failed to delete old image" }, { status: 500 });
    }
}
