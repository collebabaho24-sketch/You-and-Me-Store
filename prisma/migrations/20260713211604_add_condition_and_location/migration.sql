-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "condition" TEXT NOT NULL DEFAULT 'NOT_APPLICABLE',
ADD COLUMN     "location" TEXT;

-- CreateIndex
CREATE INDEX "Listing_condition_idx" ON "Listing"("condition");
