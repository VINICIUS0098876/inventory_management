import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { getProducts } from "@/services/productService";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Loader2, BarChart3, PieChart as PieChartIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const COLORS = [
  "#3B82F6", // blue-500
  "#6366F1", // indigo-500
  "#8B5CF6", // violet-500
  "#A855F7", // purple-500
  "#EC4899", // pink-500
  "#EF4444", // red-500
  "#F97316", // orange-500
  "#EAB308", // yellow-500
  "#22C55E", // green-500
  "#14B8A6", // teal-500
];

const Graficos = ({
  user,
  onProfileClick,
  onLogout,
  onHomeClick,
  onGraficosClick,
}) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartType, setChartType] = useState("bar"); // 'bar' ou 'pie'

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const data = await getProducts();
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
      console.error("Erro ao carregar produtos:", err);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Dados para o gráfico de quantidade
  const quantidadeData = products.map((product) => ({
    name:
      product.name.length > 15
        ? product.name.substring(0, 15) + "..."
        : product.name,
    quantidade: product.quantidade,
    fullName: product.name,
  }));

  // Dados para o gráfico de valor em estoque
  const valorData = products.map((product) => ({
    name:
      product.name.length > 15
        ? product.name.substring(0, 15) + "..."
        : product.name,
    valor: Number(product.preco) * Number(product.quantidade),
    fullName: product.name,
  }));

  // KPIs
  const totalProdutos = products.length;
  const valorTotal = products.reduce(
    (acc, p) => acc + Number(p.preco) * Number(p.quantidade),
    0
  );
  const totalUnidades = products.reduce(
    (acc, p) => acc + Number(p.quantidade),
    0
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">
            {payload[0].payload.fullName || label}
          </p>
          <p className="text-blue-600">
            {payload[0].name === "quantidade"
              ? `Quantidade: ${payload[0].value} unidades`
              : `Valor: R$ ${payload[0].value.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-gray-50">
      <Sidebar
        user={user}
        onProfileClick={onProfileClick}
        onLogout={onLogout}
        onHomeClick={onHomeClick}
        onGraficosClick={onGraficosClick}
        currentPage="graficos"
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Gráficos
              </h1>
              <p className="text-gray-600 mt-1">
                Visualize seus dados de estoque
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setChartType("bar")}
                className={`${
                  chartType === "bar"
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <BarChart3 className="mr-2 h-5 w-5" />
                Barras
              </Button>
              <Button
                onClick={() => setChartType("pie")}
                className={`${
                  chartType === "pie"
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <PieChartIcon className="mr-2 h-5 w-5" />
                Pizza
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Nenhum dado para exibir
              </h3>
              <p className="text-gray-500">
                Cadastre produtos para visualizar os gráficos
              </p>
            </div>
          ) : (
            <>
              {/* KPIs Resumo */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <p className="text-sm font-medium text-gray-500">
                    Total de Produtos
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {totalProdutos}
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <p className="text-sm font-medium text-gray-500">
                    Total de Unidades
                  </p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">
                    {totalUnidades}
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <p className="text-sm font-medium text-gray-500">
                    Valor Total em Estoque
                  </p>
                  <p className="text-3xl font-bold text-green-600 mt-1">
                    R${" "}
                    {valorTotal.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>

              {/* Gráficos */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Gráfico de Quantidade */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Quantidade por Produto
                  </h3>
                  <div className={chartType === "bar" ? "h-80" : "h-64"}>
                    <ResponsiveContainer width="100%" height="100%">
                      {chartType === "bar" ? (
                        <BarChart data={quantidadeData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#E5E7EB"
                          />
                          <XAxis
                            dataKey="name"
                            tick={{ fontSize: 10 }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            interval={0}
                          />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar
                            dataKey="quantidade"
                            name="Quantidade"
                            fill="#3B82F6"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      ) : (
                        <PieChart>
                          <Pie
                            data={quantidadeData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="quantidade"
                          >
                            {quantidadeData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                  {/* Legenda externa para gráfico de pizza */}
                  {chartType === "pie" && (
                    <div className="mt-4 max-h-32 overflow-y-auto">
                      <div className="grid grid-cols-2 gap-2">
                        {quantidadeData.map((entry, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-sm"
                          >
                            <div
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{
                                backgroundColor: COLORS[index % COLORS.length],
                              }}
                            />
                            <span
                              className="truncate text-gray-700"
                              title={entry.fullName}
                            >
                              {entry.name}
                            </span>
                            <span className="text-gray-500 flex-shrink-0">
                              ({entry.quantidade})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Gráfico de Valor em Estoque */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Valor em Estoque por Produto
                  </h3>
                  <div className={chartType === "bar" ? "h-80" : "h-64"}>
                    <ResponsiveContainer width="100%" height="100%">
                      {chartType === "bar" ? (
                        <BarChart data={valorData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#E5E7EB"
                          />
                          <XAxis
                            dataKey="name"
                            tick={{ fontSize: 10 }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            interval={0}
                          />
                          <YAxis
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) =>
                              `R$ ${value.toLocaleString("pt-BR")}`
                            }
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar
                            dataKey="valor"
                            name="Valor (R$)"
                            fill="#22C55E"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      ) : (
                        <PieChart>
                          <Pie
                            data={valorData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="valor"
                          >
                            {valorData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                  {/* Legenda externa para gráfico de pizza */}
                  {chartType === "pie" && (
                    <div className="mt-4 max-h-32 overflow-y-auto">
                      <div className="grid grid-cols-2 gap-2">
                        {valorData.map((entry, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-sm"
                          >
                            <div
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{
                                backgroundColor: COLORS[index % COLORS.length],
                              }}
                            />
                            <span
                              className="truncate text-gray-700"
                              title={entry.fullName}
                            >
                              {entry.name}
                            </span>
                            <span className="text-gray-500 flex-shrink-0">
                              (R${" "}
                              {entry.valor.toLocaleString("pt-BR", {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              })}
                              )
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Graficos;
