"use client";

import { useMemo, useState } from "react";

type Event = {
  day: number;
  type: "live" | "deadline" | "workshop";
};

const DEMO_EVENTS: Event[] = [
  { day: 7, type: "deadline" },
  { day: 12, type: "live" },
  { day: 18, type: "live" },
  { day: 21, type: "deadline" },
  { day: 27, type: "workshop" }
];

const DAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

function monthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startDay = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<{ day: number; isCurrentMonth: boolean }> = [];

  const prevDays = new Date(year, month, 0).getDate();
  for (let i = startDay - 1; i >= 0; i--) {
    cells.push({ day: prevDays - i, isCurrentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, isCurrentMonth: true });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ day: cells.length - daysInMonth - startDay + 1, isCurrentMonth: false });
  }
  return cells;
}

const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember"
];

export function DashboardCalendar() {
  const today = new Date();
  const [offset, setOffset] = useState(0);

  const current = useMemo(() => {
    const d = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    return {
      year: d.getFullYear(),
      month: d.getMonth(),
      cells: monthGrid(d.getFullYear(), d.getMonth())
    };
  }, [offset, today]);

  const isCurrentMonth = offset === 0;

  return (
    <div className="mini-calendar" aria-label="Kalender">
      <div className="mini-calendar__header">
        <button
          type="button"
          className="mini-calendar__nav"
          onClick={() => setOffset((o) => o - 1)}
          aria-label="Bulan sebelumnya"
        >
          ‹
        </button>
        <strong>
          {MONTHS[current.month]} {current.year}
        </strong>
        <button
          type="button"
          className="mini-calendar__nav"
          onClick={() => setOffset((o) => o + 1)}
          aria-label="Bulan berikutnya"
        >
          ›
        </button>
      </div>
      <div className="mini-calendar__weekdays" aria-hidden="true">
        {DAY_LABELS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="mini-calendar__grid">
        {current.cells.map((cell, idx) => {
          const isToday =
            isCurrentMonth &&
            cell.isCurrentMonth &&
            cell.day === today.getDate();
          const event = isCurrentMonth && cell.isCurrentMonth
            ? DEMO_EVENTS.find((e) => e.day === cell.day)
            : undefined;
          return (
            <span
              key={idx}
              className={
                "mini-calendar__cell" +
                (cell.isCurrentMonth ? "" : " mini-calendar__cell--muted") +
                (isToday ? " mini-calendar__cell--today" : "") +
                (event ? ` mini-calendar__cell--${event.type}` : "")
              }
            >
              {cell.day}
            </span>
          );
        })}
      </div>
    </div>
  );
}
