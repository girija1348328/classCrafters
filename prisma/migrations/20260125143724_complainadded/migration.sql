-- CreateEnum
CREATE TYPE "public"."complaintType" AS ENUM ('EXAMLEAK', 'MISBEHAVE', 'ABUSE');

-- CreateTable
CREATE TABLE "public"."Complain" (
    "id" SERIAL NOT NULL,
    "complaint" "public"."complaintType" NOT NULL DEFAULT 'MISBEHAVE',
    "source" TEXT NOT NULL,
    "complainBy" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "actionTaken" TEXT NOT NULL,
    "assign" TEXT NOT NULL,
    "note" TEXT NOT NULL,

    CONSTRAINT "Complain_pkey" PRIMARY KEY ("id")
);
