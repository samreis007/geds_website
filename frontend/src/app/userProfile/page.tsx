'use client';

import { FiEdit, FiAward, FiBriefcase, FiCode, FiMail } from 'react-icons/fi';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';
import Image from 'next/image';
import SquareReveal from '../components/SquareReveal';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { PostgrestSingleResponse, PostgrestResponse } from '@supabase/supabase-js';

interface UserData {
  name: string;
  role: string;
  avatar: string;
  bio: string;
  email: string;
  skills: string[];
  stats: {
    projects: number;
    experience: number;
    clients: number;
  };
  socials: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  }
}

const UserProfile = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const client = supabase;
        if (!client) {
          console.warn('Supabase not configured, skipping fetchUser');
          setLoading(false);
          return;
        }

        // Buscando o usuário administrador como exemplo
        const { data, error } = await (client
          .from('usuarios')
          .select('*')
          .eq('email', 'edmilson@gedsinovacao.com')
          .single() as unknown as Promise<PostgrestSingleResponse<Record<string, unknown>>>);

        if (error) throw error;

        if (data) {
          // Buscando total de projetos para o usuário
          const { count: projectCount } = await (client
            .from('projetos')
            .select('*', { count: 'exact', head: true })
            .eq('proprietario_id', (data as { id: string }).id) as unknown as Promise<PostgrestResponse<Record<string, unknown>>>);

          setUser({
            name: (data as Record<string, unknown>).nome as string,
            role: (data as Record<string, unknown>).cargo as string,
            avatar: ((data as Record<string, unknown>).url_avatar as string) || "https://randomuser.me/api/portraits/men/32.jpg",
            bio: (data as Record<string, unknown>).biografia as string,
            email: (data as Record<string, unknown>).email as string,
            skills: ((data as Record<string, unknown>).habilidades as string[]) || [],
            stats: {
              projects: projectCount || 0,
              experience: ((data as Record<string, unknown>).experiencia_anos as number) || 0,
              clients: ((data as Record<string, unknown>).total_clientes as number) || 0
            },
            socials: {
              github: (data as Record<string, unknown>).url_github as string,
              linkedin: (data as Record<string, unknown>).url_linkedin as string,
              twitter: (data as Record<string, unknown>).url_twitter as string
            }
          });
        }
      } catch (error) {
        console.error('Erro ao buscar perfil:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p>Usuário não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <SquareReveal gridSize={14}>
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/10">
          {/* Cabeçalho do perfil */}
          <div className="relative h-40 bg-linear-to-r from-cyan-900 to-blue-900">
            <div className="absolute inset-0 bg-[url('/grid-pattern.png')] opacity-30"></div>
            <div className="absolute -bottom-16 left-6">
              <Image
                src={user.avatar}
                alt={user.name}
                width={128}
                height={128}
                className="w-32 h-32 rounded-full border-4 border-black object-cover shadow-2xl"
                priority
              />
              <button className="absolute bottom-2 right-2 bg-black/80 p-2 rounded-full text-white hover:bg-cyan-500 hover:text-black transition-all border border-white/20">
                <FiEdit />
              </button>
            </div>
          </div>
        </div>

        {/* Corpo do perfil */}
        <div className="pt-20 px-6 pb-8 bg-black/40">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            {/* Informações principais */}
            <div className="md:w-2/3">
              <h1 className="text-4xl font-bold text-white">{user.name}</h1>
              <p className="text-cyan-400 flex items-center gap-2 mt-1 font-medium">
                <FiBriefcase />
                {user.role}
              </p>

              <p className="text-gray-300 mt-4 leading-relaxed">{user.bio}</p>

              {/* Habilidades */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                  <FiCode className="text-cyan-400" /> Habilidades
                </h3>
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-white/5 rounded-full text-sm text-cyan-200 border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition cursor-default"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Estatísticas e contato */}
            <div className="md:w-1/3 space-y-6">
              {/* Estatísticas */}
              <div className="bg-white/5 p-6 rounded-xl border border-white/10 hover:border-white/20 transition">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FiAward className="text-yellow-400" /> Estatísticas
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-gray-400 text-sm">Projetos</p>
                    <p className="text-white font-bold text-xl">{user.stats.projects}+</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-gray-400 text-sm">Experiência</p>
                    <p className="text-white font-bold text-xl">{user.stats.experience} anos</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-gray-400 text-sm">Clientes</p>
                    <p className="text-white font-bold text-xl">{user.stats.clients}+</p>
                  </div>
                </div>
              </div>

              {/* Contato */}
              <div className="bg-white/5 p-6 rounded-xl border border-white/10 hover:border-white/20 transition">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FiMail className="text-cyan-400" /> Contato
                </h3>
                <div className="space-y-4">
                  <a
                    href={`mailto:${user.email}`}
                    className="flex items-center gap-3 text-gray-300 hover:text-cyan-400 transition group p-2 rounded-lg hover:bg-white/5"
                  >
                    <FiMail className="group-hover:text-cyan-400" /> <span className="truncate">{user.email}</span>
                  </a>
                  <div className="flex justify-around pt-2 border-t border-white/10">
                    <a href={user.socials.linkedin || "#"} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-blue-500 transition hover:bg-white/5 rounded-lg">
                      <FaLinkedin className="text-2xl" />
                    </a>
                    <a href={user.socials.github || "#"} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-white transition hover:bg-white/5 rounded-lg">
                      <FaGithub className="text-2xl" />
                    </a>
                    <a href={user.socials.twitter || "#"} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-cyan-400 transition hover:bg-white/5 rounded-lg">
                      <FaTwitter className="text-2xl" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SquareReveal>
    </div>
  );
};

export default UserProfile;