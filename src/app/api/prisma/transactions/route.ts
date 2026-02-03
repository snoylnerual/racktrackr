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
        // const { transactionFilter } = await req.json();
        // const transactions = await prisma.transactions.findMany({ 
        //     where: {
        //         userId,
        //         date: {
        //             gte: new Date(transactionFilter.filter.start_date),
        //             lte: new Date(transactionFilter.filter.end_date),
        //         },
        //     }, 
        //     include: {
        //         account: {
        //             where: {
        //                 name: {in: transactionFilter.filter.institutionAccounts,},
        //             }
        //         }
        //     },
        //     select: {
        //         id: true,
        //         name: true,
        //         category: true,
        //         merchantName: true,
        //         amount: true,
        //     },
        //     orderBy: { date: transactionFilter.filter.orderBy[0] },
        //     take: transactionFilter.filter.count,
        // });


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


        // const transactions = await prisma.transaction.findMany({ 
        //     where: {
        //         userId,
        //         date: {
        //             gte: new Date(params.get("from")!),
        //             lte: new Date(params.get("to")!),
        //         },
        //         // (if params.get("category") && { catego }),
        //     },
        //     select: {
        //         id: true,
        //         name: true,
        //         category: true,
        //         merchantName: true,
        //         amount: true,
        //         date: true,
        //     },
        //     // orderBy: params.get("orderBy")!,
        //     take: 50,
        // });
        const from = new Date(params.get("from"));
        const to = new Date(params.get("to"));
        to.setUTCHours(23, 59, 59, 999);

        console.log(from)
        console.log(to)

        const transactions = await prisma.transaction.findMany({ 
            where: { 
                userId,
                date: {
                    gte: from!,
                    lte: to!,
                },
                category: { in: categories },
                account: { name: { in: accounts } },
                name: { 
                    contains: q,
                    mode: "insensitive",
                }
            },
            select: {
                id: true,
                name: true,
                category: true,
                merchantName: true,
                amount: true,
                date: true,
                account: { select: { name: true } },
            },
            orderBy: [{ date: "desc" }, { createdAt: "desc" }],
            // take: 100
        })


        // const transactions = await prisma.transaction.findMany({ 
        //     where: { userId },
        //     select: {
        //         id: true,
        //         name: true,
        //         category: true,
        //         merchantName: true,
        //         amount: true,
        //         date: true,
        //         account: { select: { name: true } },
        //     },
        //     take: 100
        // })
        // console.log("transactions here")
        // console.log(transactions)
        // console.log("transactions after")
        
        console.log("amount")
        console.log(transactions.length)

        return NextResponse.json({ transactions });
    }
    catch(error) {
        console.log(error)
        return NextResponse.json({ error: 'Error retrieving transactions' }, { status: 500 });
    }
};
        // TODO: filter plaidItems json for the institutions selected

        // TODO: for each plaidItem, retrieve data from them based on the filtering

        // TODO: select top of amount based on orderBy