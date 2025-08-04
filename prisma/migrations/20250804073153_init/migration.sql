-- CreateTable
CREATE TABLE "public"."Role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EducationType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "EducationType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Location" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "zipcode" TEXT,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Institution" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "education_type_id" INTEGER NOT NULL,
    "location_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Phase" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Phase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MainGroup" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "MainGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SubGroup" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "main_group_id" INTEGER NOT NULL,

    CONSTRAINT "SubGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CustomField" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "field_type" TEXT NOT NULL,
    "options" JSONB,

    CONSTRAINT "CustomField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StudentRegistration" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "institution_id" INTEGER NOT NULL,
    "phase_id" INTEGER NOT NULL,
    "subgroup_id" INTEGER NOT NULL,
    "custom_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StaffRegistration" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "institution_id" INTEGER NOT NULL,
    "role_in_institution" TEXT,
    "custom_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StaffRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Institution" ADD CONSTRAINT "Institution_education_type_id_fkey" FOREIGN KEY ("education_type_id") REFERENCES "public"."EducationType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Institution" ADD CONSTRAINT "Institution_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SubGroup" ADD CONSTRAINT "SubGroup_main_group_id_fkey" FOREIGN KEY ("main_group_id") REFERENCES "public"."MainGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentRegistration" ADD CONSTRAINT "StudentRegistration_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentRegistration" ADD CONSTRAINT "StudentRegistration_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "public"."Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentRegistration" ADD CONSTRAINT "StudentRegistration_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "public"."Phase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentRegistration" ADD CONSTRAINT "StudentRegistration_subgroup_id_fkey" FOREIGN KEY ("subgroup_id") REFERENCES "public"."SubGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StaffRegistration" ADD CONSTRAINT "StaffRegistration_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StaffRegistration" ADD CONSTRAINT "StaffRegistration_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "public"."Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
