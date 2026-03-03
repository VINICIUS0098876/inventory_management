import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Sidebar from "./Sidebar";
import {
  getLotes,
  createLote,
  updateLote,
  deleteLote,
} from "@/services/loteService";
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
  Layers,
  AlertCircle,
  Loader2,
  Search,
  Package,
  ChevronDown,
  ChevronUp,
  DollarSign,
} from "lucide-react";

const loteSchema = z.object({
  nome: z.string().min(1, "Nome do lote é obrigatório"),
  custoTotal: z
    .string()
    .min(1, "Custo total é obrigatório")
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, "Custo inválido"),
  descricao: z.string().optional(),
});

const Lotes = ({
  user,
  onProfileClick,
  onLogout,
  onHomeClick,
  onGraficosClick,
  onBaixaClick,
  onLotesClick,
  onKitsClick,
}) => {
  const [lotes, setLotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLote, setEditingLote] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedLote, setExpandedLote] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const createForm = useForm({
    resolver: zodResolver(loteSchema),
    defaultValues: { nome: "", custoTotal: "", descricao: "" },
  });

  const editForm = useForm({
    resolver: zodResolver(loteSchema),
    defaultValues: { nome: "", custoTotal: "", descricao: "" },
  });

  const loadLotes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getLotes();
      setLotes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Erro ao carregar lotes. Tente novamente.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLotes();
  }, [loadLotes]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleCreate = async (formData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await createLote({
        nome: formData.nome,
        custoTotal: Number(formData.custoTotal),
        descricao: formData.descricao || undefined,
      });
      setSuccess("Lote criado com sucesso!");
      setIsCreateModalOpen(false);
      createForm.reset();
      await loadLotes();
    } catch (err) {
      setError("Erro ao criar lote. Tente novamente.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (formData) => {
    if (!editingLote) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await updateLote(editingLote.id_lote, {
        nome: formData.nome,
        custoTotal: Number(formData.custoTotal),
        descricao: formData.descricao || undefined,
      });
      setSuccess("Lote atualizado com sucesso!");
      setIsEditModalOpen(false);
      setEditingLote(null);
      editForm.reset();
      await loadLotes();
    } catch (err) {
      setError("Erro ao atualizar lote. Tente novamente.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (loteId) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await deleteLote(loteId);
      setSuccess("Lote excluído com sucesso! Produtos foram desvinculados.");
      setDeleteConfirm(null);
      await loadLotes();
    } catch (err) {
      setError("Erro ao excluir lote. Tente novamente.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (lote) => {
    setEditingLote(lote);
    editForm.reset({
      nome: lote.nome,
      custoTotal: String(lote.custoTotal),
      descricao: lote.descricao || "",
    });
    setIsEditModalOpen(true);
  };

  const filteredLotes = lotes.filter(
    (l) =>
      l.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.descricao?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalInvestido = lotes.reduce((acc, l) => acc + (l.custoTotal || 0), 0);
  const totalProdutos = lotes.reduce(
    (acc, l) => acc + (l.products?.length || 0),
    0,
  );

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
        currentPage="lotes"
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-4 md:px-8 md:py-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="pl-10 md:pl-0">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Gerenciamento de Lotes
              </h1>
              <p className="text-gray-500 mt-1 text-sm md:text-base">
                Gerencie seus lotes/pallets de compra
              </p>
            </div>
            <Button
              onClick={() => {
                createForm.reset();
                setIsCreateModalOpen(true);
              }}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold shadow-lg h-11 md:h-12 px-4 md:px-6 self-start sm:self-auto"
            >
              <Plus className="mr-2 h-5 w-5" />
              <span className="hidden sm:inline">Novo Lote</span>
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
                <div className="p-2.5 bg-blue-100 rounded-lg">
                  <Layers className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total de Lotes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {lotes.length}
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
                  <p className="text-sm text-gray-500">Total Investido</p>
                  <p className="text-2xl font-bold text-gray-900">
                    R$ {totalInvestido.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-100 rounded-lg">
                  <Package className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Produtos em Lotes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalProdutos}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Buscar lotes por nome ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 bg-white border-gray-200"
            />
          </div>

          {/* Lotes List */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-3 text-gray-500">Carregando lotes...</span>
            </div>
          ) : filteredLotes.length === 0 ? (
            <div className="text-center py-20">
              <Layers className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-500">
                {searchTerm
                  ? "Nenhum lote encontrado"
                  : "Nenhum lote cadastrado"}
              </h3>
              <p className="text-gray-400 mt-1">
                {searchTerm
                  ? "Tente buscar por outro termo"
                  : 'Clique em "Novo Lote" para começar'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLotes.map((lote) => (
                <div
                  key={lote.id_lote}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                >
                  {/* Lote Header */}
                  <div className="p-4 md:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
                      <div
                        className="flex items-center gap-3 md:gap-4 flex-1 cursor-pointer min-w-0"
                        onClick={() =>
                          setExpandedLote(
                            expandedLote === lote.id_lote ? null : lote.id_lote,
                          )
                        }
                      >
                        <div className="p-2 md:p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow shrink-0">
                          <Layers className="h-4 w-4 md:h-5 md:w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-base md:text-lg truncate">
                            {lote.nome}
                          </h3>
                          {lote.descricao && (
                            <p className="text-sm text-gray-500 truncate">
                              {lote.descricao}
                            </p>
                          )}
                          <div className="flex items-center gap-2 sm:gap-4 mt-1 text-xs sm:text-sm text-gray-500 flex-wrap">
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3.5 w-3.5" />
                              R$ {lote.custoTotal?.toFixed(2)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Package className="h-3.5 w-3.5" />
                              {lote.products?.length || 0} produto(s)
                            </span>
                            <span className="hidden sm:inline">
                              {new Date(lote.createdAt).toLocaleDateString(
                                "pt-BR",
                              )}
                            </span>
                          </div>
                        </div>
                        {expandedLote === lote.id_lote ? (
                          <ChevronUp className="h-5 w-5 text-gray-400 shrink-0" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400 shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        <Button
                          size="sm"
                          onClick={() => openEditModal(lote)}
                          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow-sm"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setDeleteConfirm(lote)}
                          className="bg-red-500 hover:bg-red-600 text-white font-semibold shadow-sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Products */}
                  {expandedLote === lote.id_lote && (
                    <div className="border-t border-gray-100 bg-gray-50 p-3 sm:p-5">
                      {lote.products && lote.products.length > 0 ? (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gray-700 text-sm mb-3">
                            Produtos neste lote:
                          </h4>
                          <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
                            <table className="w-full text-xs sm:text-sm min-w-[480px]">
                              <thead>
                                <tr className="text-left text-gray-500 border-b border-gray-200">
                                  <th className="pb-2 font-medium">Nome</th>
                                  <th className="pb-2 font-medium">SKU</th>
                                  <th className="pb-2 font-medium">Qtd</th>
                                  <th className="pb-2 font-medium">Preço</th>
                                  <th className="pb-2 font-medium">Condição</th>
                                </tr>
                              </thead>
                              <tbody>
                                {lote.products.map((p) => (
                                  <tr
                                    key={p.id_product}
                                    className="border-b border-gray-100 last:border-0"
                                  >
                                    <td className="py-2 font-medium text-gray-900">
                                      {p.name}
                                    </td>
                                    <td className="py-2 text-gray-500">
                                      {p.sku || "—"}
                                    </td>
                                    <td className="py-2 text-gray-700">
                                      {p.quantidade}
                                    </td>
                                    <td className="py-2 text-gray-700">
                                      R$ {p.preco?.toFixed(2)}
                                    </td>
                                    <td className="py-2">
                                      <span
                                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                          p.condicao === "NOVO"
                                            ? "bg-green-100 text-green-700"
                                            : p.condicao === "REEMBALADO"
                                              ? "bg-blue-100 text-blue-700"
                                              : p.condicao === "DEFEITO"
                                                ? "bg-red-100 text-red-700"
                                                : "bg-yellow-100 text-yellow-700"
                                        }`}
                                      >
                                        {p.condicao === "NOVO"
                                          ? "Novo"
                                          : p.condicao === "REEMBALADO"
                                            ? "Reembalado"
                                            : p.condicao === "DEFEITO"
                                              ? "Defeito"
                                              : "Usado"}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm text-center py-4">
                          Nenhum produto vinculado a este lote. Vincule produtos
                          ao editar/criar no Dashboard.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-blue-600" />
              Novo Lote
            </DialogTitle>
            <DialogDescription>
              Cadastre um novo lote/pallet de compra.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={createForm.handleSubmit(handleCreate)}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="create-nome">Nome do Lote *</Label>
                <Input
                  id="create-nome"
                  placeholder="Ex: Pallet Eletrônicos Março"
                  className="bg-gray-300 text-black outline-none border-none"
                  {...createForm.register("nome")}
                />
                {createForm.formState.errors.nome && (
                  <p className="text-sm text-red-500">
                    {createForm.formState.errors.nome.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-custoTotal">Custo Total (R$) *</Label>
                <Input
                  id="create-custoTotal"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="bg-gray-300 text-black outline-none border-none"
                  {...createForm.register("custoTotal")}
                />
                {createForm.formState.errors.custoTotal && (
                  <p className="text-sm text-red-500">
                    {createForm.formState.errors.custoTotal.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-descricao">Descrição (opcional)</Label>
                <Input
                  id="create-descricao"
                  placeholder="Ex: Comprado no fornecedor X"
                  className="bg-gray-300 text-black outline-none border-none"
                  {...createForm.register("descricao")}
                />
              </div>
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
                  "Criar Lote"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-600" />
              Editar Lote
            </DialogTitle>
            <DialogDescription>
              Atualize as informações do lote.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(handleEdit)}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nome">Nome do Lote *</Label>
                <Input
                  id="edit-nome"
                  placeholder="Ex: Pallet Eletrônicos Março"
                  className="bg-gray-300 text-black outline-none border-none"
                  {...editForm.register("nome")}
                />
                {editForm.formState.errors.nome && (
                  <p className="text-sm text-red-500">
                    {editForm.formState.errors.nome.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-custoTotal">Custo Total (R$) *</Label>
                <Input
                  id="edit-custoTotal"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="bg-gray-300 text-black outline-none border-none"
                  {...editForm.register("custoTotal")}
                />
                {editForm.formState.errors.custoTotal && (
                  <p className="text-sm text-red-500">
                    {editForm.formState.errors.custoTotal.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-descricao">Descrição (opcional)</Label>
                <Input
                  id="edit-descricao"
                  placeholder="Ex: Comprado no fornecedor X"
                  className="bg-gray-300 text-black outline-none border-none"
                  {...editForm.register("descricao")}
                />
              </div>
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Excluir Lote
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o lote{" "}
              <strong>"{deleteConfirm?.nome}"</strong>? Os produtos vinculados
              serão desvinculados, mas não excluídos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button
              onClick={() => handleDelete(deleteConfirm?.id_lote)}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Lotes;
