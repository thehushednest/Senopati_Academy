import { CheckIcon } from "./Icon";

type Step = {
  label: string;
  href: string;
};

const STEPS: Step[] = [
  { label: "Selamat Datang", href: "/onboarding/selamat-datang" },
  { label: "Setup Profil", href: "/onboarding/profil" },
  { label: "Rekomendasi", href: "/onboarding/rekomendasi" }
];

type OnboardingStepsProps = {
  current: 1 | 2 | 3;
};

export function OnboardingSteps({ current }: OnboardingStepsProps) {
  return (
    <ol className="onboarding-steps" aria-label="Progress onboarding">
      {STEPS.map((step, idx) => {
        const stepNumber = idx + 1;
        const isCurrent = stepNumber === current;
        const isDone = stepNumber < current;
        return (
          <li
            key={step.href}
            className={
              "onboarding-steps__item" +
              (isCurrent ? " onboarding-steps__item--current" : "") +
              (isDone ? " onboarding-steps__item--done" : "")
            }
          >
            <span className="onboarding-steps__marker" aria-hidden="true">
              {isDone ? <CheckIcon size={14} /> : String(stepNumber).padStart(2, "0")}
            </span>
            <span className="onboarding-steps__label">{step.label}</span>
          </li>
        );
      })}
    </ol>
  );
}
