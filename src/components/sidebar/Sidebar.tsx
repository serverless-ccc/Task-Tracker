import { useLocation, useNavigate } from "react-router";
import {
  Home,
  ListTodo,
  StickyNote,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  HeartPulse,
} from "lucide-react";
import clsx from "clsx";
import { useState } from "react";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const navItems = [
    { key: "/", icon: Home, label: "Home" },
    // { key: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { key: "/tasks", icon: ListTodo, label: "Tasks" },
    { key: "/notes", icon: StickyNote, label: "Notes" },
    { key: "/issues", icon: AlertCircle, label: "Issues" },
    { key: "/pulseboard", icon: HeartPulse, label: "Pulseboard" },
  ];

  return (
    <div
      className={clsx(
        "h-[calc(100vh-64px)] mr-6 relative transition-all duration-300 rounded-md",
        isCollapsed ? "w-16" : "w-64"
      )}
      style={{
        backgroundColor: "rgba(204, 204, 204, 0.08)",
        backdropFilter: "blur(5px)",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
      }}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={clsx(
          "absolute -right-4 top-6 p-1.5 rounded-full bg-white/10",
          "hover:bg-white/20 transition-colors duration-200",
          "border border-white/20 backdrop-blur-sm"
        )}
      >
        {isCollapsed ? (
          <ChevronRight size={16} className="text-white" />
        ) : (
          <ChevronLeft size={16} className="text-white" />
        )}
      </button>

      <nav className={clsx("p-4 space-y-2", isCollapsed && "px-2")}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.key;

          return (
            <button
              key={item.key}
              onClick={() => navigate(item.key)}
              className={clsx(
                "w-full flex items-center gap-3 rounded-lg transition-all duration-200",
                "hover:bg-white/10 active:bg-white/20",
                isActive && "bg-white/10",
                isCollapsed ? "justify-center px-2 py-3" : "px-4 py-3"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon size={20} className="text-white flex-shrink-0" />
              {!isCollapsed && (
                <span className="text-white font-medium whitespace-nowrap">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
