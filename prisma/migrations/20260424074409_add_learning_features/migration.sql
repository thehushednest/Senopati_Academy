-- CreateEnum
CREATE TYPE "QuizType" AS ENUM ('session', 'final_exam');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('submitted', 'reviewing', 'approved', 'needs_revision');

-- CreateTable
CREATE TABLE "quiz_submissions" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "module_slug" TEXT NOT NULL,
    "session_index" INTEGER,
    "quiz_type" "QuizType" NOT NULL,
    "score" INTEGER NOT NULL,
    "max_score" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "answers_json" JSONB NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignment_submissions" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "module_slug" TEXT NOT NULL,
    "session_index" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "attachment_url" TEXT,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'submitted',
    "feedback" TEXT,
    "grade" INTEGER,
    "reviewer_id" UUID,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(3),

    CONSTRAINT "assignment_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discussion_threads" (
    "id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "module_slug" TEXT NOT NULL,
    "session_index" INTEGER,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discussion_threads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discussion_replies" (
    "id" UUID NOT NULL,
    "thread_id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discussion_replies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discussion_likes" (
    "id" UUID NOT NULL,
    "thread_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discussion_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notes" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "module_slug" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "module_progress" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "module_slug" TEXT NOT NULL,
    "completed_sessions" INTEGER NOT NULL DEFAULT 0,
    "total_sessions" INTEGER NOT NULL,
    "last_session_index" INTEGER,
    "final_exam_passed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "module_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "module_reviews" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "module_slug" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "experience" TEXT,
    "tags_json" JSONB NOT NULL DEFAULT '[]',
    "body" TEXT NOT NULL,
    "anonymous" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "module_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "module_certificates" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "module_slug" TEXT NOT NULL,
    "cert_code" TEXT NOT NULL,
    "score" INTEGER,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "module_certificates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "quiz_submissions_student_id_module_slug_idx" ON "quiz_submissions"("student_id", "module_slug");

-- CreateIndex
CREATE INDEX "quiz_submissions_module_slug_quiz_type_idx" ON "quiz_submissions"("module_slug", "quiz_type");

-- CreateIndex
CREATE INDEX "assignment_submissions_student_id_module_slug_idx" ON "assignment_submissions"("student_id", "module_slug");

-- CreateIndex
CREATE INDEX "assignment_submissions_module_slug_status_idx" ON "assignment_submissions"("module_slug", "status");

-- CreateIndex
CREATE INDEX "discussion_threads_module_slug_idx" ON "discussion_threads"("module_slug");

-- CreateIndex
CREATE INDEX "discussion_threads_author_id_idx" ON "discussion_threads"("author_id");

-- CreateIndex
CREATE INDEX "discussion_replies_thread_id_idx" ON "discussion_replies"("thread_id");

-- CreateIndex
CREATE UNIQUE INDEX "discussion_likes_thread_id_user_id_key" ON "discussion_likes"("thread_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "notes_student_id_module_slug_key" ON "notes"("student_id", "module_slug");

-- CreateIndex
CREATE INDEX "module_progress_student_id_idx" ON "module_progress"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "module_progress_student_id_module_slug_key" ON "module_progress"("student_id", "module_slug");

-- CreateIndex
CREATE INDEX "module_reviews_module_slug_idx" ON "module_reviews"("module_slug");

-- CreateIndex
CREATE UNIQUE INDEX "module_reviews_student_id_module_slug_key" ON "module_reviews"("student_id", "module_slug");

-- CreateIndex
CREATE UNIQUE INDEX "module_certificates_cert_code_key" ON "module_certificates"("cert_code");

-- CreateIndex
CREATE UNIQUE INDEX "module_certificates_student_id_module_slug_key" ON "module_certificates"("student_id", "module_slug");

-- AddForeignKey
ALTER TABLE "quiz_submissions" ADD CONSTRAINT "quiz_submissions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion_threads" ADD CONSTRAINT "discussion_threads_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion_replies" ADD CONSTRAINT "discussion_replies_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "discussion_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion_replies" ADD CONSTRAINT "discussion_replies_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion_likes" ADD CONSTRAINT "discussion_likes_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "discussion_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discussion_likes" ADD CONSTRAINT "discussion_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_progress" ADD CONSTRAINT "module_progress_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_reviews" ADD CONSTRAINT "module_reviews_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_certificates" ADD CONSTRAINT "module_certificates_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
