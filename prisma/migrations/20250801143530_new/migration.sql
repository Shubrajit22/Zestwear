/*
  Warnings:

  - The values [NIRBHAY] on the enum `ProductCategoryEnum` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[name]` on the table `ProductCategory` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."ProductCategoryEnum_new" AS ENUM ('BRAHMAND', 'NIRVAY', 'JERSEY', 'CUSTOMISE', 'UNIFORM', 'SHOES');
ALTER TABLE "public"."ProductCategory" ALTER COLUMN "name" TYPE "public"."ProductCategoryEnum_new" USING ("name"::text::"public"."ProductCategoryEnum_new");
ALTER TYPE "public"."ProductCategoryEnum" RENAME TO "ProductCategoryEnum_old";
ALTER TYPE "public"."ProductCategoryEnum_new" RENAME TO "ProductCategoryEnum";
DROP TYPE "public"."ProductCategoryEnum_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."OrderItem" DROP CONSTRAINT "OrderItem_productId_fkey";

-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "razorpay_order_id" TEXT,
ADD COLUMN     "razorpay_payment_id" TEXT;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "otp" TEXT,
ADD COLUMN     "otpExpiry" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategory_name_key" ON "public"."ProductCategory"("name");

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
