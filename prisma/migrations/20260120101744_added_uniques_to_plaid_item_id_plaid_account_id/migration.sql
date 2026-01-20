/*
  Warnings:

  - A unique constraint covering the columns `[plaidAccountId]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[plaidItemId]` on the table `PlaidItem` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Account_plaidAccountId_key" ON "Account"("plaidAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "PlaidItem_plaidItemId_key" ON "PlaidItem"("plaidItemId");
