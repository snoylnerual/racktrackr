import "server-only";
import { CompactEncrypt, compactDecrypt } from "jose";
import { getServerSession } from "next-auth/next";
import { plaidClient } from "@/lib/plaid/plaid"; // returns PlaidApi configured for env
import { options } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";


// holds what actually syncs with plaid to get the data and put it in neon database through prisma

// TODO: make sure to updates account balances and transactions
// TODO: allow for currencies other than dollars
// TODO: if cursor is not defined, then get everything
// TODO: if cursor is defined, start off at last place and store it

type PlaidTransaction = {
  transactionId: string;
  name: string;
  amount: number; 
  date: string; 
  pending: boolean;
  merchantName: string;
  category: string;
}

// TODO: write code for the initial sync when a new plaid account is linked

export async function syncDatabase(userId: string, institution: string) {
 
  const accounts = await prisma.plaidItem.findUnique({
      where: { userId, institution }, 
      select: { id: true, accessToken: true, accounts: true }
  }); 
  const accessToken = await decryptAccessToken(accounts.accessToken);

  // TODO: in case of a new account created or deleted, we need to iterate through accounts
  // and check whether they are there and if not, update the accounts table

  for (const acc of accounts.accounts) {
      let newCursor = acc.cursor;
      let hasMore = true;
      const allAdded: any[] = [];
      const allModified: any[] = [];
      const allRemoved: any[] = [];
      let response;
      while (hasMore) {
          if (newCursor) {
              response = await plaidClient.transactionsSync({
                  access_token: accessToken,
                  cursor: newCursor,
                  options: { account_id: acc.plaidAccountId },
              });
          }
          else {
              response = await plaidClient.transactionsSync({
                  access_token: accessToken,
                  options: { account_id: acc.plaidAccountId },
              });

          }

          const data = response.data;

          allAdded.push(...data.added);
          allModified.push(...data.modified);
          allRemoved.push(...data.removed);

          newCursor = data.next_cursor;
          hasMore = data.has_more;

          
      }
      await applyDatabaseUpdates(acc.id, userId, accounts.id, allAdded, allModified, allRemoved, newCursor);
      
  }

  const res = await plaidClient.accountsBalanceGet({
      access_token: accessToken,
  });

  for (const acc of res.data.accounts) {
    await applyBalanceUpdates(acc.account_id, acc.balances.current!)
  }
}

async function applyDatabaseUpdates(
    accountId: string, // internal DB id
    userId: string, // internal db user id
    itemId: string, // internal plaidItem id
    added: any[],
    modified: any[],
    removed: any[],
    newCursor: string
) {

  // TODO: RIGHT HERE need to convert added and modified to type PlaidTransaction

    const incoming = [...added, ...modified];

    const transactions = mapResponseToTransaction(incoming);

    const upserts = transactions.map((transaction) => {

      const data = {
        userId,
        plaidTransactionId: transaction.transactionId,
        itemId,
        accountId,
        name: transaction.name,
        amount: convertDollarToNumber(transaction.amount),
        date: convertStringToDate(transaction.date),
        pending: transaction.pending,
        category: transaction.category ?? null,
        merchantName: transaction.merchantName ?? null,
      }

      return prisma.transaction.upsert({
        where: { plaidTransactionId: transaction.transactionId },
        create: data,
        update: data,
      });
    });

    const deletes = removed.map((r) =>
    prisma.transaction.deleteMany({
      where: { plaidTransactionId: r.transaction_id },
    })
  );

  const cursorUpdate = prisma.account.update({
    where: { id: accountId },
    data: { cursor: newCursor },
  });

  // Run in a transaction to keep DB consistent
  await prisma.$transaction([
    ...upserts,
    ...deletes,
    cursorUpdate,
  ]);
};

async function applyBalanceUpdates( accountId: string, balance: number ) {
  const balanceNumber = convertDollarToNumber(balance)
  return prisma.account.update({
    where: { id: accountId },
    data: { amount: balanceNumber}
  })
}

async function encryptAccessToken(plainToken: string): Promise<string> {
    const key = new Uint8Array(Buffer.from(process.env.PLAID_TOKEN_ENC_KEY!, "base64url"));
    const enc = new TextEncoder().encode(plainToken);

    return await new CompactEncrypt(enc)
            .setProtectedHeader({ alg: "dir", enc: "A256GCM"})
            .encrypt(key)
}

async function decryptAccessToken(encryptedToken: string): Promise<string> {
    const key = new Uint8Array(Buffer.from(process.env.PLAID_TOKEN_ENC_KEY!, "base64url"));
    const plainToken = await compactDecrypt(encryptedToken, key);

    return new TextDecoder().decode(plainToken.plaintext);
}

function mapResponseToTransaction(response: any[]): PlaidTransaction[] {

  return response.map((transaction) => {
    // console.log(transaction)
    const result: PlaidTransaction = {
      transactionId: transaction.transaction_id,
      name: transaction.name,
      amount: transaction.amount,
      date: transaction.datetime ?? transaction.date,
      pending: transaction.pending,
      merchantName: transaction.merchant_name ?? "UNKNOWN",
      category: transaction.personal_finance_category?.primary ?? "MISC",
    };
    return result
  })
}

function convertDollarToNumber(dollarAmount: number): number {
  return Math.round(dollarAmount * 100);
}

function convertStringToDate(dateString: string): Date {
  return new Date(dateString);
}

export { convertDollarToNumber, convertStringToDate, mapResponseToTransaction, encryptAccessToken, decryptAccessToken }