import { NextRequest, NextResponse } from 'next/server'; 
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { getServerSession } from "next-auth/next";
import { options } from "@/lib/auth/options";
import { Plaid } from 'react-plaid-link';
import { prisma } from "@/lib/prisma";
import { convertDollarToNumber, convertStringToDate, mapResponseToTransaction, encryptAccessToken } from "@/lib/plaid/sync"

const config = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV as keyof typeof PlaidEnvironments],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID || '',
      'PLAID-SECRET': process.env.PLAID_SECRET || '',
    },
  },
});
const client = new PlaidApi(config);
export async function POST(req: NextRequest) {
  const { public_token } = await req.json();
  console.log(public_token)
  try {
    console.log("Here at 1")
    const response = await client.itemPublicTokenExchange({ public_token });
    console.log("Here at 2")
    const { access_token, item_id } = response.data;
    console.log("Here at 3")
    await putAccessToken(access_token, item_id, client);
    console.log("Here at 13")
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.log(error)
    console.error("Plaid exchange error:", error?.response?.data ?? error);
    return NextResponse.json({ error: 'Error exchanging public token' }, { status: 500 });
  }
}


async function putAccessToken(access_token: string, item_id: string, client: PlaidApi) {
  const session = await getServerSession(options);
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  console.log("Here at 4")
  
  const userId = session.user.id;

  console.log("Here at 5")
  // TODO: encrypt access_token
  const encryptedAccessToken = await encryptAccessToken(access_token)
  const item = await prisma.plaidItem.create({
    data: {
      plaidItemId: item_id,
      // userId,
      user: { connect: { id: userId } },
      accessToken: encryptedAccessToken,
      institution: "temp",
    }
  })
  console.log("Here at 6")
  await firstPlaidDataLoad(access_token, item.id, userId)
}



async function firstPlaidDataLoad(access_token: string, plaidItemId: string, userId: string) {

  const response = await client.accountsGet({ access_token });

  const { item, accounts } = response.data;
  const institution = item.institution_name;

  console.log("Here at 7")
  await prisma.plaidItem.update({
    where: { id: plaidItemId },
    data: { institution }
  });

  console.log("Here at 8")    
  const creates = accounts.map((a) => {
    // console.log(a)
    return prisma.account.create({
      data: {
        plaidAccountId: a.account_id,
        amount: convertDollarToNumber(a.balances.current!),
        name: a.name,
        // userId,
        // plaidItemId,
        user: { connect: { id: userId } },
        plaidItem: { connect: { id: plaidItemId } },
        cursor: "",
      }
    })

  });
  console.log("Here at 9")
  const createdAccounts = await prisma.$transaction(creates);
  console.log("Here at 10")
  for (const acc of createdAccounts) {
    const allAdded: any[] = [];
    let response = await client.transactionsSync({
        access_token,
        options: { account_id: acc.plaidAccountId },
    });

    allAdded.push(...response.data.added)
    let hasMore = response.data.has_more;
    let cursor = response.data.next_cursor;

    while (hasMore) {
      response = await client.transactionsSync({
          access_token: access_token,
          cursor: cursor,
          options: { account_id: acc.plaidAccountId },
      });

      allAdded.push(...response.data.added)
      hasMore = response.data.has_more;
      cursor = response.data.next_cursor;
    }
    console.log("Here at 11")
    const transactions = mapResponseToTransaction(allAdded);
    // console.log(transactions)
    console.log("1-------------------------------------------------------------------------------------")
    const inserts = transactions.map((transaction) => {
      // console.log(transaction)
      const data = {
          // userId,
          user: { connect: { id: userId } },
          plaidTransactionId: transaction.transactionId,
          itemId: plaidItemId,
          // accountId: acc.account_id,
          account: { connect: { id: acc.id } },
          name: transaction.name,
          amount: convertDollarToNumber(transaction.amount),
          date: convertStringToDate(transaction.date),
          pending: transaction.pending,
          category: transaction.category ?? null,
          merchantName: transaction.merchantName ?? null,
      }
      // console.log(data)
      // console.log(acc.id)
      // console.log(userId)
      // console.log("--")
      return prisma.transaction.create({ data });
    })
    console.log("2-------------------------------------------------------------------------------------")
    console.log("Here at 12")
    await prisma.$transaction(inserts);
  }
}