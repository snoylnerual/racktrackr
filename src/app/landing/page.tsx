"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useRef } from "react";
import { usePlaidLink } from "react-plaid-link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type AccountBalance = {
  id: string;
  name: string;
  amount: number;
  institution: string;
};

function mapToAccountBalance(arr: any[]): AccountBalance[] {
  return arr.map((a) => {
    const curr: AccountBalance = {
      id: a.id,
      name: a.name,
      amount: a.amount,
      institution: a.plaidItem.institution,
    }
    return curr
  })
}

function formatMoney(amount: number, currency = "USD") {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}

export default function LandingPage() {
  const [accounts, setAccounts] = useState<AccountBalance[] | null>(null);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [refetchKey, setRefetchKey] = useState(0);
  const ran = useRef(false);  
  const hasBanks = useMemo(() => (accounts?.length ?? 0) > 0, [accounts]);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    async function createToken() {

      try {
        const res = await fetch("/api/plaid/create-link-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error ?? "Failed to create link token");
        }

        setLinkToken(data.link_token);
      } catch (e: any) {
        console.log(e?.message ?? "Error generating link token");
        setLinkToken(null);
      }
    }
    createToken()
  }, []);

  const onSuccess = async (public_token: string) => {
    try {
      // console.log("Running exchange")
      await fetch('/api/plaid/exchange-token', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_token }),});
      // console.log("Finish exchange")
    } catch (error) {
      console.error('Error exchanging public token:', error);
    }
    setRefetchKey((k) => k+1);
  };

    const { open, ready } = usePlaidLink({
    token: linkToken ?? null,
    onSuccess,
  });

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoadingAccounts(true);
      setError(null);
      try {
        const res = await fetch("/api/prisma/accounts", { method: "GET" });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Failed to load accounts.");
        }
        const data = await res.json();
        if (isMounted) setAccounts(mapToAccountBalance(data.accounts) ?? []);
        
        console.log(accounts)
      } catch (e) {
        if (isMounted) setError(e instanceof Error ? e.message : "Failed to load accounts.");
        if (isMounted) setAccounts([]);
      } finally {
        if (isMounted) setLoadingAccounts(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [refetchKey]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-pastelgreen to-muted px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome to racktrackr</h1>
            <p className="text-sm text-muted-foreground">
              Your hub for budgets, dashboards, and transactions.
            </p>
          </div>

          <Button variant="default" className="bg-pine">
            Settings
          </Button>
        </header>

        {/* Accounts row */}
        <section className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-semibold">Account balances</h2>
            {loadingAccounts ? (
              <span className="text-sm text-muted-foreground">Loading…</span>
            ) : null}
          </div>

          {error ? (
            <Card className="border-destructive/30 bg-destructive/10 p-4">
              <p className="text-sm text-destructive">{error}</p>
            </Card>
          ) : null}

          {/* If no banks connected */}
          {!loadingAccounts && !hasBanks ? (
            <Card className="p-6">
              <h3 className="text-lg font-semibold">Get started by adding a bank</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Connect your Bank through Plaid to securely import transactions and see dashboards.
              </p>
              <div className="mt-4">
                <Button 
                  onClick={() => open()}
                  disabled={!ready || !linkToken} 
                  className="bg-pine"
                >
                  Connect a bank with Plaid
                </Button>
              </div>
            </Card>
          ) : null}

          {/* Accounts grid */}
          {hasBanks ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {accounts!.map((a) => {
                const currency = "USD"; // isoCurrencyCode 
                return (
                  <Card key={a.id} className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="mt-1 text-base font-semibold">{a.name}</h3>
                        <p className="text-sm text-muted-foreground">{a.institution}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Current</p>
                        <p className="text-xl font-bold">{formatMoney(a.amount, currency)}</p>
                        {typeof a.amount === "number" ? (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Available: {formatMoney(a.amount, currency)}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : null}
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Explore</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <NavCard
              title="Dashboard"
              description="Charts, trends, and month-to-month explanations."
              href="/racktrack/dashboard"
              disabled={!hasBanks}
            />
            <NavCard
              title="Budgets"
              description="Create budgets (time-based or open-ended) and track progress."
              href="/racktrack/budgets"
              disabled={!hasBanks}
            />
            <NavCard
              title="Transactions"
              description="Search and filter transactions imported from Plaid."
              href="/racktrack/transactions"
              disabled={!hasBanks}
            />
          </div>

          {!loadingAccounts && !hasBanks ? (
            <p className="text-sm text-muted-foreground">
              Connect a bank to unlock dashboards, budgets, and transactions.
            </p>
          ) : null}
        </section>

        {/* Add another bank */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Banks</h2>
          <Card className="p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-semibold">Add another bank</h3>
                <p className="text-sm text-muted-foreground">
                  Link more accounts to improve accuracy of budgets and insights (Plaid Sandbox).
                </p>
              </div>
              <Button 
                onClick={() => open()}
                disabled={!ready || !linkToken} 
                className="bg-pine text-white"
                variant="outline"
              >
                Connect with Plaid
              </Button>
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}

function NavCard({
  title,
  description,
  href,
  disabled,
}: {
  title: string;
  description: string;
  href: string;
  disabled?: boolean;
}) {
  return (
    <Card className="p-6">
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>

      <div className="mt-4">
        {disabled ? (
          <Button className="w-full bg-graygreen" disabled>
            No data yet
          </Button>
        ) : (
          <Button className="w-full bg-pine" asChild>
            <Link href={href}>Open {title}</Link>
          </Button>
        )}
      </div>
    </Card>
  );
}
