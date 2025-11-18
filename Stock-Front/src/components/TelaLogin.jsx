import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { login } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Loader2,
  AlertCircle,
  LogIn,
  Lock,
  TrendingUp,
  Users,
} from "lucide-react";

const loginSchema = z.object({
  email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .min(6, "Senha deve ter no mínimo 6 caracteres"),
});

const TelaLogin = ({ onLoginSuccess, onNavigateToRegister }) => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await login(data.email, data.password);

      // Salva o token no localStorage
      if (response.Login?.token) {
        localStorage.setItem("token", response.Login.token);
      }

      // Chama callback de sucesso se fornecido
      if (onLoginSuccess) {
        onLoginSuccess(response);
      }
    } catch (err) {
      setError(err.message || "Erro ao realizar login. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex overflow-hidden">
      {/* Lado Esquerdo - Conteúdo Descritivo */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-700 to-blue-800 p-12 flex-col justify-center text-white relative overflow-hidden">
        <div className="relative z-10 max-w-lg">
          <div className="mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-2xl mb-8 backdrop-blur-sm border border-white/20">
              <LogIn className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold mb-6 leading-tight text-white">
              Bem-vindo de volta!
            </h1>
            <p className="text-xl text-white/90 leading-relaxed">
              Acesse sua conta e continue gerenciando seus processos de forma
              eficiente e segura.
            </p>
          </div>

          <div className="space-y-8 mt-16">
            <div className="flex items-start gap-5">
              <div className="shrink-0 w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                <Lock className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2 text-white">
                  Acesso Seguro
                </h3>
                <p className="text-white/80 text-base leading-relaxed">
                  Autenticação protegida e confiável
                </p>
              </div>
            </div>

            <div className="flex items-start gap-5">
              <div className="shrink-0 w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2 text-white">
                  Performance Otimizada
                </h3>
                <p className="text-white/80 text-base leading-relaxed">
                  Sistema rápido e responsivo para melhor experiência
                </p>
              </div>
            </div>

            <div className="flex items-start gap-5">
              <div className="shrink-0 w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                <Users className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2 text-white">
                  Suporte Dedicado
                </h3>
                <p className="text-white/80 text-base leading-relaxed">
                  Equipe pronta para ajudar quando precisar
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-white">
        <div className="w-full max-w-md">
          <Card className="w-full shadow-2xl border border-gray-100 bg-white rounded-2xl">
            <CardHeader className="space-y-3 text-center pb-8 pt-8">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                  <LogIn className="h-7 w-7 text-white" />
                </div>
              </div>
              <CardTitle className="text-4xl font-bold text-gray-900">
                Entrar
              </CardTitle>
              <CardDescription className="text-base text-gray-500 mt-2">
                Entre com suas credenciais para acessar o sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {error && (
                  <Alert
                    variant="destructive"
                    className="border-red-200 bg-red-50"
                  >
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertTitle className="text-red-800">Erro</AlertTitle>
                    <AlertDescription className="text-red-700">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-semibold text-gray-800"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    {...register("email")}
                    disabled={isLoading}
                    className={`h-12 text-base border-2 rounded-lg ${
                      errors.email
                        ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 font-medium mt-1.5">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-semibold text-gray-800"
                  >
                    Senha
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...register("password")}
                    disabled={isLoading}
                    className={`h-12 text-base border-2 rounded-lg ${
                      errors.password
                        ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    }`}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-600 font-medium mt-1.5">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 hover:from-blue-600 hover:via-indigo-700 hover:to-purple-700 text-white font-semibold text-base shadow-lg shadow-blue-500/30 transition-all duration-200 mt-2 rounded-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    "Entrar"
                  )}
                </Button>

                <div className="text-center pt-6">
                  <p className="text-sm text-gray-600">
                    Não tem uma conta?{" "}
                    <button
                      type="button"
                      onClick={onNavigateToRegister}
                      className="font-semibold text-blue-600 hover:text-blue-700 transition-colors underline-offset-4 hover:underline"
                      disabled={isLoading}
                    >
                      Criar conta
                    </button>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TelaLogin;
