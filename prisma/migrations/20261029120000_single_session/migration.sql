-- One console session per account (see src/lib/session.ts).
ALTER TABLE "OpsUser" ADD COLUMN "sessionId" TEXT,
ADD COLUMN "sessionSeenAt" TIMESTAMP(3);
