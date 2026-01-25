-- CreateTable
CREATE TABLE "public"."Dispatch" (
    "id" SERIAL NOT NULL,
    "referenceNo" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "fromTitle" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dispatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Receive" (
    "id" SERIAL NOT NULL,
    "referenceNo" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "toTitle" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Receive_pkey" PRIMARY KEY ("id")
);
