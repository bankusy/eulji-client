
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/service";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

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
        const user = await getAuthenticatedUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { fileUrl } = await request.json();

        if (!fileUrl) {
            return NextResponse.json({ error: "Missing fileUrl" }, { status: 400 });
        }

        // Validate that the URL belongs to our R2 bucket to prevent deleting external resources
        const publicDomain = process.env.R2_PUBLIC_DOMAIN?.replace(/\/$/, "");
        if (!fileUrl.startsWith(publicDomain)) {
            // Not our file, so we skip deletion (not an error)
            return NextResponse.json({ message: "Skipped deletion (external URL)" });
        }

        // Extract key from URL
        // URL format: https://<public-domain>/<key>
        const key = fileUrl.replace(`${publicDomain}/`, "");

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
