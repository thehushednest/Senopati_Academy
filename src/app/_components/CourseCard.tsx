import Link from "next/link";
import type { CourseRecord } from "../../lib/cms";
import { ArrowRightIcon, ClockIcon, LevelIcon } from "./Icon";

export function CourseCard({ course }: { course: CourseRecord }) {
  const accentLabel = course.category?.name || course.eyebrow;
  const reviewCount = 18 + course.title.length;
  const lessonCount = Math.max(8, course.curriculum.length * 6);

  return (
    <article className="course-card">
      <div className="course-card__media" aria-hidden="true">
        <span className="course-card__badge">{accentLabel}</span>
        <div className="course-card__mockup">
          <div className="course-card__mockup-header">
            <span />
            <span />
            <span />
          </div>
          <div className="course-card__mockup-body">
            <div className="course-card__mockup-line course-card__mockup-line--wide" />
            <div className="course-card__mockup-line" />
            <div className="course-card__mockup-grid">
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
      </div>
      <div className="course-card__body">
        <div className="course-card__rating">
          <span className="course-card__stars">★★★★★</span>
          <span>{reviewCount} reviews</span>
        </div>
        <h3>{course.title}</h3>
        <p>{course.excerpt}</p>
        <div className="course-card__meta">
          <span>
            <LevelIcon size={14} />
            {course.difficultyLabel}
          </span>
          <span>
            <ClockIcon size={14} />
            {course.duration}
          </span>
          <span>{lessonCount} lessons</span>
        </div>
      </div>
      <div className="course-card__footer">
        <div className="course-card__teacher">
          <span>Mentor</span>
          <strong>{course.eyebrow}</strong>
        </div>
        <Link href={`/modul/${course.slug}`} aria-label={`Lihat detail ${course.title}`}>
          Detail
          <ArrowRightIcon size={16} />
        </Link>
      </div>
    </article>
  );
}
