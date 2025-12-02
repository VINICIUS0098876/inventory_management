import api from "./api";

/**
 * Obtém todos os produtos do usuário
 * @returns {Promise<Array>} - Lista de produtos
 * @throws {Error} - Erro caso a requisição falhe
 */
export const getProducts = async () => {
  const { data } = await api.get("/product");
  return data;
};

/**
 * Cria um novo produto
 * @param {object} productData - Dados do produto (name, quantidade, preco)
 * @returns {Promise<object>} - Produto criado
 * @throws {Error} - Erro caso a criação falhe
 */
export const createProduct = async (productData) => {
  const { data } = await api.post("/product", productData);
  return data;
};

/**
 * Atualiza um produto existente
 * @param {number} productId - ID do produto
 * @param {object} productData - Dados atualizados do produto
 * @returns {Promise<object>} - Produto atualizado
 * @throws {Error} - Erro caso a atualização falhe
 */
export const updateProduct = async (productId, productData) => {
  const { data } = await api.put(`/product/${productId}`, productData);
  return data;
};

/**
 * Deleta um produto
 * @param {number} productId - ID do produto
 * @returns {Promise<object>} - Resposta da deleção
 * @throws {Error} - Erro caso a deleção falhe
 */
export const deleteProduct = async (productId) => {
  const { data } = await api.delete(`/product/${productId}`);
  return data;
};
