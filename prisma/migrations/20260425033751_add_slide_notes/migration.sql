-- AlterTable
ALTER TABLE "session_materials" ADD COLUMN     "slide_notes_json" JSONB NOT NULL DEFAULT '[]';
