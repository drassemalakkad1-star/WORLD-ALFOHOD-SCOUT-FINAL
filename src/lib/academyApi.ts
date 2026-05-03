import { Course, EnrollmentWithCourse } from "../data/academyTypes";
import { ACADEMY_COURSES } from "../data/academyCourses";
import { getAcademyCourses, urlFor } from "./sanityClient";

const ENROLLMENTS_KEY = "cheetahs_academy_enrollments";

// ─── Local enrollment store ────────────────────────────────────────────────
interface StoredEnrollment {
  enrollmentId: string;
  courseSlug: string;
  userEmail: string;
  enrolledAt: string;
  lessonsCompleted: string[];
}

function loadEnrollments(): StoredEnrollment[] {
  try {
    return JSON.parse(localStorage.getItem(ENROLLMENTS_KEY) || "[]");
  } catch { return []; }
}

function saveEnrollments(data: StoredEnrollment[]) {
  try { localStorage.setItem(ENROLLMENTS_KEY, JSON.stringify(data)); } catch {}
}

async function getAllCourses() {
  let combined = [...ACADEMY_COURSES];
  
  try {
    const sanityCourses = await getAcademyCourses();
    if (sanityCourses && sanityCourses.length > 0) {
      // Convert Sanity courses to Course interface
      const mappedSanity: Course[] = sanityCourses.map((sc: any) => ({
        id: sc._id,
        slug: sc.slug,
        title: sc.title,
        subtitle: sc.description?.slice(0, 100) + "...",
        description: sc.description,
        longDescription: sc.description,
        category: sc.category,
        level: sc.level,
        duration: sc.duration,
        lessonsCount: sc.lessons || 0,
        enrolledCount: sc.enrollmentCount || 0,
        rating: sc.rating || 5,
        price: sc.price || 0,
        isFree: sc.price === 0,
        isFeatured: sc.featured || false,
        isNew: true,
        instructor: {
          name: sc.instructor || "قائد كشفي",
          title: "مدرب معتمد",
          bio: "",
          avatarColor: "bg-primary"
        },
        skills: [],
        requirements: [],
        lessons: [],
        coverColor: sc.image ? urlFor(sc.image).url() : "bg-primary",
        certificate: true
      }));

      // Merge and remove duplicates by slug (Sanity version wins)
      const sanitySlugs = new Set(mappedSanity.map(c => c.slug));
      combined = [...mappedSanity, ...ACADEMY_COURSES.filter(c => !sanitySlugs.has(c.slug))];
    }
  } catch (err) {
    console.error("Error fetching Sanity courses, using fallback:", err);
  }
  
  return combined;
}

async function filterCourses(params?: {
  category?: string; level?: string; q?: string;
  sort?: string; page?: number; pageSize?: number;
}) {
  const allCourses = await getAllCourses();
  let list = [...allCourses];

  if (params?.category) {
    list = list.filter(c => c.category === params.category);
  }
  if (params?.level) {
    list = list.filter(c => c.level === params.level);
  }
  if (params?.q) {
    const q = params.q.toLowerCase();
    list = list.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.subtitle.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.instructor.name.toLowerCase().includes(q)
    );
  }

  switch (params?.sort) {
    case "popular":    list.sort((a, b) => b.enrolledCount - a.enrolledCount); break;
    case "rating":     list.sort((a, b) => b.rating - a.rating); break;
    case "price-asc":  list.sort((a, b) => a.price - b.price); break;
    case "price-desc": list.sort((a, b) => b.price - a.price); break;
    default: /* newest — keep original order which already has isNew first */
      list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
  }

  const pageSize = params?.pageSize ?? 9;
  const page = params?.page ?? 1;
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const items = list.slice((page - 1) * pageSize, page * pageSize);

  return { items, total, page, pageSize, totalPages };
}

// ─── Public API ───────────────────────────────────────────────────────────
export const academyApi = {
  getCategories: async (): Promise<{ name: string; count: number }[]> => {
    const counts: Record<string, number> = {};
    ACADEMY_COURSES.forEach(c => { counts[c.category] = (counts[c.category] || 0) + 1; });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  },

  listCourses: async (params?: {
    category?: string; level?: string; q?: string;
    sort?: string; page?: number; pageSize?: number;
  }): Promise<{ items: Course[]; total: number; page: number; pageSize: number; totalPages: number }> => {
    return filterCourses(params);
  },

  getCourse: async (slug: string): Promise<Course> => {
    const allCourses = await getAllCourses();
    const course = allCourses.find(c => c.slug === slug);
    if (!course) throw new Error(`Course not found: ${slug}`);
    return course;
  },

  getLesson: async (courseSlug: string, lessonSlug: string) => {
    const course = ACADEMY_COURSES.find(c => c.slug === courseSlug);
    if (!course) throw new Error("Course not found");
    const lesson = course.lessons.find(l => l.slug === lessonSlug);
    if (!lesson) throw new Error("Lesson not found");
    return lesson;
  },

  enrollInCourse: async (courseSlug: string, userEmail: string): Promise<{ ok: boolean; enrollmentId: string; enrolledAt: string }> => {
    const enrollments = loadEnrollments();
    const existing = enrollments.find(e => e.courseSlug === courseSlug && e.userEmail === userEmail);
    if (existing) return { ok: true, enrollmentId: existing.enrollmentId, enrolledAt: existing.enrolledAt };

    const newEnrollment: StoredEnrollment = {
      enrollmentId: `enr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      courseSlug,
      userEmail,
      enrolledAt: new Date().toISOString(),
      lessonsCompleted: [],
    };
    saveEnrollments([...enrollments, newEnrollment]);
    return { ok: true, enrollmentId: newEnrollment.enrollmentId, enrolledAt: newEnrollment.enrolledAt };
  },

  listMyEnrollments: async (email: string): Promise<EnrollmentWithCourse[]> => {
    const enrollments = loadEnrollments().filter(e => e.userEmail === email);
    return enrollments.map(e => {
      const course = ACADEMY_COURSES.find(c => c.slug === e.courseSlug)!;
      const progressPct = course
        ? Math.round((e.lessonsCompleted.length / course.lessonsCount) * 100)
        : 0;
      return { ...e, course, progressPct };
    }).filter(e => e.course);
  },

  markLessonComplete: async (
    enrollmentId: string, lessonSlug: string, completed: boolean
  ): Promise<{ ok: boolean; progressPct: number; lessonsCompleted: string[] }> => {
    const enrollments = loadEnrollments();
    const idx = enrollments.findIndex(e => e.enrollmentId === enrollmentId);
    if (idx === -1) throw new Error("Enrollment not found");

    const enrollment = enrollments[idx];
    let lessonsCompleted = [...enrollment.lessonsCompleted];

    if (completed && !lessonsCompleted.includes(lessonSlug)) {
      lessonsCompleted.push(lessonSlug);
    } else if (!completed) {
      lessonsCompleted = lessonsCompleted.filter(s => s !== lessonSlug);
    }

    enrollments[idx] = { ...enrollment, lessonsCompleted };
    saveEnrollments(enrollments);

    const course = ACADEMY_COURSES.find(c => c.slug === enrollment.courseSlug);
    const progressPct = course
      ? Math.round((lessonsCompleted.length / course.lessonsCount) * 100)
      : 0;

    return { ok: true, progressPct, lessonsCompleted };
  },
};
