-- Rename floor-staff role from barista to waiter
ALTER TYPE "StaffRole" RENAME VALUE 'barista' TO 'waiter';

-- Track customer buzz cooldown per table
ALTER TABLE "Table" ADD COLUMN "lastBuzzAt" TIMESTAMP(3);
