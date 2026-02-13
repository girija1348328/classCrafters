-- CreateTable
CREATE TABLE "public"."Book" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "totalCopies" INTEGER NOT NULL,
    "available" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BookIssue" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "bookId" INTEGER NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "returnDate" TIMESTAMP(3),
    "fine" DOUBLE PRECISION,

    CONSTRAINT "BookIssue_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."BookIssue" ADD CONSTRAINT "BookIssue_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."StudentRegistration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BookIssue" ADD CONSTRAINT "BookIssue_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "public"."Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
