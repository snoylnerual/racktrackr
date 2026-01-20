/*
  Warnings:

  - You are about to drop the column `note` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `plaidToken` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[plaidTransactionId]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accountId` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itemId` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pending` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `plaidTransactionId` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "note",
ADD COLUMN     "accountId" TEXT NOT NULL,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "itemId" TEXT NOT NULL,
ADD COLUMN     "merchantName" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "pending" BOOLEAN NOT NULL,
ADD COLUMN     "plaidTransactionId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "plaidToken";

-- CreateTable
CREATE TABLE "PlaidItem" (
    "id" TEXT NOT NULL,
    "plaidItemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "institution" TEXT NOT NULL,

    CONSTRAINT "PlaidItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "plaidAccountId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plaidItemId" TEXT NOT NULL,
    "cursor" TEXT NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_plaidTransactionId_key" ON "Transaction"("plaidTransactionId");

-- CreateIndex
CREATE INDEX "Transaction_userId_date_idx" ON "Transaction"("userId", "date");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaidItem" ADD CONSTRAINT "PlaidItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_plaidItemId_fkey" FOREIGN KEY ("plaidItemId") REFERENCES "PlaidItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
