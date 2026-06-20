import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', icon: 'home', label: 'Home' },
  { path: '/sensors', icon: 'sensors', label: 'Sensors' },
  { path: '/schedule', icon: 'calendar_today', label: 'Schedule' },
  { path: '/settings', icon: 'settings', label: 'Settings' },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-gray-200/80 flex justify-around items-center px-4 py-2 pb-6 shadow-sm">
      {navItems.map(({ path, icon, label }) => {
        const isActive = location.pathname === path;
        return (
          <Link
            key={path}
            to={path}
            className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 active:scale-90 ${
              isActive
                ? 'text-emerald-700'
                : 'text-gray-500 hover:text-emerald-700'
            }`}
          >
            <span
              className="material-symbols-outlined text-2xl"
              style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
            >
              {icon}
            </span>
            <span className="text-xs font-semibold">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
