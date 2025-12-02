import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Sidebar from "./Sidebar";
import { getUserById, updateUser } from "@/services/userService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { User, ArrowLeft, Loader2, AlertCircle, Edit } from "lucide-react";

const profileSchema = z
  .object({
    name: z
      .string()
      .min(1, "Nome é obrigatório")
      .min(3, "Nome deve ter no mínimo 3 caracteres"),
    email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
    passwordHash: z
      .string()
      .optional()
      .refine((val) => !val || val.length >= 6, {
        message: "Senha deve ter no mínimo 6 caracteres",
      }),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      // Só valida confirmação se a senha foi preenchida
      if (data.passwordHash && data.passwordHash.length > 0) {
        return data.passwordHash === data.confirmPassword;
      }
      return true;
    },
    {
      message: "As senhas não coincidem",
      path: ["confirmPassword"],
    }
  );

const Perfil = ({
  user,
  onBack,
  onLogout,
  onUserUpdate,
  onHomeClick,
  onGraficosClick,
}) => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(profileSchema),
  });

  const loadUserData = async () => {
    if (user?.id_user || user?.id) {
      setIsLoading(true);
      setError(null);
      try {
        const userId = user.id_user || user.id;
        const data = await getUserById(userId);
        setUserData(data.user || data);
      } catch (err) {
        setError(err.message || "Erro ao carregar dados do usuário");
      } finally {
        setIsLoading(false);
      }
    } else {
      setUserData(user);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [user]);

  const openEditModal = () => {
    reset({
      name: userData?.name || user?.name || "",
      email: userData?.email || user?.email || "",
      passwordHash: "",
      confirmPassword: "",
    });
    setIsEditModalOpen(true);
  };

  const handleEditProfile = async (data) => {
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const userId =
        userData?.id_user || userData?.id || user?.id_user || user?.id;
      await updateUser(userId, {
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
      });
      setIsEditModalOpen(false);
      reset();
      setSuccessMessage("Perfil atualizado com sucesso!");
      await loadUserData();
      if (onUserUpdate) {
        onUserUpdate({ ...userData, name: data.name, email: data.email });
      }
    } catch (err) {
      setError(err.message || "Erro ao atualizar perfil");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-gray-50">
      <Sidebar
        user={userData || user}
        onProfileClick={() => {}}
        onLogout={onLogout}
        onHomeClick={onHomeClick}
        onGraficosClick={onGraficosClick}
        currentPage="perfil"
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={onBack}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold shadow-lg"
              >
                <ArrowLeft className="mr-2 h-4 w-4 text-white" />
                <span className="text-white">Voltar</span>
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Meu Perfil
                </h1>
                <p className="text-gray-600 mt-1">
                  Visualize e gerencie suas informações
                </p>
              </div>
            </div>
            <Button
              onClick={openEditModal}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold shadow-lg"
            >
              <Edit className="mr-2 h-4 w-4 text-white" />
              <span className="text-white">Editar Perfil</span>
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

          {successMessage && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Sucesso</AlertTitle>
              <AlertDescription className="text-green-700">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="flex justify-center">
              <Card className="shadow-xl border border-gray-200 bg-white w-full max-w-2xl">
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <User className="h-10 w-10 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent select-none">
                        {userData?.name || user?.name || "Usuário"}
                      </CardTitle>
                      <p className="text-gray-500 font-bold mt-1 select-none">
                        {userData?.email || user?.email || ""}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <Label className="text-sm font-semibold text-blue-600">
                        Nome Completo
                      </Label>
                      <div className="mt-2 p-3 h-11 bg-gray-300 rounded-lg flex items-center">
                        <p className="text-gray-900 select-none">
                          {userData?.name || user?.name || "Não informado"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-blue-600">
                        Email
                      </Label>
                      <div className="mt-2 p-3 h-11 bg-gray-300 rounded-lg flex items-center">
                        <p className="text-gray-900 select-none">
                          {userData?.email || user?.email || "Não informado"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogClose onClose={() => setIsEditModalOpen(false)} />
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
            <DialogDescription>
              Atualize suas informações pessoais
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleEditProfile)}>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-sm font-semibold">
                  Nome Completo
                </Label>
                <Input
                  id="edit-name"
                  {...register("name")}
                  placeholder="Seu nome completo"
                  className="h-11 bg-gray-300 outline-none border-none mt-2"
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-email" className="text-sm font-semibold">
                  Email
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  {...register("email")}
                  placeholder="seu@email.com"
                  className="h-11 bg-gray-300 outline-none border-none mt-2"
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="edit-password"
                  className="text-sm font-semibold"
                >
                  Nova Senha
                </Label>
                <Input
                  id="edit-password"
                  type="password"
                  {...register("passwordHash")}
                  placeholder="Digite sua nova senha"
                  className="h-11 bg-gray-300 outline-none border-none mt-2"
                />
                {errors.passwordHash && (
                  <p className="text-sm text-red-600">
                    {errors.passwordHash.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="edit-confirm-password"
                  className="text-sm font-semibold"
                >
                  Confirmar Nova Senha
                </Label>
                <Input
                  id="edit-confirm-password"
                  type="password"
                  {...register("confirmPassword")}
                  placeholder="Confirme sua nova senha"
                  className="h-11 bg-gray-300 outline-none border-none mt-2"
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">
                    {errors.confirmPassword.message}
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

export default Perfil;
