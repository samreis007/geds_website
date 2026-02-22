"use client";

import { motion } from "framer-motion";
import { FiGithub, FiExternalLink } from "react-icons/fi";
import Image from "next/image";
import SquareReveal from "../components/SquareReveal";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { PostgrestResponse } from "@supabase/supabase-js";

interface Project {
  title: string;
  link: string;
  description: string;
  techs: string[];
}

interface Collaborator {
  name: string;
  role: string;
  bio: string;
  github: string;
  avatar: string;
  projects: Project[];
}

export default function PortfoliosPage() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const client = supabase;
        if (!client) {
          console.warn('Supabase not configured, skipping fetchData in Portfolios');
          setLoading(false);
          return;
        }

        // Buscar todos os usuários
        const { data: users, error: userError } = await (client
          .from('usuarios')
          .select('*') as unknown as Promise<PostgrestResponse<Record<string, unknown>>>);

        if (userError) throw userError;

        if (users) {
          const colabs: Collaborator[] = await Promise.all(users.map(async (user: Record<string, unknown>) => {
            // Buscar projetos de cada usuário
            const { data: projects, error: projectError } = await (client
              .from('projetos')
              .select('*')
              .eq('proprietario_id', user.id as string) as unknown as Promise<PostgrestResponse<Record<string, unknown>>>);

            if (projectError) throw projectError;

            return {
              name: user.nome as string,
              role: user.cargo as string,
              bio: user.biografia as string,
              github: user.url_github as string,
              avatar: (user.url_avatar as string) || "/eusinho.jpg",
              projects: (projects || []).map((p: Record<string, unknown>) => ({
                title: p.titulo as string,
                link: (p.url_repositorio as string) || (p.url_deploy as string) || "#",
                description: p.descricao as string,
                techs: (p.tecnologias as string[]) || [],
              }))
            };
          }));

          setCollaborators(colabs);
        }
      } catch (error) {
        console.error('Erro ao buscar portfolios:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <section className="bg-black text-white py-16">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
          <p className="text-gray-400">Carregando portfolios...</p>
        </div>
      ) : (
        <SquareReveal gridSize={12}>
          <div className="container mx-auto px-4 max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Excelência Técnica
              </h1>
              <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
                Acreditamos que a qualidade do software é reflexo da competência de quem o constrói.
                Conheça os profissionais por trás das nossas soluções e os projetos que materializam nossa expertise técnica.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {collaborators.map((colab, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -5 }}
                  className="bg-white/5 rounded-xl shadow-lg overflow-hidden border border-white/10 hover:shadow-[0_0_20px_rgba(0,219,255,0.2)] hover:border-cyan-500/50 transition-all duration-300 backdrop-blur-sm"
                >
                  <div className="p-6">
                    <div className="flex flex-col items-center relative">
                      <div className="relative w-28 h-28 mb-4">
                        <Image
                          src={colab.avatar}
                          alt={colab.name}
                          width={112}
                          height={112}
                          className="w-full h-full rounded-full object-cover border-4 border-black shadow-lg z-10 relative"
                        />
                        <div className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-ping opacity-0 hover:opacity-100 transition-opacity z-0"></div>
                        <div className="absolute -inset-1 rounded-full bg-linear-to-r from-cyan-500 to-blue-600 blur opacity-30"></div>
                      </div>
                      <h2 className="text-2xl font-bold text-white">{colab.name}</h2>
                      <p className="text-cyan-400 font-medium">{colab.role}</p>
                      <p className="text-gray-400 mt-3 text-center text-sm">{colab.bio}</p>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-sm font-semibold text-gray-300 mb-3 border-b border-white/10 pb-2 uppercase tracking-wider">
                        Projetos Destacados
                      </h3>
                      <ul className="space-y-4">
                        {colab.projects.map((project, i) => (
                          <li key={i} className="bg-black/30 p-3 rounded-lg border border-white/5 hover:border-cyan-500/30 transition-colors">
                            <div className="flex justify-between items-start">
                              <a
                                href={project.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white hover:text-cyan-400 font-medium flex items-center transition-colors"
                              >
                                {project.title}
                                <FiExternalLink className="ml-1 text-sm" />
                              </a>
                            </div>
                            {project.description && (
                              <p className="text-sm text-gray-500 mt-1">{project.description}</p>
                            )}
                            {project.techs && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {project.techs.map((tech, j) => (
                                  <span
                                    key={j}
                                    className="bg-cyan-900/40 text-cyan-300 text-xs font-medium px-2 py-1 rounded-full border border-cyan-500/20"
                                  >
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-6 text-center">
                      <a
                        href={colab.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 border border-white/10 hover:border-white/30 transition-all"
                      >
                        <FiGithub className="mr-2" />
                        Ver GitHub
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mt-20 text-center border-t border-white/10 pt-10"
            >
              <p className="text-gray-400 text-lg font-light">
                Nosso time combina rigor técnico, atualização constante e visão estratégica para entregar software de classe mundial. 👨‍💻
              </p>
            </motion.div>
          </div>
        </SquareReveal>
      )}
    </section>
  );
}