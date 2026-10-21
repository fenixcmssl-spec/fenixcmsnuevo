-- FenixCMS Migration: 20261021_production_hardening
-- Hardening: Decimal monetary types, token hashes for sessions, strict payment protection, and Store tables

-- 1. Create OrderStatus Enum
DO $$ BEGIN
    CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAYMENT_PENDING', 'PROCESSING', 'COMPLETED', 'CANCELED', 'REFUNDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Alter Session to store tokenHash instead of raw token
ALTER TABLE "Session" DROP CONSTRAINT IF EXISTS "Session_token_key";
DROP INDEX IF EXISTS "Session_token_idx";
ALTER TABLE "Session" RENAME COLUMN "token" TO "tokenHash";
CREATE UNIQUE INDEX IF NOT EXISTS "Session_tokenHash_key" ON "Session"("tokenHash");
CREATE INDEX IF NOT EXISTS "Session_tokenHash_idx" ON "Session"("tokenHash");
CREATE INDEX IF NOT EXISTS "Session_expiresAt_idx" ON "Session"("expiresAt");

-- 3. Alter PasswordResetToken to store tokenHash
ALTER TABLE "PasswordResetToken" DROP CONSTRAINT IF EXISTS "PasswordResetToken_token_key";
DROP INDEX IF EXISTS "PasswordResetToken_token_idx";
ALTER TABLE "PasswordResetToken" RENAME COLUMN "token" TO "tokenHash";
CREATE UNIQUE INDEX IF NOT EXISTS "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");
CREATE INDEX IF NOT EXISTS "PasswordResetToken_tokenHash_idx" ON "PasswordResetToken"("tokenHash");

-- 4. Alter Monetary columns from DOUBLE PRECISION to DECIMAL(12, 2)
ALTER TABLE "ModulePrice" ALTER COLUMN "price" TYPE DECIMAL(12, 2) USING "price"::DECIMAL(12, 2);
ALTER TABLE "DiscountRule" ALTER COLUMN "value" TYPE DECIMAL(12, 2) USING "value"::DECIMAL(12, 2);
ALTER TABLE "Subscription" ALTER COLUMN "price" TYPE DECIMAL(12, 2) USING "price"::DECIMAL(12, 2);
ALTER TABLE "SubscriptionItem" ALTER COLUMN "price" TYPE DECIMAL(12, 2) USING "price"::DECIMAL(12, 2);
ALTER TABLE "Payment" ALTER COLUMN "amount" TYPE DECIMAL(12, 2) USING "amount"::DECIMAL(12, 2);
ALTER TABLE "PluginCatalogItem" ALTER COLUMN "price" TYPE DECIMAL(12, 2) USING "price"::DECIMAL(12, 2);
ALTER TABLE "ThemeCatalogItem" ALTER COLUMN "price" TYPE DECIMAL(12, 2) USING "price"::DECIMAL(12, 2);

-- 5. Harden Payment relation: Restrict delete on Tenant
ALTER TABLE "Payment" DROP CONSTRAINT IF EXISTS "Payment_tenantId_fkey";
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT;

-- 6. Create Integrated E-commerce Store Tables
CREATE TABLE IF NOT EXISTS "StoreProduct" (
    "id" TEXT PRIMARY KEY,
    "tenantId" TEXT NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(12, 2) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "category" TEXT NOT NULL DEFAULT 'General',
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StoreProduct_tenant_slug_unique" UNIQUE ("tenantId", "slug")
);

CREATE INDEX IF NOT EXISTS "StoreProduct_tenant_category_idx" ON "StoreProduct"("tenantId", "category");
CREATE INDEX IF NOT EXISTS "StoreProduct_tenant_isActive_idx" ON "StoreProduct"("tenantId", "isActive");

CREATE TABLE IF NOT EXISTS "StoreOrder" (
    "id" TEXT PRIMARY KEY,
    "tenantId" TEXT NOT NULL REFERENCES "Tenant"("id") ON DELETE RESTRICT,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "totalAmount" DECIMAL(12, 2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "idempotencyKey" TEXT UNIQUE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "StoreOrder_tenantId_idx" ON "StoreOrder"("tenantId");
CREATE INDEX IF NOT EXISTS "StoreOrder_tenant_status_idx" ON "StoreOrder"("tenantId", "status");
CREATE INDEX IF NOT EXISTS "StoreOrder_customerEmail_idx" ON "StoreOrder"("customerEmail");

CREATE TABLE IF NOT EXISTS "StoreOrderItem" (
    "id" TEXT PRIMARY KEY,
    "orderId" TEXT NOT NULL REFERENCES "StoreOrder"("id") ON DELETE CASCADE,
    "productId" TEXT NOT NULL REFERENCES "StoreProduct"("id") ON DELETE RESTRICT,
    "productName" TEXT NOT NULL,
    "unitPrice" DECIMAL(12, 2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "totalPrice" DECIMAL(12, 2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "StoreOrderItem_orderId_idx" ON "StoreOrderItem"("orderId");
CREATE INDEX IF NOT EXISTS "StoreOrderItem_productId_idx" ON "StoreOrderItem"("productId");
