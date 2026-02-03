"use client";

import { useEffect, useState, useMemo } from "react";

// import { useEffect, useMemo, useState } from "react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";

// If you don’t have these yet:
// npx shadcn@latest add select table badge
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";

import { Fragment } from "react";
import { 
  formatMoney,
  isoNDaysAgo, 
  isoToday,
  mapTransactions,
  Transaction,
} from "@/lib/utils";

// type TransactionFilter = {
//     count: number,
//     institutionAccounts: string[],
//     start_date: string,
//     end_date: string,
//     orderBy: string[],
//     search: string,
// }
//     amount: 30,
//     institutionAccounts: ["RFCU-checking",],
//     start_date: "1-1-1900",
//     end_date: "1-1-2027",
//     orderBy: ["desc",],
//     search: "",



// TODO: implement cursor pagination for retrieving data
// GET will return a list of transactions and 'nextCursor'

// TODO: Have current filter state and new filter state
// When i do pagination searches and you click next page, i need to
// know what to search by still so that i get the correct output
// because if they change the search parameters but dont press search,
// they should not change (current filter) but new filter will be what the
// expected next filter should be
// Need to have a list of the cursors for each page as i go through them
// or maybe you sort opposite, like if it was descending then it is now ascending
// but with that cursor still
// need to include all filters within the cursor so we know where we are within the
// search, bc if you were to sort in a way that makes the ids not linear, you
// must need each value to actually filter correctly
// example of just date and id as the filters vvvvvvvvvvv
// WHERE
//   date < '2026-01-20'
//   OR (date = '2026-01-20' AND id < '5')
// ORDER BY date DESC, id DESC

// CURSOR = THE FULL ORDERING KEY OF THE LAST ROW YOU SAW
// so you actually dont need everything youre filtering by, just everything
// you are ordering by... needs more thought

// encode the cursor when you send it bc it makes url look nicer
// and it makes it where users cant tamper with them
// a raw cursor can reveal business logic and architecture.
// encoded is not encrypted, but it does help hide implementation details
// it is encoded on the server side and sent back to the client

// const cursor = {
//   date: lastRow.date.toISOString(),
//   id: lastRow.id,
// };

// const encoded = Buffer
//   .from(JSON.stringify(cursor))
//   .toString("base64");

// function decodeCursor(cursor?: string) {
//   if (!cursor) return null;

//   try {
//     const json = Buffer.from(cursor, "base64").toString("utf-8");
//     const parsed = JSON.parse(json);

//     if (!parsed.date || !parsed.id) return null;

//     return {
//       date: new Date(parsed.date),
//       id: parsed.id as string,
//     };
//   } catch {
//     return null;
//   }
// }


// export default function Transactions() {
//     const [transactions, setTransactions] = useState<Transaction[]>([]);
//     // const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
    
//     async function loadTransactions(filter: TransactionFilter) {
//         const res = await fetch("/api/prisma/transactions",
//             {
//                 method: 'POST',
//                 body: JSON.stringify({ filter }),
//                 headers: { "Content-Type": "application/json" }
//             }
//         )

//         const data = await res.json();
//         console.log(data.transactions.length)
//         const resultTransactions = mapTransactions(data.transactions)
//         setTransactions(data.transactions ?? []);
//     }         

//     // TODO: allow user to select filters
//     // TODO: implement filters in transactions
//     // TODO: only allow user's accounts within the bankinstitution accounts filter options
//     //          like i have a checking, saving, and credit card etc etc
 
//     useEffect(() => {
//         const filter: TransactionFilter = {
//             count: 10,
//             institutionAccounts: ["RFCU-checking",],
//             start_date: "1-1-1900",
//             end_date: "1-1-2027",
//             orderBy: ["desc",],
//             search: "",
//         }
//         loadTransactions(filter);
//         // console.log(transactions)
//     }, []);

    // useEffect(() => {
    //     loadTransactions(selectedTransactions);
    // }, [selectedTransactions]);

//     return (
//     <div>
//         <h1>Transactions</h1>
//         <ul>
//             {transactions.map((t) => (
//                 <li key={t.id}>
//                     ${t.amount / 100} - {t.name} - {t.merchantName} - {t.category}
//                 </li>
//             ))}
//         </ul>
//     </div>
//   )
// }

// TODO: Sync now button to get data from plaid bank connection link


function mapCategories(unmappedCategories: any[]): string[] {
  return unmappedCategories.map((category) => {
    return category.category;
    // return {
    //   name: category,
    // }
  });
}

function mapAccounts(unmappedAccounts: any[]): AccountOption[] {
  return unmappedAccounts.map((account) => {
    return {
      id: account.id,
      name: account.name,
    }
  });
}

function formatDate(date: Date) {
  console.log(date)
  return new Intl.DateTimeFormat("en-US").format(new Date(date))
}

type AccountOption = {
  id: string;
  name: string;
  // mask?: string | null;
};


export default function TransactionsPage() {
  // Filters
  const [q, setQ] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [accountIds, setAccountIds] = useState<string[]>([]);
  const [from, setFrom] = useState<string>(isoNDaysAgo(30));
  const [to, setTo] = useState<string>(isoToday());
  const [orderBy, setOrderBy] = useState<string>("desc");

  const [currQ, setCurrQ] = useState("");
  const [currCategories, setCurrCategories] = useState<string[]>([]);
  const [currAccountIds, setCurrAccountIds] = useState<string[]>([]);
  const [currFrom, setCurrFrom] = useState<string>(isoNDaysAgo(30));
  const [currTo, setCurrTo] = useState<string>(isoToday());
  const [currOrderBy, setCurrOrderBy] = useState<string>("desc");

  // Options
  const [categories, setCategories] = useState<string[]>([]);
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [accountsList, setAccountsList] = useState<string[]>([]);

  // Data
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const anchor = useComboboxAnchor()

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (selectedCategories){
      selectedCategories.forEach((c) => params.append("category", c))
    }
    if (accountIds){
      accountIds.forEach((a) => params.append("account", a))
    }
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (orderBy) params.set("orderBy", orderBy);
    return params.toString();
  }, [q, selectedCategories, accountIds, from, to, orderBy]);

  // Load filter options on mount
  useEffect(() => {
    let mounted = true;

    async function loadOptions() {
      try {
        const [catRes, accRes] = await Promise.all([
          fetch("/api/prisma/transactions/categories"),
          fetch("/api/prisma/accounts"),
        ]);

        if (catRes.ok) {
          const data = await catRes.json();
          if (mounted) {
            const mappedCategories: string[] = mapCategories(data.categories) ?? [];
            setCategories(mappedCategories);
            setSelectedCategories(mappedCategories);
          }
        }

        if (accRes.ok) {
          const data = await accRes.json();
          if (mounted) {
            const mappedAccounts: AccountOption[] = mapAccounts(data.accounts);
            setAccounts(mappedAccounts ?? []);
            const aList = mappedAccounts.map((a) => {
              return a.name
            });
            setAccountIds(aList);
            setAccountsList(aList);
          }
        }
      } catch {
        // ok to ignore; page still works without dropdown options
      }
    }

    loadOptions();
    return () => {
      mounted = false;
    };
  }, []);

  // Load transactions when filters change
  useEffect(() => {
    let mounted = true;

    async function loadTransactions() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/prisma/transactions?${queryString}`, { method: "GET" });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { message?: string };
          throw new Error(data.message || "Failed to load transactions.");
        }

        const data = (await res.json()) as { transactions: Transaction[] };
        if (mounted) setTransactions(mapTransactions(data.transactions) ?? []);
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : "Failed to load transactions.");
        if (mounted) setTransactions([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadTransactions();
    return () => {
      mounted = false;
    };
  }, [refreshKey, queryString]);


  // TODO: fix resetFilters implementation
  // requires solidifying used filter names
  // and whether I use responsive database searches
  function resetFilters() {
    setQ("");
    // setCategory("all");
    // setAccountId("all");
    // setFrom(isoNDaysAgo(30));
    // setTo(isoToday());
  }

  function handleSearchClick() {
    setCurrQ(q)
    setCurrCategories(selectedCategories)
    setCurrAccountIds(accountsList)
    setCurrFrom(from)
    setCurrTo(to)
    setCurrOrderBy(orderBy)
    setRefreshKey(c => c+1)
  }

  const { status } = useSession();
  
  if (status === "loading") {
    return <span>Loading...</span>;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-pastelgreen to-muted px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
            <p className="text-sm text-muted-foreground">
              All transactions across all connected accounts.
            </p>
          </div>

          <Button variant="outline" onClick={resetFilters}>
            Reset filters
          </Button>
        </header>

        {/* Filters */}
        <Card className="p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {/* Search */}
            <div className="space-y-2"> 
              {/* lg:col-span-2 */}
              <label className="text-sm font-medium">Search</label>
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name or merchant…"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Combobox
                multiple
                autoHighlight
                items={categories}
                value={selectedCategories}
                onValueChange={(v) => setSelectedCategories(v as string[])}
              >
                <ComboboxChips ref={anchor} className="w-full max-w-xs">
                  <ComboboxValue>
                    {(values) => (
                      <Fragment>
                        {values.map((value: string) => (
                          <ComboboxChip key={value}>{value}</ComboboxChip>
                        ))}
                        <ComboboxChipsInput />
                      </Fragment>
                    )}
                  </ComboboxValue>
                </ComboboxChips>
                <ComboboxContent anchor={anchor}>
                  <ComboboxEmpty>No items found.</ComboboxEmpty>
                  <ComboboxList>
                    {(item) => (
                      <ComboboxItem key={item} value={item}>
                        {item}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>

            </div>

            {/* Account */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Account</label>
              <Combobox
                multiple
                autoHighlight
                items={accountsList}
                value={accountIds}
                onValueChange={(v) => setAccountIds(v as string[])}
              >
                <ComboboxChips ref={anchor} className="max-w-full overflow-hidden pr-7">
                  <ComboboxValue>
                    {(values) => (
                      <Fragment>
                        {values.map((value: string) => (
                          <ComboboxChip key={value}>{value}</ComboboxChip>
                        ))}
                        <ComboboxChipsInput />
                      </Fragment>
                    )}
                  </ComboboxValue>
                </ComboboxChips>
                <ComboboxContent anchor={anchor}>
                  <ComboboxEmpty>No items found.</ComboboxEmpty>
                  <ComboboxList>
                    {(item) => (
                      <ComboboxItem key={item} value={item} >
                        {item}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>

            {/* Date range */}
            <div className="space-y-2">
              <label className="text-sm font-medium">From</label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">To</label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            Tip: search is great for merchants like “Amazon” or “Target”.
          </p>

          <Button onClick={handleSearchClick} disabled={loading}>
            Search
          </Button>
        </Card>

        {/* Table */}
        <section className="space-y-3">
          {error ? (
            <Card className="border-destructive/30 bg-destructive/10 p-4">
              <p className="text-sm text-destructive">{error}</p>
            </Card>
          ) : null}

          <Card className="p-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[110px]">Date</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                      Loading transactions…
                    </TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                      No transactions found for these filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((t) => {
                    const currency = "USD"; // t.currency ??
                    const accountLabel = `${t.account}`; //${t.account.mask ? ` •••• ${t.account.mask}` : ""}`;
                    const displayName = t.merchantName ? `${t.merchantName} — ${t.name}` : t.name;

                    return (
                      <TableRow key={t.transactionId}>
                        <TableCell className="text-sm">{formatDate(t.date)}</TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{displayName}</span>
                            {/* {t.pending ? <Badge variant="secondary">Pending</Badge> : null} */}
                          </div>
                        </TableCell>

                        <TableCell className="text-sm text-muted-foreground">{accountLabel}</TableCell>
                        <TableCell className="text-sm">
                          {t.category ? <Badge variant="outline">{t.category}</Badge> : "—"}
                        </TableCell>

                        <TableCell className="text-right font-medium">
                          {formatMoney(t.amount, currency)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Card>

          <p className="text-xs text-muted-foreground">
            Next step: add pagination + export CSV.
          </p>
        </section>
      </div>
    </main>
  );
}
