import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  // only logged-in staff should be able to burn server resources parsing files
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const name = file.name.toLowerCase();

  try {
    if (name.endsWith(".docx")) {
      const result = await mammoth.extractRawText({ buffer });
      return NextResponse.json({ text: result.value });
    }
    if (name.endsWith(".pdf")) {
      const pdfParse = (await import("pdf-parse")).default; // dynamic import — this package misbehaves at build time otherwise
      const result = await pdfParse(buffer);
      return NextResponse.json({ text: result.text });
    }
    return NextResponse.json({ error: "Only .docx or .pdf files are supported (old .doc files need saving as .docx first)" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Couldn't read that file" }, { status: 500 });
  }
}