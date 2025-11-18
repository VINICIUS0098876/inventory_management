const API_BASE_URL = "http://localhost:3000";

/**
 * Realiza o cadastro de um novo usuário
 * @param {string} name - Nome do usuário
 * @param {string} email - Email do usuário
 * @param {string} passwordHash - Senha do usuário
 * @returns {Promise<object>} - Dados da resposta do cadastro
 * @throws {Error} - Erro caso o cadastro falhe
 */
export const register = async (name, email, passwordHash) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, passwordHash }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erro ao realizar cadastro");
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

/**
 * Realiza o login do usuário
 * @param {string} email - Email do usuário
 * @param {string} password - Senha do usuário
 * @returns {Promise<{token: string, user: object}>} - Token e dados do usuário
 * @throws {Error} - Erro caso o login falhe
 */
export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, passwordHash: password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erro ao realizar login");
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
