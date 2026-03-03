import { useState, useEffect } from "react";
import TelaLogin from "./components/TelaLogin";
import TelaCadastro from "./components/TelaCadastro";
import Home from "./components/Home";
import Perfil from "./components/Perfil";
import Graficos from "./components/Graficos";
import BaixaEstoque from "./components/BaixaEstoque";
import Lotes from "./components/Lotes";
import Kits from "./components/Kits";
import Etiqueta from "./components/Etiqueta";
import { getUserById } from "@/services/userService";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState("login");
  const [currentPage, setCurrentPage] = useState("home");
  const [etiquetaProduct, setEtiquetaProduct] = useState(null);
  const [isRestoring, setIsRestoring] = useState(true);

  // Restaura sessão ao carregar a página
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsRestoring(false);
          return;
        }

        // Decodifica o payload do JWT para obter id_user
        const payload = JSON.parse(atob(token.split(".")[1]));
        const id_user = payload?.id_user;

        if (!id_user) {
          localStorage.removeItem("token");
          setIsRestoring(false);
          return;
        }

        // Busca dados atualizados do usuário no backend
        const userData = await getUserById(id_user);
        setUser(userData);
        setCurrentPage("home");
      } catch (err) {
        // Token expirado ou inválido
        console.log("Sessão expirada, faça login novamente.");
        localStorage.removeItem("token");
      } finally {
        setIsRestoring(false);
      }
    };

    restoreSession();
  }, []);

  const handleLoginSuccess = (response) => {
    // Acessa o usuário dentro de response.Login.user
    const userData = response.Login?.user || response.user || response;
    setUser(userData);
    setCurrentPage("home");
    console.log("Login realizado com sucesso:", response);
  };

  const handleRegisterSuccess = (response) => {
    // Após cadastro bem-sucedido, redireciona para login
    setCurrentView("login");
    console.log("Cadastro realizado com sucesso:", response);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setCurrentView("login");
    setCurrentPage("home");
  };

  const handleUserUpdate = (updatedUser) => {
    setUser((prevUser) => ({
      ...prevUser,
      ...updatedUser,
    }));
  };

  // Tela de carregamento enquanto restaura sessão
  if (isRestoring) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Carregando...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (currentView === "register") {
      return (
        <TelaCadastro
          onRegisterSuccess={handleRegisterSuccess}
          onNavigateToLogin={() => setCurrentView("login")}
        />
      );
    }

    return (
      <TelaLogin
        onLoginSuccess={handleLoginSuccess}
        onNavigateToRegister={() => setCurrentView("register")}
      />
    );
  }

  if (currentPage === "perfil") {
    return (
      <Perfil
        user={user}
        onBack={() => setCurrentPage("home")}
        onLogout={handleLogout}
        onUserUpdate={handleUserUpdate}
        onHomeClick={() => setCurrentPage("home")}
        onGraficosClick={() => setCurrentPage("graficos")}
        onBaixaClick={() => setCurrentPage("baixa")}
        onLotesClick={() => setCurrentPage("lotes")}
        onKitsClick={() => setCurrentPage("kits")}
      />
    );
  }

  if (currentPage === "graficos") {
    return (
      <Graficos
        user={user}
        onProfileClick={() => setCurrentPage("perfil")}
        onLogout={handleLogout}
        onHomeClick={() => setCurrentPage("home")}
        onGraficosClick={() => setCurrentPage("graficos")}
        onBaixaClick={() => setCurrentPage("baixa")}
        onLotesClick={() => setCurrentPage("lotes")}
        onKitsClick={() => setCurrentPage("kits")}
      />
    );
  }

  if (currentPage === "baixa") {
    return (
      <BaixaEstoque
        user={user}
        onProfileClick={() => setCurrentPage("perfil")}
        onLogout={handleLogout}
        onHomeClick={() => setCurrentPage("home")}
        onGraficosClick={() => setCurrentPage("graficos")}
        onBaixaClick={() => setCurrentPage("baixa")}
        onLotesClick={() => setCurrentPage("lotes")}
        onKitsClick={() => setCurrentPage("kits")}
      />
    );
  }

  if (currentPage === "etiqueta") {
    return (
      <Etiqueta
        product={etiquetaProduct}
        onBack={() => setCurrentPage("home")}
      />
    );
  }

  if (currentPage === "lotes") {
    return (
      <Lotes
        user={user}
        onProfileClick={() => setCurrentPage("perfil")}
        onLogout={handleLogout}
        onHomeClick={() => setCurrentPage("home")}
        onGraficosClick={() => setCurrentPage("graficos")}
        onBaixaClick={() => setCurrentPage("baixa")}
        onLotesClick={() => setCurrentPage("lotes")}
        onKitsClick={() => setCurrentPage("kits")}
      />
    );
  }

  if (currentPage === "kits") {
    return (
      <Kits
        user={user}
        onProfileClick={() => setCurrentPage("perfil")}
        onLogout={handleLogout}
        onHomeClick={() => setCurrentPage("home")}
        onGraficosClick={() => setCurrentPage("graficos")}
        onBaixaClick={() => setCurrentPage("baixa")}
        onLotesClick={() => setCurrentPage("lotes")}
        onKitsClick={() => setCurrentPage("kits")}
      />
    );
  }

  return (
    <Home
      user={user}
      onProfileClick={() => setCurrentPage("perfil")}
      onLogout={handleLogout}
      onGraficosClick={() => setCurrentPage("graficos")}
      onHomeClick={() => setCurrentPage("home")}
      onBaixaClick={() => setCurrentPage("baixa")}
      onLotesClick={() => setCurrentPage("lotes")}
      onKitsClick={() => setCurrentPage("kits")}
      onPrintEtiqueta={(product) => {
        setEtiquetaProduct(product);
        setCurrentPage("etiqueta");
      }}
    />
  );
}

export default App;
