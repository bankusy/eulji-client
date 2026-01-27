
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/service";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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

        const { filename, fileType } = await request.json();

        // Validate inputs
        if (!filename || !fileType) {
            return NextResponse.json({ error: "Missing filename or fileType" }, { status: 400 });
        }

        // Create unique key for the file
        const fileExt = filename.split('.').pop();
        const key = `avatars/${user.authUserId}-${Date.now()}.${fileExt}`;

        // Create PutObject command
        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
            ContentType: fileType,
        });

        // Generate Presigned URL (valid for 5 minutes)
        const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 300 });

        // Construct Public URL (using Custom Domain or R2 dev domain)
        // Ensure R2_PUBLIC_DOMAIN does not have a trailing slash
        const publicDomain = process.env.R2_PUBLIC_DOMAIN?.replace(/\/$/, "");
        const publicUrl = `${publicDomain}/${key}`;

        return NextResponse.json({ uploadUrl, publicUrl });
    } catch (error) {
        console.error("Presigned URL error:", error);
        return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
    }
}
