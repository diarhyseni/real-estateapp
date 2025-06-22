/*
  Warnings:

  - A unique constraint covering the columns `[slug_id]` on the table `Property` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "slug_id" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Property_slug_id_key" ON "Property"("slug_id");
