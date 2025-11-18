const API_BASE_URL = "http://localhost:3000";

/**
 * Obtém o token do localStorage
 */
const getToken = () => {
  return localStorage.getItem("token");
};

/**
 * Obtém dados do usuário por ID
 * @param {number} userId - ID do usuário
 * @returns {Promise<object>} - Dados do usuário
 * @throws {Error} - Erro caso a requisição falhe
 */
export const getUserById = async (userId) => {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erro ao buscar usuário");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Erro de conexão com o servidor");
  }
};

