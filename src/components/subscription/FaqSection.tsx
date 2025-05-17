
export function FaqSection() {
  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Perguntas Frequentes</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-2">Como posso cancelar minha assinatura?</h3>
          <p className="text-muted-foreground">
            Você pode cancelar sua assinatura a qualquer momento através do portal de gerenciamento de assinatura. 
            O cancelamento será efetivo no final do período de cobrança atual.
          </p>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2">Quais formas de pagamento são aceitas?</h3>
          <p className="text-muted-foreground">
            Aceitamos cartões de crédito Visa, Mastercard, American Express para assinaturas mensais e anuais.
          </p>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2">O que acontece se eu exceder o limite do plano gratuito?</h3>
          <p className="text-muted-foreground">
            Quando você atingir o limite de 5 conversões no plano gratuito, será necessário aguardar até o próximo mês 
            ou fazer upgrade para o plano premium para continuar utilizando o serviço.
          </p>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2">O plano premium oferece algum desconto para pagamento anual?</h3>
          <p className="text-muted-foreground">
            Sim! Ao optar pelo pagamento anual, você recebe 2 meses grátis, economizando 16% em relação ao plano mensal.
          </p>
        </div>
      </div>
    </div>
  );
}
