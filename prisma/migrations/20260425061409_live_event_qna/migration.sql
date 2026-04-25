-- CreateTable
CREATE TABLE "live_event_questions" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "body" TEXT NOT NULL,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "answered" BOOLEAN NOT NULL DEFAULT false,
    "answered_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "live_event_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_event_question_votes" (
    "question_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "live_event_question_votes_pkey" PRIMARY KEY ("question_id","user_id")
);

-- CreateIndex
CREATE INDEX "live_event_questions_event_id_created_at_idx" ON "live_event_questions"("event_id", "created_at");

-- CreateIndex
CREATE INDEX "live_event_questions_event_id_upvotes_idx" ON "live_event_questions"("event_id", "upvotes");

-- CreateIndex
CREATE INDEX "live_event_question_votes_user_id_idx" ON "live_event_question_votes"("user_id");

-- AddForeignKey
ALTER TABLE "live_event_questions" ADD CONSTRAINT "live_event_questions_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "live_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_event_questions" ADD CONSTRAINT "live_event_questions_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_event_question_votes" ADD CONSTRAINT "live_event_question_votes_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "live_event_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_event_question_votes" ADD CONSTRAINT "live_event_question_votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
