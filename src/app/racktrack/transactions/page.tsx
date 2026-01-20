"use client";

import { useEffect, useState } from "react";

type Transaction = {
  transactionId: string,
  name: string,
  category: string,
  merchantName: string,
  amount: number,
}

type TransactionFilter = {
    count: number,
    institutionAccounts: string[],
    start_date: string,
    end_date: string,
    orderBy: string[],
    search: string,
}
//     amount: 30,
//     institutionAccounts: ["RFCU-checking",],
//     start_date: "1-1-1900",
//     end_date: "1-1-2027",
//     orderBy: ["desc",],
//     search: "",


export default function Transactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    // const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
    
    async function loadTransactions(filter: TransactionFilter) {
        const res = await fetch("/api/prisma/transactions",
            {
                method: 'POST',
                body: JSON.stringify({ filter }),
                headers: { "Content-Type": "application/json" }
            }
        )

        const data = await res.json();
        console.log(data.transactions.length)
        const resultTransactions = mapTransactions(data.transactions)
        setTransactions(data.transactions ?? []);
    }         

    // TODO: allow user to select filters
    // TODO: implement filters in transactions
    // TODO: only allow user's accounts within the bankinstitution accounts filter options
    //          like i have a checking, saving, and credit card etc etc
 
    useEffect(() => {
        const filter: TransactionFilter = {
            count: 10,
            institutionAccounts: ["RFCU-checking",],
            start_date: "1-1-1900",
            end_date: "1-1-2027",
            orderBy: ["desc",],
            search: "",
        }
        loadTransactions(filter);
        // console.log(transactions)
    }, []);

    // useEffect(() => {
    //     loadTransactions(selectedTransactions);
    // }, [selectedTransactions]);

    return (
    <div>
        <h1>Transactions</h1>
        <ul>
            {transactions.map((t) => (
                <li key={t.id}>
                    ${t.amount / 100} - {t.name} - {t.merchantName} - {t.category}
                </li>
            ))}
        </ul>
    </div>
  )
}

// TODO: Sync now button to get data from plaid bank connection link


function mapTransactions(unmappedTransactions: any[]): Transaction[] {
    return unmappedTransactions.map((transaction) => {
        return {
            transactionId: transaction.id,
            name: transaction.name,
            category: transaction.category,
            merchantName: transaction.merchantName,
            amount: transaction.amount,
        }
    });
}