-- AlterTable
ALTER TABLE "live_events" ADD COLUMN     "present_material_id" UUID,
ADD COLUMN     "present_slide" INTEGER,
ADD COLUMN     "presenting_since" TIMESTAMP(3);
