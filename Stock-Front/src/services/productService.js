const API_BASE_URL = "http://localhost:3000";

/**
 * Obtém o token do localStorage
 */
const getToken = () => {
  return localStorage.getItem("token");
};

/**
 * Obtém todos os produtos do usuário
 * @returns {Promise<Array>} - Lista de produtos
 * @throws {Error} - Erro caso a requisição falhe
 */
export const getProducts = async () => {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/product`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erro ao buscar produtos");
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
 * Cria um novo produto
 * @param {object} productData - Dados do produto (name, quantity, price)
 * @returns {Promise<object>} - Produto criado
 * @throws {Error} - Erro caso a criação falhe
 */
export const createProduct = async (productData) => {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/product`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erro ao criar produto");
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
 * Atualiza um produto existente
 * @param {number} productId - ID do produto
 * @param {object} productData - Dados atualizados do produto
 * @returns {Promise<object>} - Produto atualizado
 * @throws {Error} - Erro caso a atualização falhe
 */
export const updateProduct = async (productId, productData) => {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/product/${productId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erro ao atualizar produto");
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
 * Deleta um produto
 * @param {number} productId - ID do produto
 * @returns {Promise<object>} - Resposta da deleção
 * @throws {Error} - Erro caso a deleção falhe
 */
export const deleteProduct = async (productId) => {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/product/${productId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erro ao deletar produto");
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

