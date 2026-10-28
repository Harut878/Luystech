import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

// <form action="/auth/signout" method="post"> — ադմինկայից և անձնական էջից
export async function POST(request: Request) {
  await destroySession();
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
