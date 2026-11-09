-- Digigrantha Production Idempotency Keys Migration
-- Additive, non-destructive unique idempotency keys & payload hashes for financial transactions

-- 1. ProjectInvoice
ALTER TABLE "ProjectInvoice" ADD COLUMN IF NOT EXISTS "idempotencyKey" TEXT;
ALTER TABLE "ProjectInvoice" ADD COLUMN IF NOT EXISTS "payloadHash" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "ProjectInvoice_idempotencyKey_key" ON "ProjectInvoice"("idempotencyKey");

-- 2. ProjectQuotation
ALTER TABLE "ProjectQuotation" ADD COLUMN IF NOT EXISTS "idempotencyKey" TEXT;
ALTER TABLE "ProjectQuotation" ADD COLUMN IF NOT EXISTS "payloadHash" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "ProjectQuotation_idempotencyKey_key" ON "ProjectQuotation"("idempotencyKey");
