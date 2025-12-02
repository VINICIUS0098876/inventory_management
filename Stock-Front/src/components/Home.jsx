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
} from "lucide-react";

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
});

const Home = ({
  user,
  onProfileClick,
  onLogout,
  onGraficosClick,
  onHomeClick,
}) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrar produtos pelo termo de busca
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    formState: { errors: errorsCreate },
    reset: resetCreate,
  } = useForm({
    resolver: zodResolver(productSchema),
  });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: errorsEdit },
    reset: resetEdit,
  } = useForm({
    resolver: zodResolver(productSchema),
  });

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
  }, []);

  const handleCreateProduct = async (data) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await createProduct({
        name: data.name,
        quantidade: Number(data.quantity),
        preco: Number(data.price),
      });
      setIsCreateModalOpen(false);
      resetCreate();
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
    });
    setIsEditModalOpen(true);
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
      0
    );
    const itensCriticos = products.filter((p) => p.quantidade < 5).length;

    doc.text(`Total de Produtos: ${totalProdutos}`, 14, 44);
    doc.text(
      `Valor Total em Estoque: R$ ${valorTotal.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      })}`,
      14,
      52
    );
    doc.setTextColor(
      itensCriticos > 0 ? 220 : 0,
      itensCriticos > 0 ? 38 : 0,
      itensCriticos > 0 ? 38 : 0
    );
    doc.text(`Itens Críticos (< 5 unidades): ${itensCriticos}`, 14, 60);

    // Tabela de produtos
    const tableData = products.map((product, index) => [
      index + 1,
      product.name,
      product.quantidade,
      `R$ ${Number(product.preco).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      })}`,
      `R$ ${(Number(product.preco) * Number(product.quantidade)).toLocaleString(
        "pt-BR",
        { minimumFractionDigits: 2 }
      )}`,
      product.quantidade < 5 ? "BAIXO" : "OK",
    ]);

    autoTable(doc, {
      startY: 70,
      head: [["#", "Produto", "Qtd", "Preço Unit.", "Valor Total", "Status"]],
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
        0: { halign: "center", cellWidth: 15 },
        2: { halign: "center" },
        3: { halign: "right" },
        4: { halign: "right" },
        5: { halign: "center" },
      },
      didParseCell: function (data) {
        if (data.column.index === 5 && data.cell.raw === "BAIXO") {
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
        { align: "center" }
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
        currentPage="home"
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Gerencie seus produtos</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar produto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <Button
                onClick={generatePDF}
                disabled={products.length === 0}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg"
              >
                <Download className="mr-2 h-5 w-5" />
                Baixar Relatório
              </Button>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg"
              >
                <Plus className="mr-2 h-5 w-5" />
                Novo Produto
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* KPIs */}
          {!isLoading && products.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Total de Produtos */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total de Produtos
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {products.length}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Valor Total em Estoque */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Valor Total em Estoque
                    </p>
                    <p className="text-3xl font-bold text-green-600 mt-1">
                      R${" "}
                      {products
                        .reduce(
                          (acc, p) =>
                            acc + Number(p.preco) * Number(p.quantidade),
                          0
                        )
                        .toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              {/* Itens Críticos */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Itens Críticos
                    </p>
                    <p className="text-3xl font-bold text-red-600 mt-1">
                      {products.filter((p) => p.quantidade < 5).length}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Produtos com menos de 5 unidades
                    </p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <TrendingDown className="h-6 w-6 text-red-600" />
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => {
                const isLowStock = product.quantidade < 5;
                return (
                  <div
                    key={product.id || product.id_product}
                    className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all ${
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
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          {product.name}
                        </h3>
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

                    <div className="flex gap-2 pt-4 border-t border-gray-200">
                      <Button
                        onClick={() => openEditModal(product)}
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold shadow-lg"
                      >
                        <Edit className="mr-2 h-4 w-4 text-white" />
                        <span className="text-white">Editar</span>
                      </Button>
                      <Button
                        onClick={() =>
                          handleDeleteProduct(product.id || product.id_product)
                        }
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold shadow-lg"
                      >
                        <Trash2 className="mr-2 h-4 w-4 text-white" />
                        <span className="text-white">Deletar</span>
                      </Button>
                    </div>
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
                  Preço do Produto:
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
                  Preço do Produto:
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
