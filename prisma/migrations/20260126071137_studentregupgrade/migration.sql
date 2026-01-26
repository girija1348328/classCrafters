/*
  Warnings:

  - Changed the type of `gender` on the `Student` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."Student" DROP COLUMN "gender",
ADD COLUMN     "gender" "public"."Gender" NOT NULL;
