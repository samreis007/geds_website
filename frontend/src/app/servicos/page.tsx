"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Code2, Cloud, LineChart, Search, Layout, ArrowRight, type LucideIcon } from "lucide-react";

const IconMap: { [key: string]: LucideIcon } = {
  Code2: Code2,
  Cloud: Cloud,
  LineChart: LineChart,
  Search: Search,
  Layout: Layout,
};

interface Service {
  id: number;
  titulo: string;
  descricao: string;
  nome_icone: string;
  url_imagem: string;
  url_link: string;
  categoria: string;
}

const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const client = supabase;
        if (!client) {
          console.warn('Supabase not configured, skipping fetchServices');
          setLoading(false);
          return;
        }

        const { data, error } = await client
          .from('servicos')
          .select('*')
          .order('id', { ascending: true });

        if (error) throw error;
        if (data) setServices(data as Service[]);
      } catch (error) {
        console.error('Erro ao buscar serviços:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const renderIcon = (iconName: string) => {
    const IconComponent = IconMap[iconName] || Layout;
    return <IconComponent className="w-12 h-12 text-cyan-400" />;
  };

  return (
    <section id="servicos" className="py-20 bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
        >
          <span className="inline-block mb-4 text-cyan-400 font-medium bg-cyan-900/30 px-4 py-1 rounded-full border border-cyan-500/30">
            Nossos Serviços
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Soluções <span className="text-cyan-400">Tecnológicas</span> Sob Medida
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Impulsionamos seu negócio com desenvolvimento web de alta qualidade e soluções inovadoras
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Carregando serviços...</p>
            </div>
          ) : (
            services.map((service, index) => (
              <motion.div
                key={service.id}
                className="group bg-white/5 rounded-xl shadow-lg overflow-hidden border border-white/10 hover:shadow-[0_0_20px_rgba(0,219,255,0.2)] hover:border-cyan-500/50 transition-all"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={service.url_imagem}
                    alt={service.titulo}
                    width={400}
                    height={192}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 grayscale group-hover:grayscale-0"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 p-2 bg-black/60 rounded-lg backdrop-blur-md border border-white/10">
                    {renderIcon(service.nome_icone)}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">{service.titulo}</h3>
                  <p className="text-gray-400 mb-4">{service.descricao}</p>
                  <Link
                    href={service.url_link}
                    className="inline-flex items-center text-cyan-400 font-medium hover:text-cyan-300 transition"
                  >
                    Saiba mais
                    <ArrowRight className="ml-2" />
                  </Link>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Destaque Tecnológico */}
        <motion.div
          className="mt-20 bg-white/5 rounded-2xl shadow-xl overflow-hidden border border-white/10 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-1/2 p-10 lg:p-14 bg-linear-to-r from-blue-900/60 to-cyan-900/60 text-white border-r border-white/10">
              <h3 className="text-3xl font-bold mb-4">Tecnologias que Dominamos</h3>
              <p className="text-gray-300 mb-6">
                Utilizamos as ferramentas mais modernas do mercado para entregar soluções de alta performance e qualidade.
              </p>
              <div className="flex flex-wrap gap-3">
                {['React', 'Next.js', 'TypeScript', 'Node.js', 'Tailwind CSS', 'MSQL'].map((tech, i) => (
                  <span key={i} className="px-4 py-2 bg-black/40 border border-white/20 rounded-full text-sm text-cyan-300">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            <div className="lg:w-1/2 p-10 lg:p-14">
              <h3 className="text-3xl font-bold text-white mb-4">Nossa Abordagem</h3>
              <p className="text-gray-400 mb-6">
                Combinamos metodologias ágeis com anos de experiência para entregar projetos que realmente fazem a diferença.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="bg-cyan-900/40 p-1 rounded-full mt-1">
                    <ArrowRight className="text-cyan-400" />
                  </div>
                  <span className="text-gray-300">Desenvolvimento iterativo e incremental</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-cyan-900/40 p-1 rounded-full mt-1">
                    <ArrowRight className="text-cyan-400" />
                  </div>
                  <span className="text-gray-300">Foco na experiência do usuário</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-cyan-900/40 p-1 rounded-full mt-1">
                    <ArrowRight className="text-cyan-400" />
                  </div>
                  <span className="text-gray-300">Testes automatizados e qualidade garantida</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Botão de Voltar */}
        <motion.div
          className="flex justify-center mt-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Link
            href="/"
            className="inline-flex items-center bg-cyan-500 text-black px-8 py-3 rounded-full font-bold hover:bg-cyan-400 transition shadow-[0_0_20px_rgba(0,219,255,0.4)] hover:shadow-[0_0_30px_rgba(0,219,255,0.6)]"
          >
            Voltar para a página inicial
            <ArrowRight className="ml-2" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Services;