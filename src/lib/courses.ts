import { getCollection, type CollectionEntry } from 'astro:content';

export type Course = CollectionEntry<'courses'>;

export const SAMPLE_CONTENT_NOTE =
  'Sample course content for review. Titles, lessons, prices, and durations are placeholders and will be replaced before launch.';

export async function getCourses(): Promise<Course[]> {
  const courses = await getCollection('courses');
  return courses.sort(
    (a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title),
  );
}

export function lessonCount(course: Course): number {
  return course.data.modules.reduce((total, module) => total + module.lessons.length, 0);
}

export function formatPrice(paise: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(paise / 100);
}
