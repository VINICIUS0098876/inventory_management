import { User, LogOut, Home, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

const Sidebar = ({
  user,
  onProfileClick,
  onLogout,
  onHomeClick,
  onGraficosClick,
  currentPage,
}) => {
  return (
    <div className="w-64 bg-gradient-to-b from-blue-600 via-indigo-700 to-purple-800 text-white h-screen flex flex-col shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
            <User className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-lg text-white truncate select-none">
              {user?.name || "Usuário"}
            </h2>
            <p className="text-sm text-white/80 truncate select-none">
              {user?.email || ""}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 space-y-2">
        <Button
          onClick={onHomeClick}
          className={`w-full justify-start border border-white/20 h-12 rounded-lg font-semibold shadow-sm ${
            currentPage === "home"
              ? "bg-white/30 hover:bg-white/30 text-white"
              : "bg-white/10 hover:bg-white/20 text-white"
          }`}
        >
          <Home className="mr-3 h-5 w-5 text-white" />
          <span className="text-white">Dashboard</span>
        </Button>
        <Button
          onClick={onGraficosClick}
          className={`w-full justify-start border border-white/20 h-12 rounded-lg font-semibold shadow-sm ${
            currentPage === "graficos"
              ? "bg-white/30 hover:bg-white/30 text-white"
              : "bg-white/10 hover:bg-white/20 text-white"
          }`}
        >
          <BarChart3 className="mr-3 h-5 w-5 text-white" />
          <span className="text-white">Gráficos</span>
        </Button>
        <Button
          onClick={onProfileClick}
          className={`w-full justify-start border border-white/20 h-12 rounded-lg font-semibold shadow-sm ${
            currentPage === "perfil"
              ? "bg-white/30 hover:bg-white/30 text-white"
              : "bg-white/10 hover:bg-white/20 text-white"
          }`}
        >
          <User className="mr-3 h-5 w-5 text-white" />
          <span className="text-white">Meu Perfil</span>
        </Button>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/20">
        <Button
          onClick={onLogout}
          variant="ghost"
          className="w-full justify-start text-white hover:bg-white/10 h-12 rounded-lg border-0"
        >
          <LogOut className="mr-3 h-5 w-5 text-white" />
          <span className="text-white">Sair</span>
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
