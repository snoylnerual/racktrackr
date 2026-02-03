import "server-only";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { options } from "@/lib/auth/options";


export async function GET() {
    const session = await getServerSession(options);
    const userId = session!.user!.id!;

    try {
        const categories = await prisma.transaction.findMany({
            where: { userId },
            distinct: ["category"],
            select: { category: true },
        });

        return NextResponse.json({ categories });
    }
    catch(error) {
        return NextResponse.json({ error: 'Error retrieving transaction categories' }, { status: 500 });
    }
};
        