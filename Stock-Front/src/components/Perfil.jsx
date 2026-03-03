import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Sidebar from "./Sidebar";
import { getUserById, updateUser } from "@/services/userService";
import { getProducts } from "@/services/productService";
import { getKits } from "@/services/kitService";
import { getLotes } from "@/services/loteService";
import { useTheme } from "@/contexts/ThemeContext";
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
import {
  User,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Edit,
  Sun,
  Moon,
  Mail,
  Package,
  Boxes,
  Archive,
  Shield,
  KeyRound,
  LogOut,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";

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
    },
  );

const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length >= 2)
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0][0].toUpperCase();
};

const Perfil = ({
  user,
  onBack,
  onLogout,
  onUserUpdate,
  onHomeClick,
  onGraficosClick,
  onBaixaClick,
  onLotesClick,
  onKitsClick,
}) => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState({ products: 0, kits: 0, lotes: 0 });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { isDark, toggleTheme } = useTheme();

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

  // Auto-dismiss success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Load account statistics
  useEffect(() => {
    const loadStats = async () => {
      try {
        const [products, kits, lotes] = await Promise.all([
          getProducts(),
          getKits(),
          getLotes(),
        ]);
        setStats({
          products: Array.isArray(products) ? products.length : 0,
          kits: Array.isArray(kits) ? kits.length : 0,
          lotes: Array.isArray(lotes) ? lotes.length : 0,
        });
      } catch (_) {
        // Stats are non-critical
      }
    };
    if (!isLoading) loadStats();
  }, [isLoading]);

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

  const handleChangePassword = async (data) => {
    if (!data.passwordHash || data.passwordHash.length < 6) {
      setError("Senha deve ter no mínimo 6 caracteres");
      return;
    }
    if (data.passwordHash !== data.confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const userId =
        userData?.id_user || userData?.id || user?.id_user || user?.id;
      await updateUser(userId, { passwordHash: data.passwordHash });
      setIsPasswordModalOpen(false);
      reset();
      setSuccessMessage("Senha alterada com sucesso!");
    } catch (err) {
      setError(err.message || "Erro ao alterar senha");
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
        onBaixaClick={onBaixaClick}
        onLotesClick={onLotesClick}
        onKitsClick={onKitsClick}
        currentPage="perfil"
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-4 md:px-8 md:py-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 md:gap-4 pl-10 md:pl-0">
              <Button
                onClick={onBack}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold shadow-lg"
              >
                <ArrowLeft className="mr-1.5 h-4 w-4 text-white" />
                <span className="text-white">Voltar</span>
              </Button>
              <div>
                <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Meu Perfil
                </h1>
                <p className="text-gray-600 mt-1 text-xs md:text-base">
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
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="mb-6 bg-green-50 border-green-200 animate-in fade-in duration-300">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
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
            <>
              <div className="flex justify-center">
                <Card className="shadow-xl border border-gray-200 bg-white w-full max-w-2xl">
                  <CardHeader className="pb-6">
                    <div className="flex items-center gap-4 sm:gap-5">
                      <div className="w-14 h-14 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                        <span className="text-xl sm:text-2xl font-bold text-white select-none">
                          {getInitials(userData?.name || user?.name)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-xl sm:text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent select-none truncate">
                          {userData?.name || user?.name || "Usuário"}
                        </CardTitle>
                        <p className="text-gray-500 font-bold mt-1 select-none text-sm sm:text-base truncate">
                          {userData?.email || user?.email || ""}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Clean read-only fields with icons */}
                    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="p-2 sm:p-2.5 bg-blue-100 rounded-lg shrink-0">
                        <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Nome Completo
                        </p>
                        <p className="text-gray-900 font-medium mt-0.5 text-sm sm:text-base truncate">
                          {userData?.name || user?.name || "Não informado"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="p-2 sm:p-2.5 bg-blue-100 rounded-lg shrink-0">
                        <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Email
                        </p>
                        <p className="text-gray-900 font-medium mt-0.5 text-sm sm:text-base truncate">
                          {userData?.email || user?.email || "Não informado"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Stats Cards */}
              <div className="flex justify-center mt-6">
                <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card className="shadow-lg border border-gray-200 bg-white">
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className="p-3 bg-blue-100 rounded-xl">
                        <Package className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {stats.products}
                        </p>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Produtos
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-lg border border-gray-200 bg-white">
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className="p-3 bg-purple-100 rounded-xl">
                        <Boxes className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {stats.kits}
                        </p>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Kits
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-lg border border-gray-200 bg-white">
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className="p-3 bg-green-100 rounded-xl">
                        <Archive className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {stats.lotes}
                        </p>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Lotes
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Security Section */}
              <div className="flex justify-center mt-6">
                <Card className="shadow-xl border border-gray-200 bg-white w-full max-w-2xl">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-100 rounded-lg">
                        <Shield className="h-5 w-5 text-blue-600" />
                      </div>
                      <CardTitle className="text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Segurança
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2 sm:p-2.5 bg-amber-100 rounded-lg shrink-0">
                          <KeyRound className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm sm:text-base">
                            Alterar Senha
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            Mantenha sua conta segura
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => {
                          reset({
                            name: "",
                            email: "",
                            passwordHash: "",
                            confirmPassword: "",
                          });
                          setShowPassword(false);
                          setShowConfirmPassword(false);
                          setIsPasswordModalOpen(true);
                        }}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold shadow-lg self-start sm:self-auto shrink-0"
                      >
                        <KeyRound className="mr-2 h-4 w-4 text-white" />
                        <span className="text-white">Alterar</span>
                      </Button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2 sm:p-2.5 bg-red-100 rounded-lg shrink-0">
                          <LogOut className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm sm:text-base">
                            Encerrar Sessão
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            Saia da sua conta neste dispositivo
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={onLogout}
                        variant="destructive"
                        className="font-semibold shadow-lg self-start sm:self-auto shrink-0"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sair
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tema Toggle */}
              <div className="flex justify-center mt-6 mb-6">
                <Card className="shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 w-full max-w-2xl">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-yellow-100 dark:bg-indigo-900/40 rounded-lg">
                        {isDark ? (
                          <Moon className="h-5 w-5 text-indigo-400" />
                        ) : (
                          <Sun className="h-5 w-5 text-yellow-600" />
                        )}
                      </div>
                      <CardTitle className="text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Aparência
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        {isDark ? (
                          <div className="p-2 sm:p-2.5 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg shrink-0">
                            <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                        ) : (
                          <div className="p-2 sm:p-2.5 bg-yellow-100 rounded-lg shrink-0">
                            <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                            Tema {isDark ? "Escuro" : "Claro"}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            Alterne entre claro e escuro
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={toggleTheme}
                        className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none shadow-inner shrink-0 ${
                          isDark ? "bg-indigo-600" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 flex items-center justify-center ${
                            isDark ? "translate-x-7" : "translate-x-0"
                          }`}
                        >
                          {isDark ? (
                            <Moon className="h-3.5 w-3.5 text-indigo-600" />
                          ) : (
                            <Sun className="h-3.5 w-3.5 text-yellow-500" />
                          )}
                        </span>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
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
                <Label
                  htmlFor="edit-name"
                  className="text-sm font-semibold dark:text-gray-200"
                >
                  Nome Completo
                </Label>
                <Input
                  id="edit-name"
                  {...register("name")}
                  placeholder="Seu nome completo"
                  className="h-11 bg-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:placeholder-gray-400 outline-none border-none mt-2"
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="edit-email"
                  className="text-sm font-semibold dark:text-gray-200"
                >
                  Email
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  {...register("email")}
                  placeholder="seu@email.com"
                  className="h-11 bg-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:placeholder-gray-400 outline-none border-none mt-2"
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="edit-password"
                  className="text-sm font-semibold dark:text-gray-200"
                >
                  Nova Senha
                </Label>
                <Input
                  id="edit-password"
                  type="password"
                  {...register("passwordHash")}
                  placeholder="Digite sua nova senha"
                  className="h-11 bg-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:placeholder-gray-400 outline-none border-none mt-2"
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
                  className="text-sm font-semibold dark:text-gray-200"
                >
                  Confirmar Nova Senha
                </Label>
                <Input
                  id="edit-confirm-password"
                  type="password"
                  {...register("confirmPassword")}
                  placeholder="Confirme sua nova senha"
                  className="h-11 bg-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:placeholder-gray-400 outline-none border-none mt-2"
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

      {/* Change Password Modal */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent>
          <DialogClose onClose={() => setIsPasswordModalOpen(false)} />
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
            <DialogDescription>
              Digite sua nova senha para manter sua conta segura
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleChangePassword)}>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label
                  htmlFor="pw-new"
                  className="text-sm font-semibold dark:text-gray-200"
                >
                  Nova Senha
                </Label>
                <div className="relative">
                  <Input
                    id="pw-new"
                    type={showPassword ? "text" : "password"}
                    {...register("passwordHash")}
                    placeholder="Digite sua nova senha"
                    className="h-11 bg-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:placeholder-gray-400 outline-none border-none mt-2 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 mt-1 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.passwordHash && (
                  <p className="text-sm text-red-600">
                    {errors.passwordHash.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="pw-confirm"
                  className="text-sm font-semibold dark:text-gray-200"
                >
                  Confirmar Nova Senha
                </Label>
                <div className="relative">
                  <Input
                    id="pw-confirm"
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("confirmPassword")}
                    placeholder="Confirme sua nova senha"
                    className="h-11 bg-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:placeholder-gray-400 outline-none border-none mt-2 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 mt-1 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
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
                onClick={() => setIsPasswordModalOpen(false)}
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
                  <span className="text-white">Alterar Senha</span>
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
