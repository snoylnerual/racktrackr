import "server-only";
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { options } from "@/lib/auth/options";


export async function POST(req: NextRequest) {
    const session = await getServerSession(options);
    const userId = session!.user!.id!;

    try {
        const { transactionFilter } = await req.json();
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
        const transactions = await prisma.transaction.findMany({ take: 30 })
        // console.log("transactions here")
        // console.log(transactions)
        // console.log("transactions after")

        return NextResponse.json({ transactions });
    }
    catch(error) {
        return NextResponse.json({ error: 'Error retrieving transactions' }, { status: 500 });
    }
};
        // TODO: filter plaidItems json for the institutions selected

        // TODO: for each plaidItem, retrieve data from them based on the filtering

        // TODO: select top of amount based on orderBy