import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
} from "lucide-react";

const productSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").min(3, "Nome deve ter no mínimo 3 caracteres"),
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

const Home = ({ user, onProfileClick, onLogout }) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        quantity: Number(data.quantity),
        price: Number(data.price),
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
        quantity: Number(data.quantity),
        price: Number(data.price),
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
      quantity: String(product.quantity),
      price: String(product.price),
    });
    setIsEditModalOpen(true);
  };

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-gray-50">
      <Sidebar user={user} onProfileClick={onProfileClick} onLogout={onLogout} />

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
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Novo Produto
            </Button>
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product.id || product.id_product}
                  className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow"
                >
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
                      <span className="text-sm text-gray-600">Quantidade:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {product.quantity}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Preço:</span>
                      <span className="text-sm font-semibold text-blue-600">
                        R$ {Number(product.price).toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <Button
                      onClick={() => openEditModal(product)}
                      variant="outline"
                      size="sm"
                      className="flex-1 text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                    >
                      <Edit className="mr-2 h-4 w-4 text-gray-700" />
                      <span className="text-gray-700">Editar</span>
                    </Button>
                    <Button
                      onClick={() =>
                        handleDeleteProduct(product.id || product.id_product)
                      }
                      variant="outline"
                      size="sm"
                      className="flex-1 text-red-600 border-red-300 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                      <span className="text-red-600">Deletar</span>
                    </Button>
                  </div>
                </div>
              ))}
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
                  className="h-11"
                />
                {errorsCreate.name && (
                  <p className="text-sm text-red-600">
                    {errorsCreate.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-quantity" className="text-sm font-semibold">
                  Quantidade
                </Label>
                <Input
                  id="create-quantity"
                  type="number"
                  {...registerCreate("quantity")}
                  placeholder="0"
                  className="h-11"
                />
                {errorsCreate.quantity && (
                  <p className="text-sm text-red-600">
                    {errorsCreate.quantity.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-price" className="text-sm font-semibold">
                  Preço
                </Label>
                <Input
                  id="create-price"
                  type="number"
                  step="0.01"
                  {...registerCreate("price")}
                  placeholder="0.00"
                  className="h-11"
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
                className="text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900"
              >
                <span className="text-gray-700">Cancelar</span>
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
            <DialogDescription>
              Atualize os dados do produto
            </DialogDescription>
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
                  className="h-11"
                />
                {errorsEdit.name && (
                  <p className="text-sm text-red-600">
                    {errorsEdit.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-quantity" className="text-sm font-semibold">
                  Quantidade
                </Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  {...registerEdit("quantity")}
                  placeholder="0"
                  className="h-11"
                />
                {errorsEdit.quantity && (
                  <p className="text-sm text-red-600">
                    {errorsEdit.quantity.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-price" className="text-sm font-semibold">
                  Preço
                </Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  {...registerEdit("price")}
                  placeholder="0.00"
                  className="h-11"
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
                className="text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900"
              >
                <span className="text-gray-700">Cancelar</span>
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

