import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";

/**
 * Componente de etiqueta para impressão.
 * Recebe um produto (ou array) e renderiza etiquetas formatadas
 * para tamanho padrão (~10cm x 6cm / 100mm x 60mm).
 */
const Etiqueta = ({ product, products, onBack }) => {
  const printRef = useRef(null);

  // Suporta produto único ou lista
  const items = products || (product ? [product] : []);

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Etiquetas</title>
          <style>
            @page {
              size: 100mm 60mm;
              margin: 0;
            }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, Helvetica, sans-serif; }
            .etiqueta {
              width: 100mm;
              height: 60mm;
              padding: 4mm;
              page-break-after: always;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              border: 1px dashed #ccc;
            }
            .etiqueta:last-child { page-break-after: auto; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; }
            .sku {
              font-family: 'Courier New', monospace;
              font-size: 11pt;
              font-weight: bold;
              background: #000;
              color: #fff;
              padding: 1mm 3mm;
              border-radius: 2mm;
              letter-spacing: 0.5px;
            }
            .condicao {
              font-size: 8pt;
              font-weight: bold;
              padding: 1mm 2.5mm;
              border-radius: 2mm;
              border: 1px solid #333;
              text-transform: uppercase;
            }
            .nome {
              font-size: 13pt;
              font-weight: bold;
              margin: 2mm 0;
              line-height: 1.2;
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-top: 1mm;
            }
            .preco {
              font-size: 18pt;
              font-weight: bold;
            }
            .qty {
              font-size: 10pt;
              color: #555;
            }
            .lote {
              font-size: 7pt;
              color: #888;
              margin-top: 1mm;
            }
            .divider {
              border-top: 1px solid #ddd;
              margin: 1.5mm 0;
            }
            .footer {
              display: flex;
              justify-content: space-between;
              font-size: 7pt;
              color: #999;
            }
          </style>
        </head>
        <body>${content.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  const getCondicaoLabel = (cond) => {
    const map = {
      NOVO: "Novo",
      REEMBALADO: "Reembalado",
      USADO: "Usado",
      DEFEITO: "Defeito",
    };
    return map[cond] || cond || "—";
  };

  const formatDate = () => {
    return new Date().toLocaleDateString("pt-BR");
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <p className="text-gray-500 text-lg mb-4">
          Nenhum produto selecionado para etiqueta.
        </p>
        <Button onClick={onBack} className="bg-blue-600 text-white">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Toolbar - não aparece na impressão */}
      <div className="bg-white border-b shadow-sm px-3 py-3 md:px-6 md:py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          <Button
            onClick={onBack}
            className="bg-gray-700 hover:bg-gray-800 text-white font-semibold shadow"
          >
            <ArrowLeft className="mr-1 md:mr-2 h-4 w-4 text-white" />{" "}
            <span className="text-white">Voltar</span>
          </Button>
          <h1 className="text-lg md:text-xl font-bold text-gray-800">
            Etiquetas
          </h1>
          <span className="text-xs md:text-sm text-gray-500">
            ({items.length} etiqueta{items.length > 1 ? "s" : ""})
          </span>
        </div>
        <Button
          onClick={handlePrint}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold shadow-lg px-4 md:px-6 self-start sm:self-auto"
        >
          <Printer className="mr-2 h-5 w-5" />{" "}
          <span className="hidden sm:inline">Imprimir Etiquetas</span>
          <span className="sm:hidden">Imprimir</span>
        </Button>
      </div>

      {/* Preview das etiquetas */}
      <div className="p-4 md:p-8 flex flex-col items-center gap-6">
        {items.map((item, index) => (
          <div
            key={item.id_product || item.id || index}
            className="bg-white shadow-lg rounded-lg overflow-hidden w-full max-w-[378px]"
            style={{
              height: "227px",
            }} /* ~100mm x 60mm em 96dpi */
          >
            <div className="p-4 flex flex-col justify-between h-full">
              {/* Header: SKU + Condição */}
              <div>
                <div className="flex justify-between items-start">
                  {item.sku ? (
                    <span className="font-mono text-sm font-bold bg-black text-white px-2 py-0.5 rounded">
                      {item.sku}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">Sem SKU</span>
                  )}
                  <span className="text-[10px] font-bold uppercase border border-gray-400 px-1.5 py-0.5 rounded text-gray-700">
                    {getCondicaoLabel(item.condicao)}
                  </span>
                </div>

                {/* Nome */}
                <h2 className="text-base font-bold text-gray-900 mt-2 leading-tight line-clamp-2">
                  {item.name}
                </h2>
              </div>

              {/* Preço + Quantidade */}
              <div>
                <div className="border-t border-dashed border-gray-300 my-2" />
                <div className="flex justify-between items-end">
                  <span className="text-2xl font-bold text-gray-900">
                    R${" "}
                    {Number(item.preco).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                  <span className="text-xs text-gray-500">
                    Qtd: {item.quantidade}
                  </span>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[9px] text-gray-400">
                    {item.id_lote ? `Lote #${item.id_lote}` : "Avulso"}
                  </span>
                  <span className="text-[9px] text-gray-400">
                    {formatDate()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* HTML oculto para impressão */}
      <div ref={printRef} style={{ display: "none" }}>
        {items.map((item, index) => (
          <div className="etiqueta" key={item.id_product || item.id || index}>
            <div>
              <div className="header">
                {item.sku ? (
                  <span className="sku">{item.sku}</span>
                ) : (
                  <span style={{ fontSize: "8pt", color: "#999" }}>
                    Sem SKU
                  </span>
                )}
                <span className="condicao">
                  {getCondicaoLabel(item.condicao)}
                </span>
              </div>
              <div className="nome">{item.name}</div>
            </div>
            <div>
              <div className="divider" />
              <div className="info-row">
                <span className="preco">
                  R${" "}
                  {Number(item.preco).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
                <span className="qty">Qtd: {item.quantidade}</span>
              </div>
              <div className="footer">
                <span>{item.id_lote ? `Lote #${item.id_lote}` : "Avulso"}</span>
                <span>{formatDate()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Etiqueta;
