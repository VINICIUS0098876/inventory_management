import api from "./api";

/**
 * Obtém dados do usuário por ID
 * @param {number} userId - ID do usuário
 * @returns {Promise<object>} - Dados do usuário
 * @throws {Error} - Erro caso a requisição falhe
 */
export const getUserById = async (userId) => {
  const { data } = await api.get(`/user/${userId}`);
  return data;
};

/**
 * Atualiza dados do usuário
 * @param {number} userId - ID do usuário
 * @param {object} userData - Dados atualizados do usuário (name, email, passwordHash)
 * @returns {Promise<object>} - Dados do usuário atualizado
 * @throws {Error} - Erro caso a requisição falhe
 */
export const updateUser = async (userId, userData) => {
  const { data } = await api.put(`/user/${userId}`, userData);
  return data;
};
