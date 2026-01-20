"use client";
import { useEffect, useState } from "react";
import { syncDatabase } from "@/lib/plaid/sync"

type Account = {
  accountId: string,
  name: string,
  amount: number,
  institution: string,
}

function convertToAccounts(arr: any[]): Account[] {
  const mapped: Account[] = arr.map((a) => {
    const curr: Account = {
      accountId: a.id,
      name: a.name,
      amount: a.amount,
      institution: a.plaidItem.institution,
    };
    return curr;
  })
  return mapped
}


export default function Dashboard() { // async
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [plaidItemInstitutions, setPlaidItemInstitutions] = useState<string[]>([]);

  async function loadAccounts() {
    const res = await fetch( "/api/prisma/accounts", { method: 'GET' });
    const data = await res.json();
    
    // TODO: may need to make sure data.accounts is in Account form
    setAccounts(convertToAccounts(data.accounts) ?? {});
  }

  useEffect(() => {
    void loadAccounts();

    const syncAccountInsitutions = async () => {
      for (const acc of accounts){
        if (!plaidItemInstitutions.includes(acc.institution)) {
          setPlaidItemInstitutions([ ...plaidItemInstitutions, acc.institution ]);
          await fetch("/api/plaid/sync", {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ institution: acc.institution }),
          });
        }
      }
    }
    
    void syncAccountInsitutions();
  }, []);

  // useEffect(() => {
  //   showAccounts(selectedAccounts);
  // }, [selectedAccounts]);

  

  return (
  <div>
      <ul>
        {accounts.filter((a) => selectedAccounts.includes(a.name))
        .map((a) => (
          <li key={a.accountId}>
            {a.name} — ${a.amount}
          </li>
        ))}
      </ul>
    </div>
  );
}
