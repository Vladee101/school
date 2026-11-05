-- Связь урока с учётной записью учителя (UC-02 «Моё расписание»).
-- Столбец необязательный: teacher_name остаётся для внешних преподавателей без учётной записи.
ALTER TABLE "schedule_entries" ADD COLUMN "teacher_id" INTEGER;

ALTER TABLE "schedule_entries" ADD CONSTRAINT "schedule_entries_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "schedule_entries_teacher_id_idx" ON "schedule_entries"("teacher_id");