-- AlterTable
ALTER TABLE "MediaAsset" ADD COLUMN     "placement" TEXT,
ADD COLUMN     "storagePath" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "MediaAsset_placement_key" ON "MediaAsset"("placement");
