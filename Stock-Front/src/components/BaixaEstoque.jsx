import { useState, useEffect, useCallback } from "react";
import Sidebar from "./Sidebar";
import { getProducts, stockOut } from "@/services/productService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Search,
  Package,
  Minus,
  AlertCircle,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ShoppingCart,
} from "lucide-react";

// Mapa de condições
const CONDICAO_MAP = {
  NOVO: {
    label: "Novo",
    color: "bg-green-100 text-green-700 border-green-200",
  },
  REEMBALADO: {
    label: "Reembalado",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  USADO: {
    label: "Usado",
    color: "bg-orange-100 text-orange-700 border-orange-200",
  },
  DEFEITO: {
    label: "Defeito",
    color: "bg-red-100 text-red-700 border-red-200",
  },
};

const BaixaEstoque = ({
  user,
  onProfileClick,
  onLogout,
  onHomeClick,
  onGraficosClick,
  onBaixaClick,
  onLotesClick,
  onKitsClick,
}) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDialog, setConfirmDialog] = useState(null); // { product, qtd }
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getProducts();
      const list = Array.isArray(data)
        ? data
        : data?.products || data?.data || [];
      setProducts(list);
    } catch (err) {
      setError(err.message || "Erro ao carregar produtos");
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Limpar mensagem de sucesso após 4s
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(null), 4000);
      return () => clearTimeout(t);
    }
  }, [success]);

  const filteredProducts = products
    .filter((p) => p.quantidade > 0) // só mostra quem tem estoque
    .filter((p) => {
      const term = searchTerm.toLowerCase();
      return (
        p.name.toLowerCase().includes(term) ||
        (p.sku && p.sku.toLowerCase().includes(term))
      );
    });

  const handleBaixa = async () => {
    if (!confirmDialog) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await stockOut(
        confirmDialog.product.id_product,
        confirmDialog.qtd,
      );
      setSuccess(
        `Baixa de ${confirmDialog.qtd}x "${confirmDialog.product.name}" realizada! Estoque restante: ${res.data?.quantidade ?? "—"}`,
      );
      setConfirmDialog(null);
      loadProducts();
    } catch (err) {
      setError(err.message || "Erro ao dar baixa no estoque");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-gray-50">
      <Sidebar
        user={user}
        onProfileClick={onProfileClick}
        onLogout={onLogout}
        onHomeClick={onHomeClick}
        onGraficosClick={onGraficosClick}
        onBaixaClick={onBaixaClick}
        onLotesClick={onLotesClick}
        onKitsClick={onKitsClick}
        currentPage="baixa"
      />

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-8 max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <div className="flex items-center gap-3 mb-2 pl-10 md:pl-0">
              <div className="p-2 md:p-2.5 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl shadow-lg">
                <ShoppingCart className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Baixa de Estoque
              </h1>
            </div>
            <p className="text-gray-500 text-sm md:text-base pl-10 md:pl-14">
              Vendeu no Mercado Livre? Dê a saída aqui para não vender a mesma
              peça duas vezes.
            </p>
          </div>

          {/* Alertas */}
          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-800">Erro</AlertTitle>
              <AlertDescription className="text-red-600">
                {error}
              </AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Sucesso</AlertTitle>
              <AlertDescription className="text-green-700">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {/* Busca */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Buscar por nome ou SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base bg-white border-gray-200 shadow-sm"
            />
          </div>

          {/* Lista de produtos */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-indigo-500 mb-3" />
              <p className="text-gray-500">Carregando produtos...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Package className="h-16 w-16 mb-4" />
              <p className="text-lg font-medium">
                {searchTerm
                  ? "Nenhum produto encontrado com estoque"
                  : "Todos os itens estão com estoque zerado"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProducts.map((product) => {
                const cond =
                  CONDICAO_MAP[product.condicao] || CONDICAO_MAP.NOVO;
                return (
                  <div
                    key={product.id_product}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow"
                  >
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">
                          {product.name}
                        </h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border font-medium ${cond.color}`}
                        >
                          {cond.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 flex-wrap">
                        <span className="font-mono">{product.sku}</span>
                        <span>
                          Estoque:{" "}
                          <strong
                            className={
                              product.quantidade <= 1
                                ? "text-red-600"
                                : "text-gray-800"
                            }
                          >
                            {product.quantidade}
                          </strong>
                        </span>
                        {product.preco != null && (
                          <span>
                            R${" "}
                            {Number(product.preco).toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Botão de baixa rápida (1 unidade) */}
                    <Button
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 h-10 gap-2 shadow-sm self-start sm:self-auto shrink-0"
                      onClick={() => setConfirmDialog({ product, qtd: 1 })}
                    >
                      <Minus className="h-4 w-4" />
                      Dar Baixa
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Resumo */}
          {!isLoading && products.length > 0 && (
            <div className="mt-6 flex items-center gap-2 text-sm text-gray-400">
              <AlertTriangle className="h-4 w-4" />
              <span>
                Exibindo {filteredProducts.length} produto(s) com estoque
                disponível de {products.length} total.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Dialog de confirmação */}
      <Dialog
        open={!!confirmDialog}
        onOpenChange={(open) => !open && setConfirmDialog(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Confirmar Baixa de Estoque
            </DialogTitle>
            <DialogDescription>
              Esta ação vai reduzir o estoque do item. Confirme somente se a
              venda já foi realizada.
            </DialogDescription>
          </DialogHeader>

          {confirmDialog && (
            <div className="py-4 space-y-3">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-semibold text-gray-900">
                  {confirmDialog.product.name}
                </p>
                <p className="text-sm text-gray-500 font-mono">
                  {confirmDialog.product.sku}
                </p>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Estoque atual:</span>
                <span className="font-bold text-gray-900">
                  {confirmDialog.product.quantidade}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Quantidade da baixa:</span>
                <span className="font-bold text-red-600">
                  -{confirmDialog.qtd}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm border-t pt-2">
                <span className="text-gray-600">Estoque após baixa:</span>
                <span className="font-bold text-gray-900">
                  {confirmDialog.product.quantidade - confirmDialog.qtd}
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline" disabled={isSubmitting}>
                Cancelar
              </Button>
            </DialogClose>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleBaixa}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processando...
                </>
              ) : (
                "Confirmar Baixa"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BaixaEstoque;
