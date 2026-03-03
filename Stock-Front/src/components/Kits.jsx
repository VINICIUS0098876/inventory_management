import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Sidebar from "./Sidebar";
import {
  getKits,
  createKit,
  updateKit,
  deleteKit,
} from "@/services/kitService";
import { getProducts } from "@/services/productService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  Loader2,
  Search,
  Package,
  ChevronDown,
  ChevronUp,
  DollarSign,
  PackageCheck,
  X,
} from "lucide-react";

const kitSchema = z.object({
  nome: z.string().min(1, "Nome do kit é obrigatório"),
  sku: z.string().min(1, "SKU virtual é obrigatório"),
  precoVenda: z
    .string()
    .min(1, "Preço de venda é obrigatório")
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, "Preço inválido"),
});

const Kits = ({
  user,
  onProfileClick,
  onLogout,
  onHomeClick,
  onGraficosClick,
  onBaixaClick,
  onLotesClick,
  onKitsClick,
}) => {
  const [kits, setKits] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedKit, setSelectedKit] = useState(null);
  const [expandedKit, setExpandedKit] = useState(null);

  // Items being added to the kit (create/edit)
  const [kitItems, setKitItems] = useState([]);
  const [productSearch, setProductSearch] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(kitSchema),
  });

  const fetchKits = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getKits();
      setKits(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Erro ao carregar kits");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao carregar produtos:", err);
    }
  }, []);

  useEffect(() => {
    fetchKits();
    fetchProducts();
  }, [fetchKits, fetchProducts]);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  // ============== CUSTO RATEADO CALCULATION ==============
  const calcularCustoKit = (items) => {
    return items.reduce((total, item) => {
      const custo = item.product?.custo || item.custo || 0;
      return total + custo * item.quantidade;
    }, 0);
  };

  const calcularLucroKit = (precoVenda, items) => {
    const custoTotal = calcularCustoKit(items);
    return precoVenda - custoTotal;
  };

  const calcularMargemKit = (precoVenda, items) => {
    const custoTotal = calcularCustoKit(items);
    if (precoVenda <= 0) return 0;
    return ((precoVenda - custoTotal) / precoVenda) * 100;
  };

  // ============== KIT ITEMS MANAGEMENT ==============
  const addItemToKit = (product) => {
    const existing = kitItems.find((i) => i.id_product === product.id_product);
    if (existing) {
      setKitItems(
        kitItems.map((i) =>
          i.id_product === product.id_product
            ? { ...i, quantidade: i.quantidade + 1 }
            : i,
        ),
      );
    } else {
      setKitItems([
        ...kitItems,
        {
          id_product: product.id_product,
          quantidade: 1,
          product: product,
          custo: product.custo || 0,
        },
      ]);
    }
    setProductSearch("");
  };

  const removeItemFromKit = (id_product) => {
    setKitItems(kitItems.filter((i) => i.id_product !== id_product));
  };

  const updateItemQuantidade = (id_product, quantidade) => {
    if (quantidade < 1) return;
    setKitItems(
      kitItems.map((i) =>
        i.id_product === id_product ? { ...i, quantidade } : i,
      ),
    );
  };

  // ============== CRUD ==============
  const onCreateSubmit = async (data) => {
    if (kitItems.length === 0) {
      setError("Adicione pelo menos um produto ao kit");
      return;
    }

    try {
      await createKit({
        nome: data.nome,
        sku: data.sku,
        precoVenda: Number(data.precoVenda),
        items: kitItems.map((i) => ({
          id_product: i.id_product,
          quantidade: i.quantidade,
        })),
      });
      setSuccess("Kit criado com sucesso!");
      setIsCreateOpen(false);
      reset();
      setKitItems([]);
      fetchKits();
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao criar kit");
    }
  };

  const onEditSubmit = async (data) => {
    if (!selectedKit) return;

    try {
      await updateKit(selectedKit.id_kit, {
        nome: data.nome,
        sku: data.sku,
        precoVenda: Number(data.precoVenda),
        items: kitItems.map((i) => ({
          id_product: i.id_product,
          quantidade: i.quantidade,
        })),
      });
      setSuccess("Kit atualizado com sucesso!");
      setIsEditOpen(false);
      setSelectedKit(null);
      reset();
      setKitItems([]);
      fetchKits();
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao atualizar kit");
    }
  };

  const handleDelete = async () => {
    if (!selectedKit) return;

    try {
      await deleteKit(selectedKit.id_kit);
      setSuccess("Kit excluído com sucesso!");
      setIsDeleteOpen(false);
      setSelectedKit(null);
      fetchKits();
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao excluir kit");
    }
  };

  const openEdit = (kit) => {
    setSelectedKit(kit);
    setValue("nome", kit.nome);
    setValue("sku", kit.sku);
    setValue("precoVenda", String(kit.precoVenda));
    setKitItems(
      (kit.kit_items || []).map((item) => ({
        id_product: item.id_product,
        quantidade: item.quantidade,
        product: item.product,
        custo: item.product?.custo || 0,
      })),
    );
    setIsEditOpen(true);
  };

  const openCreate = () => {
    reset({ nome: "", sku: "", precoVenda: "" });
    setKitItems([]);
    setIsCreateOpen(true);
  };

  // ============== FILTERED ==============
  const filteredKits = kits.filter(
    (kit) =>
      kit.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kit.sku?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredProducts = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku?.toLowerCase().includes(productSearch.toLowerCase()),
  );

  // ============== PRODUCT SELECTOR UI ==============
  const ProductSelector = () => (
    <div className="space-y-3">
      <Label className="font-semibold">Itens do Kit</Label>

      {/* Search products */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar produto por nome ou SKU..."
          value={productSearch}
          onChange={(e) => setProductSearch(e.target.value)}
          className="pl-10 bg-gray-300 text-black placeholder:text-gray-500"
        />
      </div>

      {/* Product dropdown */}
      {productSearch && (
        <div className="max-h-40 overflow-y-auto bg-white rounded-md border border-gray-200 shadow-md">
          {filteredProducts.length === 0 ? (
            <p className="p-3 text-gray-400 text-sm">
              Nenhum produto encontrado
            </p>
          ) : (
            filteredProducts.slice(0, 10).map((product) => (
              <button
                key={product.id_product}
                type="button"
                onClick={() => addItemToKit(product)}
                className="w-full text-left px-3 py-2 hover:bg-blue-50 text-gray-900 text-sm flex justify-between items-center border-b border-gray-100 last:border-0"
              >
                <span>
                  {product.name}{" "}
                  <span className="text-gray-400">({product.sku})</span>
                </span>
                <span className="text-green-600 font-medium">
                  R$ {(product.custo || 0).toFixed(2)}
                </span>
              </button>
            ))
          )}
        </div>
      )}

      {/* Selected items list */}
      {kitItems.length > 0 && (
        <div className="space-y-2 mt-2">
          {kitItems.map((item) => (
            <div
              key={item.id_product}
              className="flex items-center justify-between bg-gray-100 rounded-lg px-3 py-2 border border-gray-200"
            >
              <div className="flex-1">
                <span className="text-gray-900 text-sm font-medium">
                  {item.product?.name || "Produto"}
                </span>
                <span className="text-gray-400 text-xs ml-2">
                  ({item.product?.sku})
                </span>
                <span className="text-green-600 text-xs ml-2">
                  Custo: R$ {(item.custo || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    updateItemQuantidade(item.id_product, item.quantidade - 1)
                  }
                  className="w-7 h-7 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center justify-center font-bold"
                >
                  -
                </button>
                <span className="text-gray-900 text-sm w-6 text-center font-semibold">
                  {item.quantidade}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    updateItemQuantidade(item.id_product, item.quantidade + 1)
                  }
                  className="w-7 h-7 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center justify-center font-bold"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => removeItemFromKit(item.id_product)}
                  className="w-7 h-7 rounded bg-red-500 text-white hover:bg-red-600 flex items-center justify-center ml-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Custo total resumo */}
          <div className="bg-blue-50 rounded-lg px-3 py-2 border border-blue-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 font-medium">
                Custo Total do Kit:
              </span>
              <span className="text-blue-700 font-bold">
                R$ {calcularCustoKit(kitItems).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Aviso se algum produto não tem custo */}
          {kitItems.some((item) => !item.product?.custo && !item.custo) && (
            <div className="bg-yellow-50 rounded-lg px-3 py-2 border border-yellow-200">
              <p className="text-yellow-700 text-xs">
                ⚠ Alguns produtos não possuem custo cadastrado. O cálculo de
                lucro será impreciso.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // ============== STATS ==============
  const totalKits = kits.length;
  const totalItens = kits.reduce(
    (acc, k) =>
      acc + (k.kit_items || []).reduce((sum, i) => sum + i.quantidade, 0),
    0,
  );
  const totalCusto = kits.reduce(
    (acc, k) => acc + calcularCustoKit(k.kit_items || []),
    0,
  );

  // ============== RENDER ==============
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
        currentPage="kits"
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-4 md:px-8 md:py-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="pl-10 md:pl-0">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Gerenciamento de Kits
              </h1>
              <p className="text-gray-500 mt-1 text-sm md:text-base">
                Agrupe produtos em kits virtuais com custo rateado
              </p>
            </div>
            <Button
              onClick={openCreate}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold shadow-lg h-11 md:h-12 px-4 md:px-6 self-start sm:self-auto"
            >
              <Plus className="mr-2 h-5 w-5" />
              <span className="hidden sm:inline">Novo Kit</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {/* Alerts */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertTitle>Sucesso</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-100 rounded-lg">
                  <PackageCheck className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total de Kits</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalKits}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 rounded-lg">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Itens nos Kits</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalItens}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-green-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Custo Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    R$ {totalCusto.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Buscar kits por nome ou SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 bg-white border-gray-200"
            />
          </div>

          {/* Kits List */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-3 text-gray-500">Carregando kits...</span>
            </div>
          ) : filteredKits.length === 0 ? (
            <div className="text-center py-20">
              <PackageCheck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-500">
                {searchTerm ? "Nenhum kit encontrado" : "Nenhum kit cadastrado"}
              </h3>
              <p className="text-gray-400 mt-1">
                {searchTerm
                  ? "Tente buscar por outro termo"
                  : 'Clique em "Novo Kit" para começar'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredKits.map((kit) => {
                const custoTotal = calcularCustoKit(kit.kit_items || []);
                const lucro = calcularLucroKit(
                  kit.precoVenda,
                  kit.kit_items || [],
                );
                const margem = calcularMargemKit(
                  kit.precoVenda,
                  kit.kit_items || [],
                );
                const isExpanded = expandedKit === kit.id_kit;
                const itemCount = (kit.kit_items || []).reduce(
                  (sum, i) => sum + i.quantidade,
                  0,
                );

                return (
                  <div
                    key={kit.id_kit}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                  >
                    {/* Kit Header */}
                    <div className="p-4 md:p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
                        <div
                          className="flex items-center gap-3 md:gap-4 flex-1 cursor-pointer min-w-0"
                          onClick={() =>
                            setExpandedKit(isExpanded ? null : kit.id_kit)
                          }
                        >
                          <div className="p-2 md:p-2.5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow shrink-0">
                            <PackageCheck className="h-4 w-4 md:h-5 md:w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-base md:text-lg truncate">
                              {kit.nome}
                            </h3>
                            <div className="flex items-center gap-2 sm:gap-4 mt-1 text-xs sm:text-sm text-gray-500 flex-wrap">
                              <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-mono text-xs font-medium">
                                {kit.sku}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3.5 w-3.5" />
                                R$ {custoTotal.toFixed(2)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Package className="h-3.5 w-3.5" />
                                {itemCount} item(s)
                              </span>
                              <span className="hidden sm:inline">
                                {new Date(kit.createdAt).toLocaleDateString(
                                  "pt-BR",
                                )}
                              </span>
                            </div>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-gray-400 shrink-0" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400 shrink-0" />
                          )}
                        </div>

                        {/* Financial + Actions */}
                        <div className="flex items-center gap-3 sm:gap-4 self-end sm:self-auto shrink-0">
                          <div className="hidden md:flex items-center gap-4 text-sm mr-2">
                            <div className="text-right">
                              <div className="text-gray-400">Venda</div>
                              <div className="text-gray-900 font-bold">
                                R$ {kit.precoVenda.toFixed(2)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-gray-400">Lucro</div>
                              <div
                                className={`font-bold ${
                                  lucro >= 0 ? "text-green-600" : "text-red-600"
                                }`}
                              >
                                R$ {lucro.toFixed(2)}{" "}
                                <span className="text-xs font-medium">
                                  ({margem.toFixed(1)}%)
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => openEdit(kit)}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow-sm"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedKit(kit);
                              setIsDeleteOpen(true);
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white font-semibold shadow-sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded items */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 bg-gray-50 p-3 sm:p-5">
                        {(kit.kit_items || []).length > 0 ? (
                          <div className="space-y-2">
                            <h4 className="font-semibold text-gray-700 text-sm mb-3">
                              Produtos neste kit:
                            </h4>
                            <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
                              <table className="w-full text-xs sm:text-sm min-w-[480px]">
                                <thead>
                                  <tr className="text-left text-gray-500 border-b border-gray-200">
                                    <th className="pb-2 font-medium">Nome</th>
                                    <th className="pb-2 font-medium">SKU</th>
                                    <th className="pb-2 font-medium">Qtd</th>
                                    <th className="pb-2 font-medium">
                                      Custo Unit.
                                    </th>
                                    <th className="pb-2 font-medium">
                                      Subtotal
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {kit.kit_items.map((item, idx) => {
                                    const custoUnit = item.product?.custo || 0;
                                    const subtotal =
                                      custoUnit * item.quantidade;
                                    return (
                                      <tr
                                        key={idx}
                                        className="border-b border-gray-100 last:border-0"
                                      >
                                        <td className="py-2 font-medium text-gray-900">
                                          {item.product?.name ||
                                            "Produto removido"}
                                        </td>
                                        <td className="py-2 text-gray-500">
                                          {item.product?.sku || "—"}
                                        </td>
                                        <td className="py-2 text-gray-700">
                                          {item.quantidade}
                                        </td>
                                        <td className="py-2 text-gray-700">
                                          R$ {custoUnit.toFixed(2)}
                                        </td>
                                        <td className="py-2 text-gray-900 font-semibold">
                                          R$ {subtotal.toFixed(2)}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>

                            {/* Summary */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white rounded-lg px-3 sm:px-4 py-3 mt-3 border border-gray-200 shadow-sm gap-2">
                              <span className="font-semibold text-gray-700 text-sm">
                                Resumo do Kit
                              </span>
                              <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm flex-wrap">
                                <span className="text-gray-600">
                                  Custo:{" "}
                                  <strong className="text-gray-900">
                                    R$ {custoTotal.toFixed(2)}
                                  </strong>
                                </span>
                                <span className="text-gray-600">
                                  Venda:{" "}
                                  <strong className="text-gray-900">
                                    R$ {kit.precoVenda.toFixed(2)}
                                  </strong>
                                </span>
                                <span
                                  className={`font-bold ${
                                    lucro >= 0
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  Lucro: R$ {lucro.toFixed(2)} (
                                  {margem.toFixed(1)}%)
                                </span>
                              </div>
                            </div>

                            {/* Mobile financial info */}
                            <div className="flex flex-wrap gap-3 mt-2 md:hidden text-sm">
                              <span className="text-gray-600">
                                Venda:{" "}
                                <strong>R$ {kit.precoVenda.toFixed(2)}</strong>
                              </span>
                              <span
                                className={
                                  lucro >= 0 ? "text-green-600" : "text-red-600"
                                }
                              >
                                Lucro:{" "}
                                <strong>
                                  R$ {lucro.toFixed(2)} ({margem.toFixed(1)}%)
                                </strong>
                              </span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-400 text-sm text-center py-4">
                            Nenhum produto vinculado a este kit.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ============== CREATE DIALOG ============== */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PackageCheck className="h-5 w-5 text-purple-600" />
              Novo Kit
            </DialogTitle>
            <DialogDescription>
              Agrupe produtos em um kit virtual com SKU próprio.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onCreateSubmit)}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Kit *</Label>
                <Input
                  id="nome"
                  {...register("nome")}
                  placeholder="Ex: Kit 3 Escovas ML"
                  className="bg-gray-300 text-black outline-none border-none"
                />
                {errors.nome && (
                  <p className="text-sm text-red-500">{errors.nome.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU Virtual *</Label>
                <Input
                  id="sku"
                  {...register("sku")}
                  placeholder="Ex: KIT-ESC-001"
                  className="bg-gray-300 text-black outline-none border-none"
                />
                {errors.sku && (
                  <p className="text-sm text-red-500">{errors.sku.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="precoVenda">Preço de Venda do Kit (R$) *</Label>
                <Input
                  id="precoVenda"
                  {...register("precoVenda")}
                  placeholder="0.00"
                  className="bg-gray-300 text-black outline-none border-none"
                />
                {errors.precoVenda && (
                  <p className="text-sm text-red-500">
                    {errors.precoVenda.message}
                  </p>
                )}
              </div>

              {ProductSelector()}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  "Criar Kit"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ============== EDIT DIALOG ============== */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-600" />
              Editar Kit
            </DialogTitle>
            <DialogDescription>
              Altere os dados e itens do kit.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onEditSubmit)}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Kit *</Label>
                <Input
                  id="nome"
                  {...register("nome")}
                  className="bg-gray-300 text-black outline-none border-none"
                />
                {errors.nome && (
                  <p className="text-sm text-red-500">{errors.nome.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU Virtual *</Label>
                <Input
                  id="sku"
                  {...register("sku")}
                  className="bg-gray-300 text-black outline-none border-none"
                />
                {errors.sku && (
                  <p className="text-sm text-red-500">{errors.sku.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="precoVenda">Preço de Venda do Kit (R$) *</Label>
                <Input
                  id="precoVenda"
                  {...register("precoVenda")}
                  className="bg-gray-300 text-black outline-none border-none"
                />
                {errors.precoVenda && (
                  <p className="text-sm text-red-500">
                    {errors.precoVenda.message}
                  </p>
                )}
              </div>

              {ProductSelector()}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Alterações"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ============== DELETE DIALOG ============== */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Excluir Kit
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o kit{" "}
              <strong>"{selectedKit?.nome}"</strong>? Esta ação não pode ser
              desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Kits;
