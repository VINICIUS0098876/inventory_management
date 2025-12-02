import api from "./api";

/**
 * Realiza o cadastro de um novo usuário
 * @param {string} name - Nome do usuário
 * @param {string} email - Email do usuário
 * @param {string} passwordHash - Senha do usuário
 * @returns {Promise<object>} - Dados da resposta do cadastro
 * @throws {Error} - Erro caso o cadastro falhe
 */
export const register = async (name, email, passwordHash) => {
  const { data } = await api.post("/user", { name, email, passwordHash });
  return data;
};

/**
 * Realiza o login do usuário
 * @param {string} email - Email do usuário
 * @param {string} password - Senha do usuário
 * @returns {Promise<{token: string, user: object}>} - Token e dados do usuário
 * @throws {Error} - Erro caso o login falhe
 */
export const login = async (email, password) => {
  const { data } = await api.post("/login", { email, passwordHash: password });
  return data;
};
