import { SearchIcon } from "./Icon";

function formatToday() {
  const d = new Date();
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long"
  }).format(d);
}

type Props = {
  placeholder?: string;
};

export function DashboardTopbar({ placeholder = "Cari modul, sesi, atau mentor" }: Props) {
  return (
    <div className="dashboard-app__topbar">
      <label className="dashboard-search">
        <SearchIcon size={18} />
        <input type="search" placeholder={placeholder} aria-label="Cari" />
      </label>
      <span className="dashboard-app__date">{formatToday()}</span>
    </div>
  );
}
