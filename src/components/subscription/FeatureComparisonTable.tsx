
export function FeatureComparisonTable() {
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6">Comparação de Recursos</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left py-4 px-4">Recursos</th>
              <th className="text-center py-4 px-4">Gratuito</th>
              <th className="text-center py-4 px-4">Premium</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-4 px-4">Conversões mensais</td>
              <td className="text-center py-4 px-4">5</td>
              <td className="text-center py-4 px-4">Ilimitado</td>
            </tr>
            <tr className="border-b">
              <td className="py-4 px-4">Tamanho máximo do arquivo</td>
              <td className="text-center py-4 px-4">5MB</td>
              <td className="text-center py-4 px-4">50MB</td>
            </tr>
            <tr className="border-b">
              <td className="py-4 px-4">Formatos suportados</td>
              <td className="text-center py-4 px-4">Básicos</td>
              <td className="text-center py-4 px-4">Todos</td>
            </tr>
            <tr className="border-b">
              <td className="py-4 px-4">Assinatura digital</td>
              <td className="text-center py-4 px-4">Não</td>
              <td className="text-center py-4 px-4">Sim</td>
            </tr>
            <tr className="border-b">
              <td className="py-4 px-4">Junção de PDFs</td>
              <td className="text-center py-4 px-4">Não</td>
              <td className="text-center py-4 px-4">Sim</td>
            </tr>
            <tr className="border-b">
              <td className="py-4 px-4">Suporte prioritário</td>
              <td className="text-center py-4 px-4">Não</td>
              <td className="text-center py-4 px-4">Sim</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
