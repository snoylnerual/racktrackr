import "server-only";
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { options } from "@/lib/auth/options";
import { includes } from "zod";


export async function GET() {
    const session = await getServerSession(options);
    const userId = session!.user!.id!;

    try {
        const accounts = prisma.account.findMany({ 
            where: {
                userId,
            }, 
            select: {
                id: true,
                name: true,
                amount: true,
                plaidItem: {
                    select: {
                        institution: true,
                    },
                }
            },
        });

        return NextResponse.json({ accounts });
    }
    catch(error) {
        return NextResponse.json({ error: 'Error retrieving accounts' }, { status: 500 });
    }
       
}
