import { prisma } from "@/lib/db";

export const NEWS_PAGE_SIZE = 10;

// Публично видны только опубликованные записи с датой публикации не в будущем.
const publicNews = () => ({ isPublished: true, publishedAt: { lte: new Date() } });

export function latestNews(take: number) {
  return prisma.news.findMany({
    where: publicNews(),
    orderBy: { publishedAt: "desc" },
    take,
    select: { id: true, title: true, shortText: true, publishedAt: true },
  });
}

export async function newsPage(page: number) {
  const where = publicNews();
  const [items, total] = await Promise.all([
    prisma.news.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * NEWS_PAGE_SIZE,
      take: NEWS_PAGE_SIZE,
      select: { id: true, title: true, shortText: true, publishedAt: true },
    }),
    prisma.news.count({ where }),
  ]);
  return { items, totalPages: Math.max(1, Math.ceil(total / NEWS_PAGE_SIZE)) };
}

export const newsById = (id: number) => prisma.news.findFirst({ where: { id, ...publicNews() } });

export const publishedDocuments = () =>
  prisma.document.findMany({
    where: { isPublished: true },
    orderBy: [{ category: "asc" }, { publishedAt: "desc" }],
  });

export const allClasses = () =>
  prisma.schoolClass.findMany({ orderBy: [{ academicYear: "desc" }, { name: "asc" }] });

export const scheduleForClass = (classId: number, academicYear: string) =>
  prisma.scheduleEntry.findMany({
    where: { classId, academicYear },
    orderBy: [{ dayOfWeek: "asc" }, { lessonNumber: "asc" }],
  });
