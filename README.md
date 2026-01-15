# racktrackr


Version 1.0

Auth
Plaid Link connected to the Sandbox
Transactions
Budgets (could be removed for MVP)
Dashboard


Version 2
Budgets
Goals
Gamification
Treats
Insight




Stack

Next.js
Route Handlers
Postgres (neon)
Prisma
Auth : NextAuth?
Recharts
Tailwind
shadcn/ui (?)
Background jobs? Vercel Cron ; Plaid Webhooks




User:
id, email, createdAt
Account:
 (from nextauth)
Session:
VerificationToken:



Plaid

PlaidItem: id, userId, itemId, accessTokenEncrypted, institutionName, createdAt

BankAccount: id, userId, plaidItemId, accountId, mask, name, type, subtype, currency, createdAt

Transaction: id, userId, accountId, plaidTransactionId, date, name/merchant, amount, isoCurrency, category, pending, updatedAt

PlaidSyncCursor: itemId, cursor, updatedAt

Budgeting + goals

Budget: id, userId, name, category (optional), cadence (monthly/weekly/custom), startDate, endDate (nullable), amountLimit

Goal: id, userId, name, targetAmount, targetDate (nullable for open-ended), priority, createdAt

GoalContributionRule (optional): goalId, monthlyContribution, fundingSourceCategory (optional)

Coaching / explainability outputs

MonthlySnapshot: userId, month (YYYY-MM), totalsByCategory (json), incomeTotal, spendTotal, netTotal

MonthExplanation: userId, month, comparedToMonth, summary, drivers (json array)

This makes your “explainability” a first-class feature (not a hacky UI string).