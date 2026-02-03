"use client";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

// TODO: different charts
// the plan is to do a modular dashboard where you can choose which 
// charts best work for you and save them off. The saving off will
// most likely start with one front page that has static dashboard
// choices. Then I would like to add the possibility to choose from
// a selection of many charts. Then the possibility to add some 
// custom charts. Then the possibility to move them around and the
// last charts that you had on your dashboard will stay there.
// Then hopefully different sets of dashboards that you can save off
// and click to pull up. You would have a maximum of different
// dashboards you could create.

// Example charts
// Spending over time trend line (day, month, year)
// spending over time bar chart (day, month, year)
    // possibly be able to click the (day,month,year) and have all
    // of the transactions pull up on a separate page
// pie chart for categorical spending
// overall account balance
// overall plus and minus for accounts
// savings line chart
// budget progress bars

// start with recharts, possibly explore charts.js, and finally do d3.js
// d3.js works good for custom visuals but has a steep learning curve
// victory id good for data analytics
// nivo is good for pretty dashboards

// TODO: add other filters like categories and accounts
// TODO: add api call for the categories and accounts filters
// TODO: add an option to collapse filters section

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Sector,
  PieSectorShapeProps,
} from "recharts";

import { 
  formatMoney,
  isoNDaysAgo, 
  isoToday,
  mapTransactions,
  Transaction,
} from "@/lib/utils";

function monthKey(d: Date) {
  const dt = new Date(d);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}`;
}

function monthLabel(yyyyMm: string) {
  // "2026-01" -> "Jan 2026"
  const [yyyy, mm] = yyyyMm.split("-");
  const dt = new Date(Number(yyyy), Number(mm) - 1, 1);
  return dt.toLocaleString("en-US", { month: "short", year: "numeric" });
}

function mapMonthYear(unmappedDate: string) {
  const dt = new Date(unmappedDate);
  return dt.toLocaleString("en-US", { month: "short", year: "numeric" });
}

const PIE_COLORS = [
  "hsl(var(--chart-1, 142 76% 36%))",
  "hsl(var(--chart-2, 221 83% 53%))",
  "hsl(var(--chart-3, 262 83% 58%))",
  "hsl(var(--chart-4, 24 94% 50%))",
  "hsl(var(--chart-5, 0 84% 60%))",
];

type categorySum = {
//   [
//   {
//     category: "Food",
//     _sum: { amount: 12345 },
//   },
//   {
//     category: "Rent",
//     _sum: { amount: 95000 },
//   },
// ]

  category: string;
  sum: number;
}

function mapCategorySums(unmappedSums: any[]): categorySum[] {
  return unmappedSums.map((s) => {
    return {
      category: s.category,
      sum: s._sum.amount,
    }
  });
}

export default function Dashboard() {
  const { status } = useSession();

  // Top search space
  const [q, setQ] = useState("");
  const [from, setFrom] = useState<string>(isoNDaysAgo(180));
  const [to, setTo] = useState<string>(isoToday());

  // Data
  const [categorySums, setCategorySums] = useState<categorySum[]>([]);
  const [monthSums, setMonthSums] = useState<categorySum[]>([]);
  const [totalSum, setTotalSum] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // If you want "search only runs when user clicks",
  // keep a "refreshKey" like your TransactionsPage.
  const [refreshKey, setRefreshKey] = useState(0);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    // You can also add selectedCategories/account filters later if you want.
    return params.toString();
  }, [q, from, to]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/prisma/analytics/spending/by-category?${queryString}`, {
          method: "GET",
        });

        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { message?: string };
          throw new Error(data.message || "Failed to load dashboard data.");
        }

        const data = await res.json();
        if (mounted) {
          setCategorySums(mapCategorySums(data.categorySums) ?? []);
          setTotalSum(data.totalSum);
        } 
      
      
        const res2 = await fetch(`/api/prisma/analytics/spending/monthly?${queryString}`, {
          method: "GET",
        });

        if (!res2.ok) {
          const data2 = (await res2.json().catch(() => ({}))) as { message?: string };
          throw new Error(data2.message || "Failed to load dashboard data.");
        }

        const data2 = await res2.json();
        if (mounted) setMonthSums(mapCategorySums(data2.monthSums) ?? []); // mapTransactions(data.transactions ?? []));
      
      } catch (e) {
        if (mounted) {
          setError(e instanceof Error ? e.message : "Failed to load dashboard data.");
          setMonthSums([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [queryString, refreshKey]);

  function reset() {
    setQ("");
    setFrom(isoNDaysAgo(180));
    setTo(isoToday());
    setRefreshKey((c) => c + 1);
  }

  function runSearch() {
    setRefreshKey((c) => c + 1);
  }

  const pieData = useMemo(() => {
    return categorySums.map((r) => ({
      name: r.category,
      value: r.sum,
      pct: ((r.sum / totalSum) * 100),
    }));
  }, [categorySums]);

  const coloredPie = (props: PieSectorShapeProps) => {
  return <Sector {...props} fill={PIE_COLORS[props.index % PIE_COLORS.length]} />;
};

  // const monthlyRows = useMemo(() => {
  //   const map = new Map<string, number>();
  //   for (const t of spendTxns) {
  //     const key = monthKey(t.date);
  //     map.set(key, (map.get(key) ?? 0) + t.amount);
  //   }

  //   // sort by key ascending, take last 6
  //   const sorted = Array.from(map.entries())
  //     .sort(([a], [b]) => a.localeCompare(b))
  //     .map(([yyyyMm, amountCents]) => ({
  //       monthKey: yyyyMm,
  //       month: monthLabel(yyyyMm),
  //       amountCents,
  //     }));

  //   return sorted.slice(Math.max(0, sorted.length - 6));
  // }, [spendTxns]);

  // ---------- UI ----------
  if (status === "loading") return <span>Loading...</span>;

  return (
    <main className="min-h-screen bg-gradient-to-b from-pastelgreen to-muted px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header (same style as your Transactions page) */}
        <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Spend breakdown by category and recent monthly totals.
            </p>
          </div>

          <Button variant="outline" onClick={reset}>
            Reset
          </Button>
        </header>

        {/* Search space at the top */}
        <Card className="p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2 md:col-span-1">
              <label className="text-sm font-medium">Search</label>
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by merchant, name, category…"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">From</label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">To</label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            {/* <p className="text-xs text-muted-foreground">
              Chart Data Information
            </p> */}

            <Button onClick={runSearch} disabled={loading}>
              Search
            </Button>
          </div>
        </Card>

        {error ? (
          <Card className="border-destructive/30 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">{error}</p>
          </Card>
        ) : null}

        {/* Bottom space with two charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Category chart */}
          <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Spending by category</h2>
                <p className="text-sm text-muted-foreground">
                  Percent of total spend, with amounts.
                </p>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Total spend</div>
                <div className="text-sm font-semibold">{formatMoney(totalSum)}</div>
              </div>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="h-64">
                {loading ? (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    Loading…
                  </div>
                ) : pieData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    No spending data in this range.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={2}
                        shape={coloredPie}
                      />
                      <Tooltip
                        formatter={(val: any, name: any) => {
                          const v = Number(val) || 0;
                          const pct = totalSum > 0 ? (v / totalSum) * 100 : 0;
                          return [`${formatMoney(v)} • ${pct.toFixed(1)}%`, String(name)];
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Legend: category name + price below */}
              <div className="space-y-3">
                {categorySums.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nothing to show yet.</p>
                ) : (
                  pieData.map((s, index) => (
                    <div key={s.name} className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">
                          {s.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatMoney(s.value)}
                        </div>
                      </div>
                      <div className="text-sm font-semibold tabular-nums">
                        {s.pct.toFixed(1)}%
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>

          {/* Monthly bar chart */}
          <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Monthly spending</h2>
                <p className="text-sm text-muted-foreground">
                  Last few months (spend only).
                </p>
              </div>
            </div>

            <div className="mt-6 h-72">
              {loading ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Loading…
                </div>
              ) : monthSums.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No monthly spend data in this range.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthSums}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} interval={0}/>
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => formatMoney(Number(v))}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(val: any) => formatMoney(Number(val))}
                      labelFormatter={(label) => String(label)}
                    />
                    <Bar dataKey="sum" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
