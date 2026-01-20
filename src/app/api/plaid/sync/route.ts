import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { options } from "@/lib/auth/options"; // your NextAuth options
import { prisma } from "@/lib/prisma";
import { syncDatabase } from "@/lib/plaid/sync";

export async function POST(req: NextRequest) {
  const session = await getServerSession(options);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session!.user!.id!;
  const { institution } = await req.json();

  try {
    await syncDatabase(userId, institution);
    return NextResponse.json({ ok: true });
  }
  catch(error) {
    return NextResponse.json({ error: 'Error syncing Database' }, { status: 500 });
  }
} 