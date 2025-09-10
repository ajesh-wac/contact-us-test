import { NextRequest, NextResponse } from "next/server";

// Your API route at /api/verify-recaptcha/route.ts
export async function POST(req: NextRequest) {
  const { token } = await req.json();
  
  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
  });
  
  const data = await res.json();
  
  if (data.success) {
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}