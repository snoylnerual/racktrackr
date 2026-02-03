import "server-only";
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { options } from "@/lib/auth/options";
import { ca } from "zod/v4/locales";


export async function GET(req: NextRequest) {
    const session = await getServerSession(options);
    const userId = session!.user!.id!;

    try {
        const url = new URL(req.url);
        const params = url.searchParams;
        console.log(params)
        const categories = params.getAll("category")
        console.log("categories")
        console.log(categories)
        // if (!categories) categories = [null]
        const accounts = params.getAll("account")
        console.log("accounts")
        console.log(accounts)
        const q: string = params.get("q") ?? ""
        // console.log(params.get("category"));
        // console.log(params.get("orderBy"));

        const from = new Date(params.get("from"));
        const to = new Date(params.get("to"));
        to.setUTCHours(23, 59, 59, 999);

        console.log(from)
        console.log(to)

        const monthSums = await prisma.transaction.groupBy({
            by: ["category"], 
            where: { 
                userId,
                date: {
                    gte: from!,
                    lte: to!,
                },
                // category: { in: categories },
                // account: { name: { in: accounts } },
                name: { 
                    contains: q,
                    mode: "insensitive",
                },
                pending: false,
                amount: { gt: 0 }, // spending only
            },
            _sum: { amount: true },
            orderBy: {
                _sum: {
                    amount: "desc",
                },
            },
        })
        
        // console.log("amount")
        // console.log(transactions.length)

        return NextResponse.json({ monthSums });
    }
    catch(error) {
        console.log(error)
        return NextResponse.json({ error: 'Error calculating category sums.' }, { status: 500 });
    }
};
        // TODO: filter plaidItems json for the institutions selected

        // TODO: for each plaidItem, retrieve data from them based on the filtering

        // TODO: select top of amount based on orderBy