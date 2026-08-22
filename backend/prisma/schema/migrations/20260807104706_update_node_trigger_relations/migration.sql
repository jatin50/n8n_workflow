/*
  Warnings:

  - A unique constraint covering the columns `[nodeId]` on the table `triggers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[webhookToken]` on the table `triggers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nodeId` to the `triggers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "triggers" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "nodeId" TEXT NOT NULL,
ADD COLUMN     "webhookToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "triggers_nodeId_key" ON "triggers"("nodeId");

-- CreateIndex
CREATE UNIQUE INDEX "triggers_webhookToken_key" ON "triggers"("webhookToken");

-- AddForeignKey
ALTER TABLE "triggers" ADD CONSTRAINT "triggers_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
