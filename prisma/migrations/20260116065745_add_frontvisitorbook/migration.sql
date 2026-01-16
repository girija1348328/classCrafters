-- CreateEnum
CREATE TYPE "public"."MeetingWithRole" AS ENUM ('STAFF', 'STUDENT');

-- CreateTable
CREATE TABLE "public"."VisitorBook" (
    "id" SERIAL NOT NULL,
    "purpose" TEXT NOT NULL,
    "meetingWith" "public"."MeetingWithRole" NOT NULL DEFAULT 'STAFF',
    "visitorName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "idCard" TEXT NOT NULL,
    "numberOfPerson" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "inTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "outTime" TIMESTAMP(3),
    "note" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisitorBook_pkey" PRIMARY KEY ("id")
);
