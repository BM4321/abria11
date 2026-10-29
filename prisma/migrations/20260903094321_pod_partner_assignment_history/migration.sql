-- CreateTable
CREATE TABLE "RequestStatusHistory" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "fromStatus" TEXT NOT NULL,
    "toStatus" TEXT NOT NULL,
    "changedByName" TEXT,
    "changedByEmail" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RequestStatusHistory_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Request" ADD COLUMN "assignedPartnerId" TEXT,
ADD COLUMN "podFileKey" TEXT,
ADD COLUMN "podFileName" TEXT,
ADD COLUMN "podNotes" TEXT,
ADD COLUMN "podReceivedAt" TIMESTAMP(3),
ADD COLUMN "podReceivedBy" TEXT;

-- CreateIndex
CREATE INDEX "RequestStatusHistory_requestId_idx" ON "RequestStatusHistory"("requestId");

-- AddForeignKey
ALTER TABLE "RequestStatusHistory" ADD CONSTRAINT "RequestStatusHistory_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
