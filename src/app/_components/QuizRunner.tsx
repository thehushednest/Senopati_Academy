"use client";

import { useMemo, useState } from "react";
import { ArrowRightIcon, CheckIcon } from "./Icon";

type Question = {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
};

type Props = {
  questions: Question[];
  passingScore?: number;
  moduleSlug?: string;
  sessionIndex?: number;
};

export function QuizRunner({ questions, passingScore = 70, moduleSlug, sessionIndex }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const currentQ = questions[currentIdx];
  const isLast = currentIdx === questions.length - 1;

  const score = useMemo(() => {
    if (!submitted) return 0;
    const correct = questions.filter((q) => answers[q.id] === q.correct).length;
    return Math.round((correct / questions.length) * 100);
  }, [submitted, answers, questions]);

  const passed = score >= passingScore;

  const handleSelect = (qid: string, optIdx: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qid]: optIdx }));
  };

  const handleCheck = () => {
    if (answers[currentQ.id] === undefined) return;
    setRevealed((prev) => ({ ...prev, [currentQ.id]: true }));
  };

  const handleNext = async () => {
    if (isLast) {
      setSubmitted(true);
      if (moduleSlug) {
        const correctCount = questions.filter((q) => answers[q.id] === q.correct).length;
        const finalScore = Math.round((correctCount / questions.length) * 100);
        setSaveStatus("saving");
        try {
          const res = await fetch("/api/quiz/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              moduleSlug,
              sessionIndex,
              quizType: "session",
              answers,
              score: finalScore,
              maxScore: 100,
              passed: finalScore >= passingScore,
            }),
          });
          setSaveStatus(res.ok ? "saved" : "error");
        } catch {
          setSaveStatus("error");
        }
      }
      return;
    }
    setCurrentIdx((i) => Math.min(questions.length - 1, i + 1));
  };

  const handleRetry = () => {
    setAnswers({});
    setRevealed({});
    setSubmitted(false);
    setCurrentIdx(0);
    setSaveStatus("idle");
  };

  if (submitted) {
    return (
      <div className="quiz-result">
        <p className="eyebrow eyebrow--brand">Hasil Kuis</p>
        <h2>
          Skor kamu: <span className={passed ? "quiz-result__score quiz-result__score--pass" : "quiz-result__score quiz-result__score--fail"}>{score}</span>
        </h2>
        <p className="quiz-result__status">
          {passed
            ? `Selamat — skor kamu lolos passing grade ${passingScore}. Lanjut ke sesi berikutnya.`
            : `Skor minimum ${passingScore}. Coba review materi dan ulangi kuisnya, tidak masalah.`}
        </p>
        {saveStatus !== "idle" ? (
          <p className="quiz-result__save">
            {saveStatus === "saving"
              ? "Menyimpan hasil…"
              : saveStatus === "saved"
              ? "✓ Hasil tersimpan di dashboard kamu"
              : "Gagal menyimpan hasil — tidak masalah, skor tetap valid"}
          </p>
        ) : null}
        <div className="quiz-result__breakdown">
          {questions.map((q, idx) => {
            const correct = answers[q.id] === q.correct;
            return (
              <div
                key={q.id}
                className={`quiz-result__item${correct ? " quiz-result__item--ok" : " quiz-result__item--bad"}`}
              >
                <strong>
                  {String(idx + 1).padStart(2, "0")} · {correct ? "Benar" : "Belum tepat"}
                </strong>
                <p>{q.question}</p>
                {!correct ? <p className="quiz-result__expl">{q.explanation}</p> : null}
              </div>
            );
          })}
        </div>
        <div className="quiz-result__actions">
          <button type="button" className="button button--secondary" onClick={handleRetry}>
            Ulangi Kuis
          </button>
          <a href="../" className="button button--primary">
            Kembali ke Sesi
            <ArrowRightIcon size={16} />
          </a>
        </div>
      </div>
    );
  }

  const userAnswer = answers[currentQ.id];
  const isRevealed = Boolean(revealed[currentQ.id]);

  return (
    <div className="quiz-runner">
      <div className="quiz-runner__progress">
        <span>
          Soal <strong>{currentIdx + 1}</strong> dari {questions.length}
        </span>
        <div className="quiz-progress-bar" aria-hidden="true">
          <span style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }} />
        </div>
      </div>

      <div className="quiz-question">
        <h2>{currentQ.question}</h2>
        <div className="quiz-options">
          {currentQ.options.map((opt, optIdx) => {
            const selected = userAnswer === optIdx;
            const isCorrect = optIdx === currentQ.correct;
            let state = "";
            if (isRevealed) {
              if (isCorrect) state = " quiz-option--correct";
              else if (selected) state = " quiz-option--wrong";
            } else if (selected) {
              state = " quiz-option--selected";
            }
            return (
              <button
                key={optIdx}
                type="button"
                className={`quiz-option${state}`}
                onClick={() => handleSelect(currentQ.id, optIdx)}
                aria-pressed={selected}
                disabled={isRevealed}
              >
                <span className="quiz-option__letter">
                  {String.fromCharCode(65 + optIdx)}
                </span>
                <span className="quiz-option__text">{opt}</span>
                {isRevealed && isCorrect ? (
                  <span className="quiz-option__check" aria-hidden="true">
                    <CheckIcon size={14} />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {isRevealed ? (
          <div className="quiz-explain">
            <strong>Penjelasan</strong>
            <p>{currentQ.explanation}</p>
          </div>
        ) : null}
      </div>

      <div className="quiz-runner__actions">
        <button
          type="button"
          className="button button--secondary"
          onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
          disabled={currentIdx === 0}
        >
          Sebelumnya
        </button>
        {!isRevealed ? (
          <button
            type="button"
            className="button button--primary"
            onClick={handleCheck}
            disabled={userAnswer === undefined}
          >
            Cek Jawaban
          </button>
        ) : (
          <button type="button" className="button button--primary" onClick={handleNext}>
            {isLast ? "Selesai & Lihat Skor" : "Soal Berikutnya"}
            <ArrowRightIcon size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
