-- AlterTable
ALTER TABLE "Order" ADD COLUMN "preparingAt" TIMESTAMP(3),
ADD COLUMN "readyAt" TIMESTAMP(3),
ADD COLUMN "fulfilledAt" TIMESTAMP(3);
