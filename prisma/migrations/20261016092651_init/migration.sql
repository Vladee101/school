-- CreateEnum
CREATE TYPE "Role" AS ENUM ('student', 'teacher', 'admin');

-- CreateEnum
CREATE TYPE "TypeCode" AS ENUM ('CH_P', 'CH_T', 'CH_CH', 'CH_Z', 'CH_HO');

-- CreateEnum
CREATE TYPE "Option" AS ENUM ('A', 'B');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "login" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "email" TEXT,
    "must_change_password" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classes" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "academic_year" TEXT NOT NULL,
    "teacher_id" INTEGER,

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_classes" (
    "student_id" INTEGER NOT NULL,
    "class_id" INTEGER NOT NULL,
    "academic_year" TEXT NOT NULL,

    CONSTRAINT "student_classes_pkey" PRIMARY KEY ("student_id")
);

-- CreateTable
CREATE TABLE "tests" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" SERIAL NOT NULL,
    "test_id" INTEGER NOT NULL,
    "question_number" INTEGER NOT NULL,
    "option_a" TEXT NOT NULL,
    "option_b" TEXT NOT NULL,
    "scale_a" "TypeCode" NOT NULL,
    "scale_b" "TypeCode" NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orientation_types" (
    "id" SERIAL NOT NULL,
    "code" "TypeCode" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "orientation_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "professions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "professions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_results" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "test_id" INTEGER NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "score_chp" INTEGER NOT NULL,
    "score_cht" INTEGER NOT NULL,
    "score_chch" INTEGER NOT NULL,
    "score_chz" INTEGER NOT NULL,
    "score_chho" INTEGER NOT NULL,

    CONSTRAINT "test_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "result_dominant_types" (
    "result_id" INTEGER NOT NULL,
    "type_id" INTEGER NOT NULL,

    CONSTRAINT "result_dominant_types_pkey" PRIMARY KEY ("result_id","type_id")
);

-- CreateTable
CREATE TABLE "answers" (
    "id" SERIAL NOT NULL,
    "result_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "chosen_option" "Option" NOT NULL,

    CONSTRAINT "answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "short_text" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "published_at" TIMESTAMP(3),
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "news_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "published_at" TIMESTAMP(3),
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_entries" (
    "id" SERIAL NOT NULL,
    "class_id" INTEGER NOT NULL,
    "academic_year" TEXT NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "lesson_number" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "teacher_name" TEXT,
    "room" TEXT,

    CONSTRAINT "schedule_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_login_key" ON "users"("login");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "classes_teacher_id_idx" ON "classes"("teacher_id");

-- CreateIndex
CREATE UNIQUE INDEX "classes_name_academic_year_key" ON "classes"("name", "academic_year");

-- CreateIndex
CREATE INDEX "student_classes_class_id_idx" ON "student_classes"("class_id");

-- CreateIndex
CREATE UNIQUE INDEX "tests_type_key" ON "tests"("type");

-- CreateIndex
CREATE UNIQUE INDEX "questions_test_id_question_number_key" ON "questions"("test_id", "question_number");

-- CreateIndex
CREATE UNIQUE INDEX "orientation_types_code_key" ON "orientation_types"("code");

-- CreateIndex
CREATE INDEX "professions_type_id_idx" ON "professions"("type_id");

-- CreateIndex
CREATE INDEX "test_results_student_id_completed_at_idx" ON "test_results"("student_id", "completed_at");

-- CreateIndex
CREATE INDEX "result_dominant_types_type_id_idx" ON "result_dominant_types"("type_id");

-- CreateIndex
CREATE UNIQUE INDEX "answers_result_id_question_id_key" ON "answers"("result_id", "question_id");

-- CreateIndex
CREATE INDEX "news_is_published_published_at_idx" ON "news"("is_published", "published_at");

-- CreateIndex
CREATE INDEX "documents_is_published_published_at_idx" ON "documents"("is_published", "published_at");

-- CreateIndex
CREATE INDEX "schedule_entries_class_id_academic_year_idx" ON "schedule_entries"("class_id", "academic_year");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_classes" ADD CONSTRAINT "student_classes_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_classes" ADD CONSTRAINT "student_classes_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "tests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professions" ADD CONSTRAINT "professions_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "orientation_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_results" ADD CONSTRAINT "test_results_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_results" ADD CONSTRAINT "test_results_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "tests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result_dominant_types" ADD CONSTRAINT "result_dominant_types_result_id_fkey" FOREIGN KEY ("result_id") REFERENCES "test_results"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result_dominant_types" ADD CONSTRAINT "result_dominant_types_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "orientation_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_result_id_fkey" FOREIGN KEY ("result_id") REFERENCES "test_results"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_entries" ADD CONSTRAINT "schedule_entries_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Целостность результата теста (ТЗ 15.4): сумма пяти шкал всегда равна 20.
ALTER TABLE "test_results" ADD CONSTRAINT "test_results_scores_valid" CHECK (
  "score_chp" >= 0 AND "score_cht" >= 0 AND "score_chch" >= 0 AND "score_chz" >= 0 AND "score_chho" >= 0
  AND "score_chp" + "score_cht" + "score_chch" + "score_chz" + "score_chho" = 20
);

ALTER TABLE "schedule_entries" ADD CONSTRAINT "schedule_entries_day_valid" CHECK ("day_of_week" BETWEEN 1 AND 7);
