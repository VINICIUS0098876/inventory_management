import { useState } from "react";
import TelaLogin from "./components/TelaLogin";
import TelaCadastro from "./components/TelaCadastro";
import Home from "./components/Home";
import Perfil from "./components/Perfil";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState("register"); // 'register' ou 'login'
  const [currentPage, setCurrentPage] = useState("home"); // 'home' ou 'perfil'

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
      />
    );
  }

  return (
    <Home
      user={user}
      onProfileClick={() => setCurrentPage("perfil")}
      onLogout={handleLogout}
    />
  );
}

export default App;
