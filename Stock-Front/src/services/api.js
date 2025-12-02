import axios from "axios";

// Cria uma instância do Axios com configurações base
const api = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 10000, // 10 segundos
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de requisição - adiciona o token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de resposta - trata erros globalmente
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Se o token expirou ou é inválido
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      // Opcional: redirecionar para login
      // window.location.href = "/login";
    }

    // Extrai a mensagem de erro do backend
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Erro de conexão com o servidor";

    return Promise.reject(new Error(message));
  }
);

export default api;
