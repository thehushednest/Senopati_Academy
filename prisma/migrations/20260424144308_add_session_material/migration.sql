-- CreateTable
CREATE TABLE "session_materials" (
    "id" UUID NOT NULL,
    "module_slug" TEXT NOT NULL,
    "session_index" INTEGER NOT NULL,
    "title" TEXT,
    "pdf_url" TEXT NOT NULL,
    "object_key" TEXT NOT NULL,
    "pdf_filename" TEXT NOT NULL,
    "pdf_size_bytes" INTEGER NOT NULL,
    "total_pages" INTEGER,
    "source_format" TEXT NOT NULL DEFAULT 'pdf',
    "uploaded_by_id" UUID NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_material_versions" (
    "id" UUID NOT NULL,
    "material_id" UUID NOT NULL,
    "pdf_url" TEXT NOT NULL,
    "object_key" TEXT NOT NULL,
    "pdf_filename" TEXT NOT NULL,
    "pdf_size_bytes" INTEGER NOT NULL,
    "total_pages" INTEGER,
    "source_format" TEXT NOT NULL DEFAULT 'pdf',
    "uploaded_by_id" UUID NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "change_note" TEXT,

    CONSTRAINT "session_material_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "slide_progress" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "material_id" UUID NOT NULL,
    "last_slide_index" INTEGER NOT NULL DEFAULT 0,
    "max_slide_index" INTEGER NOT NULL DEFAULT 0,
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "slide_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "session_materials_module_slug_idx" ON "session_materials"("module_slug");

-- CreateIndex
CREATE UNIQUE INDEX "session_materials_module_slug_session_index_key" ON "session_materials"("module_slug", "session_index");

-- CreateIndex
CREATE INDEX "session_material_versions_material_id_uploaded_at_idx" ON "session_material_versions"("material_id", "uploaded_at");

-- CreateIndex
CREATE UNIQUE INDEX "slide_progress_student_id_material_id_key" ON "slide_progress"("student_id", "material_id");

-- AddForeignKey
ALTER TABLE "session_materials" ADD CONSTRAINT "session_materials_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_material_versions" ADD CONSTRAINT "session_material_versions_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "session_materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_material_versions" ADD CONSTRAINT "session_material_versions_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slide_progress" ADD CONSTRAINT "slide_progress_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slide_progress" ADD CONSTRAINT "slide_progress_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "session_materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;
