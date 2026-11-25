-- CreateEnum
CREATE TYPE "Division" AS ENUM ('AUV', 'ROV', 'KRSTI', 'KKI');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ANGGOTA', 'PENGURUS');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "division" "Division" NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ANGGOTA',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_items" (
    "id" UUID NOT NULL,
    "item_name" VARCHAR(120) NOT NULL,
    "storage_place" VARCHAR(100) NOT NULL,
    "member_name" VARCHAR(100) NOT NULL,
    "division" "Division" NOT NULL,
    "note" TEXT NOT NULL,
    "evidence_image" TEXT,
    "location" VARCHAR(200) NOT NULL,
    "stored_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" UUID NOT NULL,

    CONSTRAINT "lab_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- AddForeignKey
ALTER TABLE "lab_items" ADD CONSTRAINT "lab_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
