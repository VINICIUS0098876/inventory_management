import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { getUserById } from "@/services/userService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { User, ArrowLeft, Loader2, AlertCircle } from "lucide-react";

const Perfil = ({ user, onBack, onLogout }) => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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

    loadUserData();
  }, [user]);

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-gray-50">
      <Sidebar user={userData || user} onProfileClick={() => {}} onLogout={onLogout} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-6 shadow-sm">
          <div className="flex items-center gap-4">
            <Button
              onClick={onBack}
              variant="outline"
              className="border-gray-300"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Meu Perfil
              </h1>
              <p className="text-gray-600 mt-1">Visualize e gerencie suas informações</p>
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

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="max-w-2xl">
              <Card className="shadow-xl border border-gray-200">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        ID do Usuário
                      </label>
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-900 select-none">
                          {userData?.id_user || userData?.id || user?.id_user || user?.id}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Nome Completo
                      </label>
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-900 select-none">
                          {userData?.name || user?.name || "Não informado"}
                        </p>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Email
                      </label>
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
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
    </div>
  );
};

export default Perfil;

