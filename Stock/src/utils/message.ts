export const ERROR_INVALID_ID = {
  status: false,
  status_code: 400,
  message: "O dado encaminhado na requisição não é válido!!",
};
export const ERROR_NOT_FOUND = {
  status: false,
  status_code: 404,
  message: "Não foi encontrado nenhum item!!",
};
export const ERROR_INTERNAL_SERVER_DB = {
  status: false,
  status_code: 500,
  message:
    "Não foi possível processar a requisição, devido a um erro no acesso ao banco de dados. Contate o administrador da API!!",
};
export const ERROR_REQUIRED_FIELDS = {
  status: false,
  status_code: 400,
  message:
    "Existem campos requeridos que não foram preenchidos ou não atendem aos critérios de digitação!!",
};
export const ERROR_CONTENT_TYPE = {
  status: false,
  status_code: 415,
  message:
    "O content-type encaminhado na requisição não é suportado pelo servidor. Deve-se encaminhar apenas requisições com application/json",
};
export const ERROR_INTERNAL_SERVER = {
  status: false,
  status_code: 500,
  message:
    "Não foi possível processar a requisição, devido a um erro na camada de negócio/controle da aplicação. Contate o administrador da API!!",
};
export const ERROR_INVALID_CREDENTIALS = {
  status: false,
  status_code: 401,
  message: "Credenciais de autenticação incorretas!!",
};
export const ERROR_FORBIDDEN = {
  status: false,
  status_code: 403,
  message: "Você não tem permissão para acessar este recurso!!",
};

// Mensagens de Sucesso
export const SUCCESS_CREATED_ITEM = {
  status: true,
  status_code: 201,
  message: "Item criado com sucesso!!",
};
export const SUCCESS_DELETED_ITEM = {
  status: true,
  status_code: 200,
  message: "Item excluído com sucesso!!",
};
export const SUCCESS_UPDATED_ITEM = {
  status: true,
  status_code: 200,
  message: "Item atualizado com sucesso!!",
};
export const SUCCESS_LOGIN_ITEM = {
  status: true,
  status_code: 200,
  message: "Login bem-sucedido!!",
};
