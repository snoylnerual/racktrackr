import { NextRequest, NextResponse } from 'next/server';
import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';
import { getServerSession } from "next-auth/next";
import { options } from "@/lib/auth/options";

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
export async function POST() {
  try {
    const session = await getServerSession(options);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized: missing session user id" }, { status: 401 });
    }
    
    const client_user_id = session!.user!.id!;
    // const { client_user_id } = await req.json();
    const response = await client.linkTokenCreate({
      user: { client_user_id },
      client_name: 'racktrackr',
      products: [
        Products.Auth,
        Products.Transactions,
      ],
      country_codes: [CountryCode.Us],
      language: 'en',
    });
    return NextResponse.json({ link_token: response.data.link_token });
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: 'Error generating link token' }, { status: 500 });
  }
}