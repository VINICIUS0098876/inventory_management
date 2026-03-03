import { useState } from "react";
import {
  User,
  LogOut,
  Home,
  BarChart3,
  ShoppingCart,
  Layers,
  PackageCheck,
  MapPin,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const Sidebar = ({
  user,
  onProfileClick,
  onLogout,
  onHomeClick,
  onGraficosClick,
  onBaixaClick,
  onLotesClick,
  onKitsClick,
  currentPage,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (fn) => {
    fn();
    setMobileOpen(false);
  };

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-white/20">
        <div className="flex items-center gap-3 mb-0 md:mb-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
            <User className="h-5 w-5 md:h-6 md:w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-base md:text-lg text-white truncate select-none">
              {user?.name || "Usuário"}
            </h2>
            <p className="text-xs md:text-sm text-white/80 truncate select-none">
              {user?.email || ""}
            </p>
          </div>
          {/* Close button only on mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 rounded-lg hover:bg-white/20 text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-3 md:p-4 space-y-1.5 md:space-y-2 overflow-y-auto">
        <Button
          onClick={() => handleNav(onHomeClick)}
          className={`w-full justify-start border border-white/20 h-11 md:h-12 rounded-lg font-semibold shadow-sm text-sm md:text-base ${
            currentPage === "home"
              ? "bg-white/30 hover:bg-white/30 text-white"
              : "bg-white/10 hover:bg-white/20 text-white"
          }`}
        >
          <Home className="mr-3 h-5 w-5 text-white" />
          <span className="text-white">Dashboard</span>
        </Button>
        <Button
          onClick={() => handleNav(onGraficosClick)}
          className={`w-full justify-start border border-white/20 h-11 md:h-12 rounded-lg font-semibold shadow-sm text-sm md:text-base ${
            currentPage === "graficos"
              ? "bg-white/30 hover:bg-white/30 text-white"
              : "bg-white/10 hover:bg-white/20 text-white"
          }`}
        >
          <BarChart3 className="mr-3 h-5 w-5 text-white" />
          <span className="text-white">Gráficos</span>
        </Button>
        <Button
          onClick={() => handleNav(onBaixaClick)}
          className={`w-full justify-start border border-white/20 h-11 md:h-12 rounded-lg font-semibold shadow-sm text-sm md:text-base ${
            currentPage === "baixa"
              ? "bg-white/30 hover:bg-white/30 text-white"
              : "bg-white/10 hover:bg-white/20 text-white"
          }`}
        >
          <ShoppingCart className="mr-3 h-5 w-5 text-white" />
          <span className="text-white">Baixa de Estoque</span>
        </Button>
        <Button
          onClick={() => handleNav(onLotesClick)}
          className={`w-full justify-start border border-white/20 h-11 md:h-12 rounded-lg font-semibold shadow-sm text-sm md:text-base ${
            currentPage === "lotes"
              ? "bg-white/30 hover:bg-white/30 text-white"
              : "bg-white/10 hover:bg-white/20 text-white"
          }`}
        >
          <Layers className="mr-3 h-5 w-5 text-white" />
          <span className="text-white">Lotes</span>
        </Button>
        <Button
          onClick={() => handleNav(onKitsClick)}
          className={`w-full justify-start border border-white/20 h-11 md:h-12 rounded-lg font-semibold shadow-sm text-sm md:text-base ${
            currentPage === "kits"
              ? "bg-white/30 hover:bg-white/30 text-white"
              : "bg-white/10 hover:bg-white/20 text-white"
          }`}
        >
          <PackageCheck className="mr-3 h-5 w-5 text-white" />
          <span className="text-white">Kits</span>
        </Button>

        {/* Em desenvolvimento */}
        <div className="relative group">
          <Button
            disabled
            className="w-full justify-start border border-white/15 h-11 md:h-12 rounded-lg font-semibold shadow-sm bg-white/8 text-white/60 cursor-not-allowed hover:bg-white/8 text-sm md:text-base"
          >
            <MapPin className="mr-3 h-5 w-5 text-white/60" />
            <span className="text-white/60">Localização</span>
            <span className="ml-auto text-[10px] bg-yellow-500/30 text-yellow-300 px-1.5 py-0.5 rounded-full font-medium">
              EM BREVE
            </span>
          </Button>
          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-white/10">
            <p className="font-semibold text-yellow-300 mb-1">
              🚧 Em Desenvolvimento
            </p>
            <p className="text-white/70 leading-relaxed">
              Mapeamento de localização física — Corredor, Prateleira e Caixa
              para cada produto.
            </p>
          </div>
        </div>

        <Button
          onClick={() => handleNav(onProfileClick)}
          className={`w-full justify-start border border-white/20 h-11 md:h-12 rounded-lg font-semibold shadow-sm text-sm md:text-base ${
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
      <div className="p-3 md:p-4 border-t border-white/20">
        <Button
          onClick={() => handleNav(onLogout)}
          variant="ghost"
          className="w-full justify-start text-white hover:bg-white/10 h-11 md:h-12 rounded-lg border-0"
        >
          <LogOut className="mr-3 h-5 w-5 text-white" />
          <span className="text-white">Sair</span>
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button — fixed top-left */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl shadow-lg"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-blue-600 via-indigo-700 to-purple-800 text-white flex flex-col shadow-2xl transform transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </div>

      {/* Desktop sidebar — always visible */}
      <div className="hidden md:flex w-64 bg-gradient-to-b from-blue-600 via-indigo-700 to-purple-800 text-white h-screen flex-col shadow-2xl">
        {sidebarContent}
      </div>
    </>
  );
};

export default Sidebar;
