import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Sidebar from "./Sidebar";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/services/productService";
import { getLotes } from "@/services/loteService";
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
  Package,
  AlertCircle,
  Loader2,
  Search,
  AlertTriangle,
  DollarSign,
  TrendingDown,
  Download,
  Tag,
  Copy,
  CheckCircle2,
  Calculator,
  Printer,
} from "lucide-react";

// Categorias Mercado Livre com taxas aproximadas
const ML_CATEGORIAS = [
  { value: "eletronicos", label: "Eletrônicos", taxa: 0.16 },
  { value: "celulares", label: "Celulares e Smartphones", taxa: 0.14 },
  { value: "informatica", label: "Informática", taxa: 0.16 },
  { value: "eletrodomesticos", label: "Eletrodomésticos", taxa: 0.13 },
  { value: "casa", label: "Casa e Decoração", taxa: 0.15 },
  { value: "ferramentas", label: "Ferramentas", taxa: 0.13 },
  { value: "automotivo", label: "Acessórios para Veículos", taxa: 0.16 },
  { value: "roupas", label: "Calçados, Roupas e Bolsas", taxa: 0.16 },
  { value: "esportes", label: "Esportes e Fitness", taxa: 0.14 },
  { value: "brinquedos", label: "Brinquedos", taxa: 0.16 },
  { value: "beleza", label: "Beleza e Cuidado Pessoal", taxa: 0.20 },
  { value: "saude", label: "Saúde", taxa: 0.18 },
  { value: "games", label: "Games", taxa: 0.16 },
  { value: "livros", label: "Livros, Revistas e Comics", taxa: 0.14 },
  { value: "musica", label: "Música, Filmes e Seriados", taxa: 0.11 },
  { value: "outros", label: "Outros", taxa: 0.16 },
];

// Constantes fixas do Mercado Livre
const ML_CUSTO_FIXO = 6.0; // R$ 6 para itens < R$ 79
const ML_LIMITE_FRETE_GRATIS = 79; // Limite para frete grátis
const ML_CUSTO_FRETE_DEFAULT = 19.9; // Custo médio de frete (Mercado Envios)

/**
 * Calcula o lucro líquido e margem de um produto vendido no ML
 */
function calcularLucroML(precoVenda, custo, taxaCategoria, custoFreteCustom) {
  if (!precoVenda || precoVenda <= 0) return null;

  const taxaML = precoVenda * taxaCategoria;
  const custoFixo = precoVenda < ML_LIMITE_FRETE_GRATIS ? ML_CUSTO_FIXO : 0;
  const custoFrete =
    precoVenda >= ML_LIMITE_FRETE_GRATIS
      ? (custoFreteCustom ?? ML_CUSTO_FRETE_DEFAULT)
      : 0;

  const totalDescontos = taxaML + custoFixo + custoFrete;
  const receitaLiquida = precoVenda - totalDescontos;
  const lucroLiquido = receitaLiquida - (custo || 0);
  const margem = precoVenda > 0 ? (lucroLiquido / precoVenda) * 100 : 0;

  return {
    taxaML,
    custoFixo,
    custoFrete,
    totalDescontos,
    receitaLiquida,
    lucroLiquido,
    margem,
  };
}

// Mapa de condições para labels e cores
const CONDICAO_OPTIONS = [
  {
    value: "NOVO",
    label: "Novo",
    color: "bg-green-100 text-green-700 border-green-200",
  },
  {
    value: "REEMBALADO",
    label: "Reembalado (Open Box)",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  {
    value: "USADO",
    label: "Usado",
    color: "bg-orange-100 text-orange-700 border-orange-200",
  },
  {
    value: "DEFEITO",
    label: "Defeito",
    color: "bg-red-100 text-red-700 border-red-200",
  },
];

const getCondicaoInfo = (condicao) => {
  return (
    CONDICAO_OPTIONS.find((c) => c.value === condicao) || CONDICAO_OPTIONS[0]
  );
};

const productSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .min(3, "Nome deve ter no mínimo 3 caracteres"),
  quantity: z
    .string()
    .min(1, "Quantidade é obrigatória")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Quantidade deve ser um número maior ou igual a 0",
    }),
  price: z
    .string()
    .min(1, "Preço é obrigatório")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Preço deve ser um número maior ou igual a 0",
    }),
  custo: z
    .string()
    .optional()
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), {
      message: "Custo deve ser um número maior ou igual a 0",
    }),
  condicao: z.enum(["NOVO", "REEMBALADO", "USADO", "DEFEITO"], {
    required_error: "Condição do item é obrigatória",
  }),
});

const Home = ({
  user,
  onProfileClick,
  onLogout,
  onGraficosClick,
  onHomeClick,
  onBaixaClick,
  onLotesClick,
  onKitsClick,
  onPrintEtiqueta,
}) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [mlCategoriaCreate, setMlCategoriaCreate] = useState("outros");
  const [mlCategoriaEdit, setMlCategoriaEdit] = useState("outros");
  const [custoFreteCreate, setCustoFreteCreate] = useState(ML_CUSTO_FRETE_DEFAULT);
  const [custoFreteEdit, setCustoFreteEdit] = useState(ML_CUSTO_FRETE_DEFAULT);
  const [lotes, setLotes] = useState([]);
  const [selectedLoteCreate, setSelectedLoteCreate] = useState("");
  const [selectedLoteEdit, setSelectedLoteEdit] = useState("");

  // Filtrar produtos pelo termo de busca (nome, SKU ou condição)
  const filteredProducts = products.filter((product) => {
    const term = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(term) ||
      (product.sku && product.sku.toLowerCase().includes(term)) ||
      (product.condicao && getCondicaoInfo(product.condicao).label.toLowerCase().includes(term))
    );
  });

  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    formState: { errors: errorsCreate },
    reset: resetCreate,
    watch: watchCreate,
  } = useForm({
    resolver: zodResolver(productSchema),
  });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: errorsEdit },
    reset: resetEdit,
    watch: watchEdit,
  } = useForm({
    resolver: zodResolver(productSchema),
  });

  // Watch para cálculo em tempo real - Create
  const createPrice = watchCreate("price");
  const createCusto = watchCreate("custo");
  const taxaCategoriaCreate =
    ML_CATEGORIAS.find((c) => c.value === mlCategoriaCreate)?.taxa ?? 0.16;
  const lucroCreate = calcularLucroML(
    Number(createPrice) || 0,
    Number(createCusto) || 0,
    taxaCategoriaCreate,
    custoFreteCreate,
  );

  // Watch para cálculo em tempo real - Edit
  const editPrice = watchEdit("price");
  const editCusto = watchEdit("custo");
  const taxaCategoriaEdit =
    ML_CATEGORIAS.find((c) => c.value === mlCategoriaEdit)?.taxa ?? 0.16;
  const lucroEdit = calcularLucroML(
    Number(editPrice) || 0,
    Number(editCusto) || 0,
    taxaCategoriaEdit,
    custoFreteEdit,
  );

  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getProducts();
      // Ajustar conforme a estrutura da resposta do backend
      if (Array.isArray(data)) {
        setProducts(data);
      } else if (data.products && Array.isArray(data.products)) {
        setProducts(data.products);
      } else if (data.data && Array.isArray(data.data)) {
        setProducts(data.data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      setError(err.message || "Erro ao carregar produtos");
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    loadLotes();
  }, []);

  const loadLotes = async () => {
    try {
      const data = await getLotes();
      setLotes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao carregar lotes:", err);
    }
  };

  const handleCreateProduct = async (data) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await createProduct({
        name: data.name,
        quantidade: Number(data.quantity),
        preco: Number(data.price),
        custo: data.custo ? Number(data.custo) : null,
        condicao: data.condicao,
        id_lote: selectedLoteCreate ? Number(selectedLoteCreate) : null,
      });
      setIsCreateModalOpen(false);
      resetCreate();
      setMlCategoriaCreate("outros");
      setCustoFreteCreate(ML_CUSTO_FRETE_DEFAULT);
      setSelectedLoteCreate("");
      loadProducts();
    } catch (err) {
      setError(err.message || "Erro ao criar produto");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProduct = async (data) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await updateProduct(editingProduct.id || editingProduct.id_product, {
        name: data.name,
        quantidade: Number(data.quantity),
        preco: Number(data.price),
        custo: data.custo ? Number(data.custo) : null,
        condicao: data.condicao,
        id_lote: selectedLoteEdit ? Number(selectedLoteEdit) : null,
      });
      setIsEditModalOpen(false);
      setEditingProduct(null);
      resetEdit();
      loadProducts();
    } catch (err) {
      setError(err.message || "Erro ao atualizar produto");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm("Tem certeza que deseja deletar este produto?")) {
      return;
    }

    try {
      await deleteProduct(productId);
      loadProducts();
    } catch (err) {
      setError(err.message || "Erro ao deletar produto");
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    resetEdit({
      name: product.name,
      quantity: String(product.quantidade),
      price: String(product.preco),
      custo: product.custo != null ? String(product.custo) : "",
      condicao: product.condicao || "NOVO",
    });
    setMlCategoriaEdit("outros");
    setCustoFreteEdit(ML_CUSTO_FRETE_DEFAULT);
    setSelectedLoteEdit(product.id_lote ? String(product.id_lote) : "");
    setIsEditModalOpen(true);
  };

  const [copiedSku, setCopiedSku] = useState(null);
  const copySkuToClipboard = (sku) => {
    navigator.clipboard.writeText(sku);
    setCopiedSku(sku);
    setTimeout(() => setCopiedSku(null), 2000);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const dataAtual = new Date().toLocaleDateString("pt-BR");
    const horaAtual = new Date().toLocaleTimeString("pt-BR");

    // Título
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235); // Azul
    doc.text("Relatório de Estoque", 14, 22);

    // Subtítulo com data
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${dataAtual} às ${horaAtual}`, 14, 30);

    // Linha separadora
    doc.setDrawColor(37, 99, 235);
    doc.line(14, 34, 196, 34);

    // KPIs
    doc.setFontSize(12);
    doc.setTextColor(0);
    const totalProdutos = products.length;
    const valorTotal = products.reduce(
      (acc, p) => acc + Number(p.preco) * Number(p.quantidade),
      0,
    );
    const itensCriticos = products.filter((p) => p.quantidade < 5).length;

    doc.text(`Total de Produtos: ${totalProdutos}`, 14, 44);
    doc.text(
      `Valor Total em Estoque: R$ ${valorTotal.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      })}`,
      14,
      52,
    );
    doc.setTextColor(
      itensCriticos > 0 ? 220 : 0,
      itensCriticos > 0 ? 38 : 0,
      itensCriticos > 0 ? 38 : 0,
    );
    doc.text(`Itens Críticos (< 5 unidades): ${itensCriticos}`, 14, 60);

    // Tabela de produtos
    const tableData = products.map((product, index) => [
      index + 1,
      product.sku || "—",
      product.name,
      getCondicaoInfo(product.condicao).label,
      product.quantidade,
      `R$ ${Number(product.preco).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      })}`,
      `R$ ${(Number(product.preco) * Number(product.quantidade)).toLocaleString(
        "pt-BR",
        { minimumFractionDigits: 2 },
      )}`,
      product.quantidade < 5 ? "BAIXO" : "OK",
    ]);

    autoTable(doc, {
      startY: 70,
      head: [
        [
          "#",
          "SKU",
          "Produto",
          "Condição",
          "Qtd",
          "Preço Unit.",
          "Valor Total",
          "Status",
        ],
      ],
      body: tableData,
      theme: "striped",
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontStyle: "bold",
      },
      bodyStyles: {
        textColor: 50,
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 12 },
        1: { halign: "center", cellWidth: 30 },
        3: { halign: "center" },
        4: { halign: "center" },
        5: { halign: "right" },
        6: { halign: "right" },
        7: { halign: "center" },
      },
      didParseCell: function (data) {
        if (data.column.index === 7 && data.cell.raw === "BAIXO") {
          data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fontStyle = "bold";
        }
      },
    });

    // Rodapé
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Página ${i} de ${pageCount} - Sistema de Gestão de Estoque`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: "center" },
      );
    }

    // Download
    doc.save(`relatorio-estoque-${dataAtual.replace(/\//g, "-")}.pdf`);
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
        currentPage="home"
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-4 md:px-8 md:py-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="pl-10 md:pl-0">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-gray-600 mt-1 text-sm md:text-base">Gerencie seus produtos</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar por nome, SKU ou condição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-72 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={generatePDF}
                  disabled={products.length === 0}
                  className="flex-1 sm:flex-none bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg text-sm"
                >
                  <Download className="mr-1.5 h-4 w-4" />
                  <span className="hidden sm:inline">Baixar Relatório</span>
                  <span className="sm:hidden">PDF</span>
                </Button>
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex-1 sm:flex-none bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg text-sm"
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  <span className="hidden sm:inline">Novo Produto</span>
                  <span className="sm:hidden">Novo</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* KPIs */}
          {!isLoading && products.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
              {/* Total de Produtos */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-500">
                      Total de Produtos
                    </p>
                    <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">
                      {products.length}
                    </p>
                  </div>
                  <div className="p-2.5 sm:p-3 bg-blue-100 rounded-full shrink-0">
                    <Package className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Valor Total em Estoque */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-500">
                      Valor Total em Estoque
                    </p>
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600 mt-1 truncate">
                      R${" "}
                      {products
                        .reduce(
                          (acc, p) =>
                            acc + Number(p.preco) * Number(p.quantidade),
                          0,
                        )
                        .toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                    </p>
                  </div>
                  <div className="p-2.5 sm:p-3 bg-green-100 rounded-full shrink-0">
                    <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                  </div>
                </div>
              </div>

              {/* Itens Críticos */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-500">
                      Itens Críticos
                    </p>
                    <p className="text-2xl md:text-3xl font-bold text-red-600 mt-1">
                      {products.filter((p) => p.quantidade < 5).length}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Produtos com menos de 5 unidades
                    </p>
                  </div>
                  <div className="p-2.5 sm:p-3 bg-red-100 rounded-full shrink-0">
                    <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Nenhum produto cadastrado
              </h3>
              <p className="text-gray-500 mb-6">
                Comece cadastrando seu primeiro produto
              </p>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
              >
                <Plus className="mr-2 h-5 w-5" />
                Cadastrar Produto
              </Button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Nenhum produto encontrado
              </h3>
              <p className="text-gray-500 mb-6">Tente buscar por outro termo</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map((product) => {
                const isLowStock = product.quantidade < 5;
                return (
                  <div
                    key={product.id || product.id_product}
                    className={`bg-white rounded-xl shadow-lg p-4 md:p-6 hover:shadow-xl transition-all ${
                      isLowStock
                        ? "border-2 border-red-500 ring-2 ring-red-100"
                        : "border border-gray-200"
                    }`}
                  >
                    {isLowStock && (
                      <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-red-50 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium text-red-600">
                          Estoque baixo!
                        </span>
                      </div>
                    )}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="text-sm text-gray-500 mb-1">
                          ID: {product.id || product.id_product}
                        </div>
                        {/* SKU com botão de copiar */}
                        {product.sku && (
                          <div className="flex items-center gap-1.5 mb-2">
                            <Tag className="h-3.5 w-3.5 text-indigo-500" />
                            <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                              {product.sku}
                            </span>
                            <button
                              onClick={() => copySkuToClipboard(product.sku)}
                              className="p-0.5 hover:bg-gray-100 rounded transition-colors"
                              title="Copiar SKU"
                            >
                              {copiedSku === product.sku ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                              ) : (
                                <Copy className="h-3.5 w-3.5 text-gray-400" />
                              )}
                            </button>
                          </div>
                        )}
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          {product.name}
                        </h3>
                        {/* Badge de condição */}
                        {product.condicao && (
                          <span
                            className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${getCondicaoInfo(product.condicao).color}`}
                          >
                            {getCondicaoInfo(product.condicao).label}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Quantidade:
                        </span>
                        <span
                          className={`text-sm font-semibold ${
                            isLowStock ? "text-red-600" : "text-gray-900"
                          }`}
                        >
                          {product.quantidade}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Preço:</span>
                        <span className="text-sm font-semibold text-blue-600">
                          R${" "}
                          {Number(product.preco).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-3 md:pt-4 border-t border-gray-200">
                      <Button
                        onClick={() => openEditModal(product)}
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold shadow-lg text-xs sm:text-sm"
                      >
                        <Edit className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                        <span className="text-white">Editar</span>
                      </Button>
                      <Button
                        onClick={() =>
                          handleDeleteProduct(product.id || product.id_product)
                        }
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold shadow-lg text-xs sm:text-sm"
                      >
                        <Trash2 className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                        <span className="text-white">Deletar</span>
                      </Button>
                    </div>
                    <Button
                      onClick={() => onPrintEtiqueta && onPrintEtiqueta(product)}
                      size="sm"
                      className="w-full mt-2 bg-gray-700 hover:bg-gray-800 text-white font-semibold shadow text-xs sm:text-sm"
                    >
                      <Printer className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                      <span className="text-white">Imprimir Etiqueta</span>
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Create Product Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogClose onClose={() => setIsCreateModalOpen(false)} />
          <DialogHeader>
            <DialogTitle>Novo Produto</DialogTitle>
            <DialogDescription>
              Preencha os dados para cadastrar um novo produto
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitCreate(handleCreateProduct)}>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="create-name" className="text-sm font-semibold">
                  Nome do Produto
                </Label>
                <Input
                  id="create-name"
                  {...registerCreate("name")}
                  placeholder="Nome do produto"
                  className="h-11 bg-gray-300 outline-none border-none mt-2"
                />
                {errorsCreate.name && (
                  <p className="text-sm text-red-600">
                    {errorsCreate.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="create-condicao"
                  className="text-sm font-semibold"
                >
                  Condição do Item <span className="text-red-500">*</span>
                </Label>
                <select
                  id="create-condicao"
                  {...registerCreate("condicao")}
                  className="flex h-11 w-full rounded-md bg-gray-300 px-3 py-2 text-sm outline-none border-none mt-2"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Selecione a condição...
                  </option>
                  {CONDICAO_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {errorsCreate.condicao && (
                  <p className="text-sm text-red-600">
                    {errorsCreate.condicao.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="create-quantity"
                  className="text-sm font-semibold"
                >
                  Quantidade em Estoque:
                </Label>
                <Input
                  id="create-quantity"
                  type="number"
                  {...registerCreate("quantity")}
                  placeholder="0"
                  className="h-11 bg-gray-300 outline-none border-none mt-2"
                />
                {errorsCreate.quantity && (
                  <p className="text-sm text-red-600">
                    {errorsCreate.quantity.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-price" className="text-sm font-semibold">
                  Preço de Venda:
                </Label>
                <Input
                  id="create-price"
                  type="number"
                  step="0.01"
                  {...registerCreate("price")}
                  placeholder="0.00"
                  className="h-11 bg-gray-300 outline-none border-none mt-2"
                />
                {errorsCreate.price && (
                  <p className="text-sm text-red-600">
                    {errorsCreate.price.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-custo" className="text-sm font-semibold">
                  Preço de Custo (opcional):
                </Label>
                <Input
                  id="create-custo"
                  type="number"
                  step="0.01"
                  {...registerCreate("custo")}
                  placeholder="0.00"
                  className="h-11 bg-gray-300 outline-none border-none mt-2"
                />
                {errorsCreate.custo && (
                  <p className="text-sm text-red-600">
                    {errorsCreate.custo.message}
                  </p>
                )}
              </div>

              {/* Lote selector */}
              <div className="space-y-2">
                <Label htmlFor="create-lote" className="text-sm font-semibold">
                  Lote (opcional):
                </Label>
                <select
                  id="create-lote"
                  value={selectedLoteCreate}
                  onChange={(e) => setSelectedLoteCreate(e.target.value)}
                  className="flex h-11 w-full rounded-md bg-gray-300 px-3 py-2 text-sm outline-none border-none mt-2"
                >
                  <option value="">Avulso (sem lote)</option>
                  {lotes.map((lote) => (
                    <option key={lote.id_lote} value={lote.id_lote}>
                      {lote.nome} — R$ {lote.custoTotal?.toFixed(2)}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">
                  Vincule este produto a um lote de compra ou deixe como avulso.
                </p>
              </div>

              {/* Calculadora ML */}
              <div className="space-y-3 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                <div className="flex items-center gap-2 mb-1">
                  <Calculator className="h-4 w-4 text-yellow-700" />
                  <span className="text-sm font-bold text-yellow-800">
                    Calculadora Mercado Livre
                  </span>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-yellow-800">
                    Categoria ML
                  </Label>
                  <select
                    value={mlCategoriaCreate}
                    onChange={(e) => setMlCategoriaCreate(e.target.value)}
                    className="flex h-9 w-full rounded-md bg-white px-3 py-1 text-sm border border-yellow-300"
                  >
                    {ML_CATEGORIAS.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label} ({(cat.taxa * 100).toFixed(0)}%)
                      </option>
                    ))}
                  </select>
                </div>

                {Number(createPrice) >= ML_LIMITE_FRETE_GRATIS && (
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-yellow-800">
                      Custo de Frete (Mercado Envios)
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={custoFreteCreate}
                      onChange={(e) =>
                        setCustoFreteCreate(Number(e.target.value) || 0)
                      }
                      className="h-9 bg-white border-yellow-300 text-sm"
                    />
                  </div>
                )}

                {lucroCreate && Number(createPrice) > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-yellow-200">
                    <div className="flex justify-between text-xs text-yellow-800">
                      <span>Taxa ML ({(taxaCategoriaCreate * 100).toFixed(0)}%)</span>
                      <span className="font-mono">
                        - R$ {lucroCreate.taxaML.toFixed(2)}
                      </span>
                    </div>
                    {lucroCreate.custoFixo > 0 && (
                      <div className="flex justify-between text-xs text-yellow-800">
                        <span>Custo Fixo (item &lt; R$ 79)</span>
                        <span className="font-mono">
                          - R$ {lucroCreate.custoFixo.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {lucroCreate.custoFrete > 0 && (
                      <div className="flex justify-between text-xs text-yellow-800">
                        <span>Custo de Frete</span>
                        <span className="font-mono">
                          - R$ {lucroCreate.custoFrete.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {Number(createCusto) > 0 && (
                      <div className="flex justify-between text-xs text-yellow-800">
                        <span>Preço de Custo</span>
                        <span className="font-mono">
                          - R$ {Number(createCusto).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div
                      className={`flex justify-between text-sm font-bold pt-2 border-t border-yellow-300 ${
                        lucroCreate.lucroLiquido < 0
                          ? "text-red-700"
                          : "text-green-700"
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        {lucroCreate.lucroLiquido < 0 && (
                          <AlertTriangle className="h-4 w-4" />
                        )}
                        Lucro Líquido:
                      </span>
                      <span className="font-mono">
                        R$ {lucroCreate.lucroLiquido.toFixed(2)} (
                        {lucroCreate.margem.toFixed(1)}%)
                      </span>
                    </div>
                    {lucroCreate.lucroLiquido < 0 && (
                      <p className="text-xs text-red-600 font-semibold bg-red-50 px-2 py-1 rounded">
                        ⚠️ Atenção: Margem negativa! Você terá prejuízo nesta
                        venda.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-700">
                  <Tag className="inline h-3.5 w-3.5 mr-1" />O código{" "}
                  <strong>SKU</strong> será gerado automaticamente ao cadastrar
                  o produto (ex:{" "}
                  <code className="bg-blue-100 px-1 rounded">VENTI-NV-001</code>
                  ).
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 border-none hover:to-indigo-700"
              >
                <span className="text-white font-semibold sh">Cancelar</span>
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold shadow-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                    <span className="text-white">Salvando...</span>
                  </>
                ) : (
                  <span className="text-white">Cadastrar</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Product Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogClose onClose={() => setIsEditModalOpen(false)} />
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
            <DialogDescription>Atualize os dados do produto</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit(handleEditProduct)}>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-sm font-semibold">
                  Nome do Produto
                </Label>
                <Input
                  id="edit-name"
                  {...registerEdit("name")}
                  placeholder="Nome do produto"
                  className="h-11 bg-gray-300 outline-none border-none mt-2"
                />
                {errorsEdit.name && (
                  <p className="text-sm text-red-600">
                    {errorsEdit.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="edit-condicao"
                  className="text-sm font-semibold"
                >
                  Condição do Item <span className="text-red-500">*</span>
                </Label>
                <select
                  id="edit-condicao"
                  {...registerEdit("condicao")}
                  className="flex h-11 w-full rounded-md bg-gray-300 px-3 py-2 text-sm outline-none border-none mt-2"
                >
                  {CONDICAO_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {errorsEdit.condicao && (
                  <p className="text-sm text-red-600">
                    {errorsEdit.condicao.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="edit-quantity"
                  className="text-sm font-semibold"
                >
                  Quantidade em Estoque:
                </Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  {...registerEdit("quantity")}
                  placeholder="0"
                  className="h-11 bg-gray-300 outline-none border-none mt-2"
                />
                {errorsEdit.quantity && (
                  <p className="text-sm text-red-600">
                    {errorsEdit.quantity.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-price" className="text-sm font-semibold">
                  Preço de Venda:
                </Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  {...registerEdit("price")}
                  placeholder="0.00"
                  className="h-11 bg-gray-300 outline-none border-none mt-2"
                />
                {errorsEdit.price && (
                  <p className="text-sm text-red-600">
                    {errorsEdit.price.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-custo" className="text-sm font-semibold">
                  Preço de Custo (opcional):
                </Label>
                <Input
                  id="edit-custo"
                  type="number"
                  step="0.01"
                  {...registerEdit("custo")}
                  placeholder="0.00"
                  className="h-11 bg-gray-300 outline-none border-none mt-2"
                />
                {errorsEdit.custo && (
                  <p className="text-sm text-red-600">
                    {errorsEdit.custo.message}
                  </p>
                )}
              </div>

              {/* Lote selector - Edit */}
              <div className="space-y-2">
                <Label htmlFor="edit-lote" className="text-sm font-semibold">
                  Lote (opcional):
                </Label>
                <select
                  id="edit-lote"
                  value={selectedLoteEdit}
                  onChange={(e) => setSelectedLoteEdit(e.target.value)}
                  className="flex h-11 w-full rounded-md bg-gray-300 px-3 py-2 text-sm outline-none border-none mt-2"
                >
                  <option value="">Avulso (sem lote)</option>
                  {lotes.map((lote) => (
                    <option key={lote.id_lote} value={lote.id_lote}>
                      {lote.nome} — R$ {lote.custoTotal?.toFixed(2)}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">
                  Vincule este produto a um lote de compra ou deixe como avulso.
                </p>
              </div>

              {/* Calculadora ML - Edit */}
              <div className="space-y-3 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                <div className="flex items-center gap-2 mb-1">
                  <Calculator className="h-4 w-4 text-yellow-700" />
                  <span className="text-sm font-bold text-yellow-800">
                    Calculadora Mercado Livre
                  </span>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-yellow-800">
                    Categoria ML
                  </Label>
                  <select
                    value={mlCategoriaEdit}
                    onChange={(e) => setMlCategoriaEdit(e.target.value)}
                    className="flex h-9 w-full rounded-md bg-white px-3 py-1 text-sm border border-yellow-300"
                  >
                    {ML_CATEGORIAS.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label} ({(cat.taxa * 100).toFixed(0)}%)
                      </option>
                    ))}
                  </select>
                </div>

                {Number(editPrice) >= ML_LIMITE_FRETE_GRATIS && (
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-yellow-800">
                      Custo de Frete (Mercado Envios)
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={custoFreteEdit}
                      onChange={(e) =>
                        setCustoFreteEdit(Number(e.target.value) || 0)
                      }
                      className="h-9 bg-white border-yellow-300 text-sm"
                    />
                  </div>
                )}

                {lucroEdit && Number(editPrice) > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-yellow-200">
                    <div className="flex justify-between text-xs text-yellow-800">
                      <span>Taxa ML ({(taxaCategoriaEdit * 100).toFixed(0)}%)</span>
                      <span className="font-mono">
                        - R$ {lucroEdit.taxaML.toFixed(2)}
                      </span>
                    </div>
                    {lucroEdit.custoFixo > 0 && (
                      <div className="flex justify-between text-xs text-yellow-800">
                        <span>Custo Fixo (item &lt; R$ 79)</span>
                        <span className="font-mono">
                          - R$ {lucroEdit.custoFixo.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {lucroEdit.custoFrete > 0 && (
                      <div className="flex justify-between text-xs text-yellow-800">
                        <span>Custo de Frete</span>
                        <span className="font-mono">
                          - R$ {lucroEdit.custoFrete.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {Number(editCusto) > 0 && (
                      <div className="flex justify-between text-xs text-yellow-800">
                        <span>Preço de Custo</span>
                        <span className="font-mono">
                          - R$ {Number(editCusto).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div
                      className={`flex justify-between text-sm font-bold pt-2 border-t border-yellow-300 ${
                        lucroEdit.lucroLiquido < 0
                          ? "text-red-700"
                          : "text-green-700"
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        {lucroEdit.lucroLiquido < 0 && (
                          <AlertTriangle className="h-4 w-4" />
                        )}
                        Lucro Líquido:
                      </span>
                      <span className="font-mono">
                        R$ {lucroEdit.lucroLiquido.toFixed(2)} (
                        {lucroEdit.margem.toFixed(1)}%)
                      </span>
                    </div>
                    {lucroEdit.lucroLiquido < 0 && (
                      <p className="text-xs text-red-600 font-semibold bg-red-50 px-2 py-1 rounded">
                        ⚠️ Atenção: Margem negativa! Você terá prejuízo nesta
                        venda.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* SKU info no edit */}
              {editingProduct?.sku && (
                <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                  <p className="text-xs text-indigo-700">
                    <Tag className="inline h-3.5 w-3.5 mr-1" />
                    SKU atual:{" "}
                    <strong className="font-mono">
                      {editingProduct.sku}
                    </strong>{" "}
                    — será atualizado ao salvar.
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 border-none hover:to-indigo-700"
              >
                <span className="text-white font-semibold">Cancelar</span>
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold shadow-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                    <span className="text-white">Salvando...</span>
                  </>
                ) : (
                  <span className="text-white">Salvar</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;
