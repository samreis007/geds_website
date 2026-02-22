'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiCheck, FiZap, FiUsers, FiClock, FiShield, FiGlobe, FiLayers } from 'react-icons/fi';
import { supabase } from '@/lib/supabase';

interface PlanFeature {
  text: string;
  icon: React.JSX.Element;
}

interface Plan {
  id: number;
  name: string;
  price: string;
  period: string;
  description: string;
  features: PlanFeature[];
  cta: string;
  ctaLink: string;
  popular: boolean;
}

const PricingSection = () => {
  const [annualBilling, setAnnualBilling] = useState(false);
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);
  const [plansList, setPlansList] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  const getIconForFeature = (text: string) => {
    if (text.includes('chat') || text.includes('interações')) return <FiClock className="text-blue-400" />;
    if (text.includes('Suporte')) return <FiUsers className="text-cyan-400" />;
    if (text.includes('Modelos') || text.includes('última geração')) return <FiLayers className="text-yellow-400" />;
    if (text.includes('API')) return <FiGlobe className="text-indigo-400" />;
    if (text.includes('rápida') || text.includes('desempenho')) return <FiZap className="text-red-400" />;
    if (text.includes('SLA') || text.includes('Segurança')) return <FiShield className="text-emerald-400" />;
    return <FiCheck className="text-green-400" />;
  };

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const client = supabase;
        if (!client) {
          console.warn('Supabase not configured, skipping fetchPlans');
          setLoading(false);
          return;
        }

        const { data, error } = await client
          .from('planos')
          .select('*')
          .order('id', { ascending: true });

        if (error) throw error;

        if (data) {
          const mappedPlans: Plan[] = data.map((p: Record<string, unknown>) => ({
            id: p.id as number,
            name: p.nome as string,
            price: annualBilling && (p.preco_anual as number) > 0
              ? `R$${(p.preco_anual as number).toString().replace('.', ',')}`
              : (p.preco_mensal as number) > 0 ? `R$${(p.preco_mensal as number).toString().replace('.', ',')}` : "Grátis",
            period: (p.preco_mensal as number) > 0 ? (annualBilling ? "/ano" : "/mês") : "",
            description: p.descricao as string,
            features: ((p.beneficios as string[]) || []).map((b: string) => ({
              text: b,
              icon: getIconForFeature(b)
            })),
            cta: (p.nome as string) === 'Empresarial' ? "Fale com nosso time" : ((p.nome as string) === 'Gratuito' ? "Começar agora" : "Teste grátis por 7 dias"),
            ctaLink: (p.nome as string) === 'Empresarial' ? "/contatos" : `/pagamento?plan=${p.nome}&price=${annualBilling ? p.preco_anual : p.preco_mensal}`,
            popular: (p.nome as string) === 'Premium'
          }));
          setPlansList(mappedPlans);
        }
      } catch (error) {
        console.error('Erro ao buscar planos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [annualBilling]);


  return (
    <section className="bg-black min-h-screen py-20 px-4 sm:px-6 lg:px-8 overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[20%] w-[800px] h-[800px] bg-cyan/10 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-20%] right-[10%] w-[600px] h-[600px] bg-cyan-600/10 blur-[150px] rounded-full"></div>
        <div className="absolute inset-0 bg-[url('/grid-pattern.png')] opacity-10 bg-repeat"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold sm:text-5xl bg-linear-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-6">
            Planos que se adaptam ao seu crescimento
          </h2>
          <p className="mt-4 text-xl text-gray-400 max-w-3xl mx-auto">
            Comece gratuitamente e evolua conforme suas necessidades.
            <span className="text-cyan font-medium ml-1">Economize 15% com o plano anual.</span>
          </p>

          <div className="mt-10 flex items-center justify-center bg-white/5 backdrop-blur-sm p-1.5 rounded-full w-fit mx-auto border border-white/10">
            <button
              onClick={() => setAnnualBilling(false)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${!annualBilling
                ? 'bg-cyan text-black shadow-lg shadow-cyan/20'
                : 'text-gray-400 hover:text-white'
                }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setAnnualBilling(true)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${annualBilling
                ? 'bg-cyan text-black shadow-lg shadow-cyan/20'
                : 'text-gray-400 hover:text-white'
                }`}
            >
              Anual
            </button>
          </div>
        </div>

        {loading ? (
          <div className="col-span-full border border-white/10 bg-white/5 rounded-2xl p-20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan mx-auto mb-4"></div>
            <p className="text-gray-400">Carregando planos dinâmicos...</p>
          </div>
        ) : plansList.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
            <FiShield className="w-16 h-16 text-gray-600 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-white mb-2">Planos indisponíveis</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              {!supabase
                ? "Conexão com o banco de dados não configurada. Verifique as variáveis de ambiente."
                : "Não conseguimos carregar os planos no momento. Tente novamente mais tarde."}
            </p>
            <Link href="/contatos" className="inline-block mt-6 px-6 py-2 bg-cyan-500 text-black font-semibold rounded-lg hover:bg-cyan-400 transition-colors">
              Fale conosco
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plansList.map((plan: Plan) => (
              <div
                key={plan.id}
                onMouseEnter={() => setHoveredPlan(plan.name)}
                onMouseLeave={() => setHoveredPlan(null)}
                className={`relative flex flex-col p-6 rounded-2xl border transition-all duration-500 group ${plan.popular
                  ? 'bg-linear-to-b from-cyan/10 to-black/40 border-cyan/50 hover:border-cyan shadow-[0_0_30px_-10px_rgba(0,219,255,0.3)]'
                  : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                  } ${hoveredPlan === plan.name ? '-translate-y-2' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-linear-to-r from-cyan to-cyan-600 text-black text-xs font-bold px-4 py-1 rounded-full shadow-lg border border-cyan/30">
                    Mais Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-sm text-gray-400 min-h-[40px]">{plan.description}</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-extrabold text-white tracking-tight">{plan.price}</span>
                    {plan.period && (
                      <span className="ml-1 text-sm font-medium text-gray-500">{plan.period}</span>
                    )}
                  </div>
                  {annualBilling && plan.name !== 'Gratuito' && plan.name !== 'Empresarial' && (
                    <span className="text-xs font-semibold text-green-400 block mt-1">
                      Economize 15%
                    </span>
                  )}
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature: PlanFeature, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-3 mt-0.5 shrink-0">{feature.icon}</span>
                      <span className="text-sm text-gray-300 group-hover:text-gray-200 transition-colors">{feature.text}</span>
                    </li>
                  ))}
                </ul>

                <Link href={plan.ctaLink} className="mt-auto">
                  <button
                    className={`w-full py-3.5 px-4 rounded-xl text-sm font-semibold transition-all duration-300 transform group-hover:scale-[1.02] active:scale-[0.98] ${plan.popular
                      ? 'bg-cyan hover:bg-cyan-600 text-black shadow-lg shadow-cyan/25'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                      }`}
                  >
                    {plan.cta}
                  </button>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Comparação de planos */}
        <div className="mt-24 border border-white/10 bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden">
          <div className="p-8 border-b border-white/10">
            <h2 className="text-2xl font-bold text-center text-white">Compare todos os recursos</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-white/5">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Recurso</th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">Free</th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">Premium</th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">Advanced</th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 bg-transparent">
                {[
                  { name: "Interações/mês", values: ["50", "2.000", "10.000", "Ilimitadas*"] },
                  { name: "Velocidade de resposta", values: ["Padrão", "2x mais rápida", "3x mais rápida", "Prioridade máxima"] },
                  { name: "Modelos disponíveis", values: ["Básico", "Avançado", "Premium", "Customizados"] },
                  { name: "Suporte", values: ["E-mail (48h)", "E-mail (24h)", "Chat 24/5", "Dedicado 24/7"] },
                  { name: "Integrações", values: ["-", "Básicas", "Completas", "Customizadas"] }
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{row.name}</td>
                    {row.values.map((val, vIdx) => (
                      <td key={vIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 text-center">{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Perguntas frequentes */}
        <div className="mt-24 mb-16">
          <h2 className="text-3xl font-bold text-center text-white mb-10">Perguntas frequentes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {[
              { q: "Posso mudar de plano a qualquer momento?", a: "Sim, você pode atualizar ou reduzir seu plano a qualquer momento. As alterações serão aplicadas no próximo ciclo de faturamento." },
              { q: "Há cobrança por interações não utilizadas?", a: "Não, suas interações não utilizadas não são acumulativas e não haverá cobrança adicional por não utilizá-las." },
              { q: "Qual a diferença entre os modelos?", a: "Os modelos mais avançados oferecem respostas mais precisas, capacidade de lidar com contextos complexos e maior velocidade de processamento." },
              { q: "Oferecem teste gratuito?", a: "Sim, os planos Premium e Advanced incluem 7 dias gratuitos para você testar todos os recursos antes de se comprometer." }
            ].map((faq, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-colors">
                <h3 className="text-lg font-semibold text-white mb-3">{faq.q}</h3>
                <p className="text-gray-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
