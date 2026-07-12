import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { randomUUID } from "crypto";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin, LISTING_PHOTOS_BUCKET } from "@/lib/supabase";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const MAX_BYTES = 5 * 1024 * 1024;
const MAX_FILES = 6;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SELLER") {
    return NextResponse.json({ error: "Only sellers can upload photos." }, { status: 403 });
  }

  const formData = await req.formData();
  const files = formData.getAll("files").filter((f): f is File => f instanceof File);

  if (files.length === 0) {
    return NextResponse.json({ error: "No files provided." }, { status: 400 });
  }

  if (files.length > MAX_FILES) {
    return NextResponse.json(
      { error: `You can upload up to ${MAX_FILES} photos per listing.` },
      { status: 400 }
    );
  }

  for (const file of files) {
    if (!ALLOWED_TYPES[file.type]) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload JPEG, PNG, or WEBP images." },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Each image must be smaller than 5MB." }, { status: 400 });
    }
  }

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch {
    return NextResponse.json(
      { error: "Photo uploads are not configured on this server." },
      { status: 500 }
    );
  }

  const urls: string[] = [];

  for (const file of files) {
    const extension = ALLOWED_TYPES[file.type];
    const filename = `${randomUUID()}.${extension}`;
    const bytes = Buffer.from(await file.arrayBuffer());

    const { error } = await supabase.storage
      .from(LISTING_PHOTOS_BUCKET)
      .upload(filename, bytes, { contentType: file.type, upsert: false });

    if (error) {
      return NextResponse.json({ error: `Upload failed: ${error.message}` }, { status: 500 });
    }

    const { data } = supabase.storage.from(LISTING_PHOTOS_BUCKET).getPublicUrl(filename);
    urls.push(data.publicUrl);
  }

  return NextResponse.json({ urls });
}
