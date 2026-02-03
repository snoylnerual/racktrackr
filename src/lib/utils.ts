import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMoney(amount: number, currency = "USD") {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount/100);
  } catch {
    return `$${(amount/100).toFixed(2)}`;
  }
}

export function isoToday(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function isoNDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function mapTransactions(unmappedTransactions: any[]): Transaction[] {
  return unmappedTransactions.map((transaction) => ({
    transactionId: transaction.id,
    name: transaction.name,
    category: transaction.category,
    merchantName: transaction.merchantName,
    amount: transaction.amount,
    date: transaction.date,
    account: transaction.account.name,
  }));
}

export type Transaction = {
  transactionId: string;
  name: string;
  category: string | null;
  merchantName: string | null;
  amount: number; // cents
  date: Date;
  account: string;
};