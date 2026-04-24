type CTA = {
  label: string;
  href: string;
};

type Highlight = {
  title: string;
  description: string;
};

export type CourseRecord = {
  title: string;
  slug: string;
  eyebrow: string;
  excerpt: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  difficultyLabel: string;
  duration: string;
  priceLabel: string;
  benefits: string[];
  curriculum: Array<{ title: string; summary: string }>;
  category: { name: string; slug: string } | null;
};

type CourseLanding = {
  eyebrow: string;
  headline: string;
  subheadline: string;
  primaryCTA: CTA;
  secondaryCTA: CTA;
  highlights: Highlight[];
  featuredCourse: CourseRecord | null;
};

const cmsURL = process.env.NEXT_PUBLIC_CMS_URL || "https://cms.asksenopati.com";

const fallbackCourses: CourseRecord[] = [
  {
    title: "Strategic Writing for Public Affairs",
    slug: "strategic-writing-public-affairs",
    eyebrow: "Flagship Course",
    excerpt:
      "Program dasar untuk melatih penulisan memo, briefing, dan narasi kebijakan yang lebih presisi.",
    difficulty: "intermediate",
    difficultyLabel: "Intermediate",
    duration: "6 minggu",
    priceLabel: "Rp1.490.000",
    benefits: [
      "Kerangka memo dan briefing yang bisa langsung dipakai",
      "Review mingguan atas tugas tulis",
      "Final project berbentuk strategic memo"
    ],
    curriculum: [
      { title: "Minggu 1", summary: "Struktur memo, problem framing, dan evidence." },
      { title: "Minggu 2", summary: "Policy note, stakeholder map, dan argument hierarchy." },
      { title: "Minggu 3", summary: "Final workshop dan presentasi deck." }
    ],
    category: { name: "Policy Writing", slug: "policy-writing" }
  },
  {
    title: "Editorial Intelligence for Analysts",
    slug: "editorial-intelligence-analysts",
    eyebrow: "Analyst Track",
    excerpt:
      "Mengubah bahan mentah, data, dan isu menjadi keluaran editorial yang lebih tajam dan bernilai keputusan.",
    difficulty: "advanced",
    difficultyLabel: "Advanced",
    duration: "4 minggu",
    priceLabel: "Rp1.190.000",
    benefits: [
      "Framework untuk kurasi isu",
      "Latihan insight extraction",
      "Template executive brief"
    ],
    curriculum: [
      { title: "Week 1", summary: "Signal detection dan issue framing." },
      { title: "Week 2", summary: "Insight hierarchy dan output design." }
    ],
    category: { name: "Editorial Systems", slug: "editorial-systems" }
  }
];

const fallbackLanding: CourseLanding = {
  eyebrow: "Platform Belajar Terpercaya",
  headline: "Tingkatkan skill, raih peluang tanpa batas bersama Senopati Academy.",
  subheadline:
    "Senopati Academy hadir sebagai platform belajar online dengan kurikulum terstruktur, mentor berpengalaman, dan sertifikat yang diakui. Mulai perjalanan belajarmu hari ini — dari kursus mandiri hingga program cohort intensif.",
  primaryCTA: { label: "Mulai Belajar", href: "#catalog" },
  secondaryCTA: { label: "Lihat Program Unggulan", href: "#featured-course" },
  highlights: [
    {
      title: "Cohort terarah",
      description: "Pembelajaran berlapis dengan tugas, feedback, dan ritme yang lebih fokus."
    },
    {
      title: "Mentor praktisi",
      description: "Materi lahir dari pengalaman policy, newsroom, dan komunikasi strategis."
    },
    {
      title: "Output nyata",
      description: "Peserta menghasilkan memo, outline deck, dan analisis akhir yang bisa dipakai."
    }
  ],
  featuredCourse: fallbackCourses[0]
};

function mapDifficultyLabel(value: string | null | undefined) {
  if (value === "beginner") return "Beginner";
  if (value === "advanced") return "Advanced";
  return "Intermediate";
}

function mapCourse(doc: any): CourseRecord {
  return {
    title: doc?.title || "Untitled course",
    slug: doc?.slug || "untitled-course",
    eyebrow: doc?.eyebrow || "Course",
    excerpt: doc?.excerpt || "",
    difficulty: doc?.difficulty || "intermediate",
    difficultyLabel: mapDifficultyLabel(doc?.difficulty),
    duration: doc?.duration || "TBA",
    priceLabel: doc?.priceLabel || "Segera",
    benefits: Array.isArray(doc?.benefits) ? doc.benefits.map((item: any) => item?.item).filter(Boolean) : [],
    curriculum: Array.isArray(doc?.curriculum)
      ? doc.curriculum.map((item: any) => ({
          title: item?.title || "Module",
          summary: item?.summary || ""
        }))
      : [],
    category:
      doc?.category && typeof doc.category === "object"
        ? {
            name: doc.category.name || "Category",
            slug: doc.category.slug || "category"
          }
        : null
  };
}

async function fetchCMS(path: string) {
  try {
    const response = await fetch(`${cmsURL}${path}`, {
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}

export async function getFeaturedCourses() {
  const data = await fetchCMS("/api/courses?where[_status][equals]=published&sort=position&depth=1&limit=6");
  const docs = Array.isArray(data?.docs) ? data.docs : [];

  return docs.length ? docs.map(mapCourse) : fallbackCourses;
}

export async function getCourseLanding(): Promise<CourseLanding> {
  const landing = await fetchCMS("/api/globals/course-landing?depth=2");

  if (!landing) {
    return fallbackLanding;
  }

  return {
    eyebrow: landing.eyebrow || fallbackLanding.eyebrow,
    headline: landing.headline || fallbackLanding.headline,
    subheadline: landing.subheadline || fallbackLanding.subheadline,
    primaryCTA: landing.primaryCTA || fallbackLanding.primaryCTA,
    secondaryCTA: landing.secondaryCTA || fallbackLanding.secondaryCTA,
    highlights: Array.isArray(landing.highlights) && landing.highlights.length
      ? landing.highlights
      : fallbackLanding.highlights,
    featuredCourse: landing.featuredCourse ? mapCourse(landing.featuredCourse) : fallbackLanding.featuredCourse
  };
}

export async function getCourseBySlug(slug: string) {
  const data = await fetchCMS(
    `/api/courses?where[slug][equals]=${encodeURIComponent(slug)}&where[_status][equals]=published&depth=1&limit=1`
  );
  const doc = Array.isArray(data?.docs) ? data.docs[0] : null;
  const fallback = fallbackCourses.find((course) => course.slug === slug);

  if (doc) return mapCourse(doc);
  return fallback || null;
}

export async function getCourseSlugs() {
  const data = await fetchCMS("/api/courses?where[_status][equals]=published&limit=100");
  const docs = Array.isArray(data?.docs) ? data.docs : [];

  return docs.length ? docs.map((doc: any) => doc.slug).filter(Boolean) : fallbackCourses.map((course) => course.slug);
}
