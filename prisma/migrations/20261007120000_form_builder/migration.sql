-- Answers to builder-added fields on requests and carrier registrations.
ALTER TABLE "Request" ADD COLUMN "extra" JSONB;
ALTER TABLE "Partner" ADD COLUMN "extra" JSONB;

-- Contact-form messages (previously only sent to Netlify Forms).
CREATE TABLE "FormSubmission" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "data" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormSubmission_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "FormSubmission_formId_createdAt_idx" ON "FormSubmission"("formId", "createdAt");

-- Keep the Supabase Data API locked out (see 20261003130000_lock_data_api).
ALTER TABLE "FormSubmission" ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon')
     AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON TABLE "FormSubmission" FROM anon, authenticated;
  END IF;
END $$;
