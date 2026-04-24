import Link from "next/link";
import { DashboardCalendar } from "./DashboardCalendar";
import { MessageIcon } from "./Icon";
import { LogoutButton } from "./LogoutButton";
import { UserInitials, UserName } from "./UserName";

type Reminder = {
  title: string;
  date: string;
  tone: "brand" | "accent" | "indigo";
};

const DEFAULT_REMINDERS: Reminder[] = [
  {
    title: "Live Q&A — Mentor Foundations",
    date: "Kamis, 18 April · 19.00 WIB",
    tone: "brand"
  },
  {
    title: "Deadline Tugas Intro to AI",
    date: "Minggu, 21 April · 23.59 WIB",
    tone: "accent"
  },
  {
    title: "Workshop: Prompt Level-Up",
    date: "Sabtu, 27 April · 10.00 WIB",
    tone: "indigo"
  },
  {
    title: "Challenge akhir · Prompts 101",
    date: "Rabu, 1 Mei · 20.00 WIB",
    tone: "brand"
  }
];

export function DashboardRightBar({
  reminders = DEFAULT_REMINDERS
}: {
  reminders?: Reminder[];
}) {
  return (
    <aside className="dashboard-app__rightbar" aria-label="Profil & kalender">
      <div className="dashboard-profile">
        <span className="dashboard-profile__avatar" aria-hidden="true">
          <UserInitials fallback="T" />
        </span>
        <strong>
          <UserName fallback="Calon Pelajar" />
        </strong>
        <small>Pelajar · Senopati Academy</small>
        <div className="dashboard-profile__actions">
          <Link className="button button--primary button--sm" href="/onboarding/profil">
            Lihat Profil
          </Link>
          <LogoutButton className="button button--ghost button--sm dashboard-profile__logout" />
        </div>
      </div>

      <DashboardCalendar />

      <div className="reminder-list">
        <header>
          <h3>Reminder</h3>
          <Link href="/progress">Semua</Link>
        </header>
        <ul>
          {reminders.map((item) => (
            <li key={item.title} className={`reminder-item reminder-item--${item.tone}`}>
              <span className="reminder-item__icon" aria-hidden="true">
                <MessageIcon size={14} />
              </span>
              <div>
                <strong>{item.title}</strong>
                <span>{item.date}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
