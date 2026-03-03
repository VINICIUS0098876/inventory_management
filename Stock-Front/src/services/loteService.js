import api from "./api";

/**
 * Obtém todos os lotes do usuário
 * @returns {Promise<Array>} - Lista de lotes
 * @throws {Error} - Erro caso a requisição falhe
 */
export const getLotes = async () => {
  const { data } = await api.get("/lote");
  return data;
};

/**
 * Obtém um lote pelo ID
 * @param {number} loteId - ID do lote
 * @returns {Promise<object>} - Lote encontrado
 * @throws {Error} - Erro caso a requisição falhe
 */
export const getLoteById = async (loteId) => {
  const { data } = await api.get(`/lote/${loteId}`);
  return data;
};

/**
 * Cria um novo lote
 * @param {object} loteData - Dados do lote (nome, custoTotal, descricao)
 * @returns {Promise<object>} - Lote criado
 * @throws {Error} - Erro caso a criação falhe
 */
export const createLote = async (loteData) => {
  const { data } = await api.post("/lote", loteData);
  return data;
};

/**
 * Atualiza um lote existente
 * @param {number} loteId - ID do lote
 * @param {object} loteData - Dados atualizados do lote
 * @returns {Promise<object>} - Lote atualizado
 * @throws {Error} - Erro caso a atualização falhe
 */
export const updateLote = async (loteId, loteData) => {
  const { data } = await api.put(`/lote/${loteId}`, loteData);
  return data;
};

/**
 * Deleta um lote
 * @param {number} loteId - ID do lote
 * @returns {Promise<object>} - Resposta da deleção
 * @throws {Error} - Erro caso a deleção falhe
 */
export const deleteLote = async (loteId) => {
  const { data } = await api.delete(`/lote/${loteId}`);
  return data;
};
