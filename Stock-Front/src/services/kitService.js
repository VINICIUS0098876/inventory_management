import api from "./api";

/**
 * Obtém todos os kits do usuário
 * @returns {Promise<Array>} - Lista de kits
 */
export const getKits = async () => {
  const { data } = await api.get("/kit");
  return data;
};

/**
 * Obtém um kit pelo ID
 * @param {number} kitId - ID do kit
 * @returns {Promise<object>} - Kit encontrado
 */
export const getKitById = async (kitId) => {
  const { data } = await api.get(`/kit/${kitId}`);
  return data;
};

/**
 * Cria um novo kit
 * @param {object} kitData - { nome, sku, precoVenda, items: [{ id_product, quantidade }] }
 * @returns {Promise<object>} - Kit criado
 */
export const createKit = async (kitData) => {
  const { data } = await api.post("/kit", kitData);
  return data;
};

/**
 * Atualiza um kit existente
 * @param {number} kitId - ID do kit
 * @param {object} kitData - Dados atualizados
 * @returns {Promise<object>} - Kit atualizado
 */
export const updateKit = async (kitId, kitData) => {
  const { data } = await api.put(`/kit/${kitId}`, kitData);
  return data;
};

/**
 * Deleta um kit
 * @param {number} kitId - ID do kit
 * @returns {Promise<object>} - Resposta da deleção
 */
export const deleteKit = async (kitId) => {
  const { data } = await api.delete(`/kit/${kitId}`);
  return data;
};
