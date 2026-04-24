"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { ExamQuestion } from "../../lib/content";
import { ArrowRightIcon, CheckIcon, ClockIcon } from "./Icon";

type Props = {
  moduleSlug: string;
  questions: ExamQuestion[];
  durationMinutes?: number;
  passingScore?: number;
};

export function FinalExamRunner({
  moduleSlug,
  questions,
  durationMinutes = 45,
  passingScore = 70
}: Props) {
  const router = useRouter();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [started, setStarted] = useState(false);
  const [remaining, setRemaining] = useState(durationMinutes * 60);

  useEffect(() => {
    if (!started) return;
    if (remaining <= 0) {
      submitExam();
      return;
    }
    const timer = window.setInterval(() => {
      setRemaining((s) => s - 1);
    }, 1000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, remaining]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const timeLabel = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const answeredCount = Object.keys(answers).length;
  const currentQ = questions[currentIdx];
  const isLast = currentIdx === questions.length - 1;
  const progressPercent = (answeredCount / questions.length) * 100;

  const skor = useMemo(() => {
    let total = 0;
    let max = 0;
    for (const q of questions) {
      const weight = q.weight ?? 10;
      max += weight;
      if (answers[q.id] === q.correct) total += weight;
    }
    return Math.round((total / max) * 100);
  }, [answers, questions]);

  const [submitting, setSubmitting] = useState(false);

  const submitExam = async () => {
    if (submitting) return;
    setSubmitting(true);
    const correctCount = questions.filter((q) => answers[q.id] === q.correct).length;
    const passed = skor >= passingScore;

    // Simpan hasil ke DB — non-blocking untuk UX (redirect tetap jalan walau gagal simpan).
    try {
      await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleSlug,
          quizType: "final_exam",
          answers,
          score: skor,
          maxScore: 100,
          passed,
        }),
      });
    } catch {
      // Tetap redirect ke hasil walaupun gagal save — hindari kehilangan skor di UI.
    }

    const params = new URLSearchParams();
    params.set("skor", String(skor));
    params.set("lulus", passed ? "1" : "0");
    params.set("benar", String(correctCount));
    params.set("total", String(questions.length));
    router.push(`/belajar/${moduleSlug}/ujian/hasil?${params.toString()}`);
  };

  const handleSelect = (qid: string, optIdx: number) => {
    setAnswers((prev) => ({ ...prev, [qid]: optIdx }));
  };

  if (!started) {
    return (
      <div className="exam-intro">
        <p className="eyebrow eyebrow--brand">Briefing Ujian</p>
        <h2>Sebelum mulai — baca aturan singkat ini</h2>
        <ul className="exam-intro__rules">
          <li>
            <CheckIcon size={14} />
            {questions.length} soal pilihan ganda, masing-masing punya bobot setara.
          </li>
          <li>
            <CheckIcon size={14} />
            Durasi ujian <strong>{durationMinutes} menit</strong> — timer berjalan otomatis setelah mulai.
          </li>
          <li>
            <CheckIcon size={14} />
            Passing score <strong>{passingScore}</strong>. Kalau belum lolos, bisa ulang setelah 24 jam.
          </li>
          <li>
            <CheckIcon size={14} />
            Siapkan koneksi stabil. Progress tidak otomatis tersimpan — jangan refresh.
          </li>
          <li>
            <CheckIcon size={14} />
            Tidak ada soal jebakan. Percayakan pemahaman yang sudah kamu bangun di modul.
          </li>
        </ul>
        <div className="exam-intro__actions">
          <button type="button" className="button button--primary" onClick={() => setStarted(true)}>
            Mulai Ujian
            <ArrowRightIcon size={16} />
          </button>
          <span className="exam-intro__hint">
            Dengan klik tombol, kamu setuju mengikuti aturan di atas.
          </span>
        </div>
      </div>
    );
  }

  const userAnswer = answers[currentQ.id];

  return (
    <div className="exam-runner">
      <div className="exam-runner__header">
        <div>
          <p className="eyebrow">Soal {currentIdx + 1} dari {questions.length}</p>
          <span>{answeredCount} soal sudah dijawab</span>
        </div>
        <div className={"exam-timer" + (remaining < 300 ? " exam-timer--warning" : "")}>
          <ClockIcon size={14} />
          <span>{timeLabel}</span>
        </div>
      </div>

      <div className="quiz-progress-bar" aria-hidden="true">
        <span style={{ width: `${progressPercent}%` }} />
      </div>

      <div className="quiz-question">
        <h2>{currentQ.question}</h2>
        <div className="quiz-options">
          {currentQ.options.map((opt, optIdx) => {
            const selected = userAnswer === optIdx;
            return (
              <button
                type="button"
                key={optIdx}
                className={`quiz-option${selected ? " quiz-option--selected" : ""}`}
                onClick={() => handleSelect(currentQ.id, optIdx)}
                aria-pressed={selected}
              >
                <span className="quiz-option__letter">
                  {String.fromCharCode(65 + optIdx)}
                </span>
                <span className="quiz-option__text">{opt}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="exam-nav">
        <div className="exam-nav__pagination">
          {questions.map((q, idx) => {
            const isAnswered = answers[q.id] !== undefined;
            return (
              <button
                key={q.id}
                type="button"
                className={
                  "exam-nav__chip" +
                  (idx === currentIdx ? " exam-nav__chip--current" : "") +
                  (isAnswered ? " exam-nav__chip--answered" : "")
                }
                onClick={() => setCurrentIdx(idx)}
                aria-label={`Soal ${idx + 1}${isAnswered ? " (sudah dijawab)" : ""}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        <div className="exam-nav__actions">
          <button
            type="button"
            className="button button--secondary"
            onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
            disabled={currentIdx === 0}
          >
            Sebelumnya
          </button>
          {isLast ? (
            <button
              type="button"
              className="button button--primary"
              onClick={submitExam}
              disabled={answeredCount < questions.length || submitting}
            >
              {submitting ? "Mengirim…" : "Selesai & Kirim Jawaban"}
              <ArrowRightIcon size={16} />
            </button>
          ) : (
            <button
              type="button"
              className="button button--primary"
              onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}
            >
              Soal Berikutnya
              <ArrowRightIcon size={16} />
            </button>
          )}
        </div>

        {isLast && answeredCount < questions.length ? (
          <p className="exam-nav__hint">
            Masih ada {questions.length - answeredCount} soal yang belum dijawab.
          </p>
        ) : null}
      </div>
    </div>
  );
}
