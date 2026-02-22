"use client";

import { FaInstagram, FaGithub, FaLinkedin, FaPaperPlane, FaEnvelope, FaMapMarkerAlt, FaWhatsapp, FaGlobe } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import SquareReveal from '../components/SquareReveal';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const contactSchema = z.object({
  name: z.string().min(2, { message: "Nome é obrigatório" }),
  email: z.string().email({ message: "Email inválido" }),
  subject: z.string().optional(),
  message: z.string().min(10, { message: "Mensagem deve ter pelo menos 10 caracteres" }),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    try {
      const client = supabase;
      if (!client) {
        alert("Serviço de mensagens indisponível no momento.");
        setIsSubmitting(false);
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (client.from('contatos') as any)
        .insert([
          {
            nome: data.name,
            email: data.email,
            assunto: data.subject || 'Sem assunto',
            mensagem: data.message,
            status: 'nao_lido'
          }
        ]);

      if (error) throw error;

      alert(`Obrigado pela mensagem, ${data.name}! Entraremos em contato em breve.`);
      form.reset();
    } catch (error: unknown) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente mais tarde.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-black overflow-hidden relative">
      <SquareReveal gridSize={12}>
        <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 relative py-20">

          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('/grid-pattern.png')] opacity-20 pointer-events-none bg-repeat"></div>

          {/* Animated Glow Effects */}
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none animate-pulse-slow"></div>
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none animate-pulse-slow delay-1000"></div>

          <div className="container mx-auto px-4 z-10 relative max-w-7xl">

            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <h2 className="text-5xl md:text-7xl font-bold bg-linear-to-r from-white via-cyan-100 to-blue-200 bg-clip-text text-transparent mb-6 tracking-tight">
                Vamos Criar o Futuro?
              </h2>
              <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto font-light leading-relaxed">
                Transforme suas ideias em realidade digital com a <span className="text-cyan-400 font-semibold">GEDS Inovação</span>.
                Estamos prontos para elevar o seu projeto ao próximo nível.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

              {/* Left Column: Contact Cards & Socials */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                <div className="relative group">
                  <div className="absolute inset-0 bg-linear-to-r from-cyan-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition-opacity duration-500"></div>
                  <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-cyan-500/30 transition-all duration-300">
                    <h3 className="text-3xl font-bold text-white mb-8">Canais de Atendimento</h3>

                    <div className="space-y-6">
                      {/* Email Card */}
                      <a href="mailto:contato@gedsinovacao.com" className="flex items-center gap-6 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-cyan-500/30 transition-all group/item">
                        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/30 group-hover:scale-110 transition-transform duration-300">
                          <FaEnvelope className="text-cyan-400 text-2xl" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 uppercase tracking-wider mb-1">Email Corporativo</p>
                          <p className="text-lg md:text-xl text-white font-medium group-hover/item:text-cyan-300 transition-colors">contato@gedsinovacao.com</p>
                        </div>
                      </a>

                      {/* WhatsApp Card */}
                      <a href="https://wa.me/5598987654321" target="_blank" rel="noopener noreferrer" className="flex items-center gap-6 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-green-500/30 transition-all group/item">
                        <div className="h-14 w-14 rounded-full bg-green-500/20 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                          <FaWhatsapp className="text-green-400 text-2xl" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 uppercase tracking-wider mb-1">WhatsApp</p>
                          <p className="text-lg md:text-xl text-white font-medium group-hover/item:text-green-300 transition-colors">(98) 99999-9999</p>
                        </div>
                      </a>

                      {/* Location Card */}
                      <div className="flex items-center gap-6 p-4 rounded-xl bg-white/5 border border-white/5 group/item">
                        <div className="h-14 w-14 rounded-full bg-purple-500/20 flex items-center justify-center">
                          <FaMapMarkerAlt className="text-purple-400 text-2xl" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 uppercase tracking-wider mb-1">Localização</p>
                          <p className="text-lg md:text-xl text-white font-medium">São Luís - MA, Brasil <br /><span className="text-sm text-gray-500 font-normal">Atendimento Remoto Global</span></p>
                        </div>
                      </div>
                    </div>

                    {/* Socials */}
                    <div className="mt-10 pt-8 border-t border-white/10">
                      <p className="text-gray-400 mb-6 text-sm uppercase tracking-wider text-center">Siga-nos nas redes</p>
                      <div className="flex justify-center gap-6">
                        {[
                          { icon: FaInstagram, color: "hover:text-pink-500", label: "Instagram" },
                          { icon: FaGithub, color: "hover:text-white", label: "Github" },
                          { icon: FaLinkedin, color: "hover:text-blue-500", label: "LinkedIn" },
                          { icon: FaGlobe, color: "hover:text-cyan-400", label: "Website" }
                        ].map((social, index) => (
                          <a
                            key={index}
                            href="#"
                            className={`h-12 w-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 ${social.color} hover:bg-white/10 hover:scale-110 transition-all duration-300 shadow-lg`}
                            aria-label={social.label}
                          >
                            <social.icon className="text-2xl" />
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right Column: Premium Form */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <div className="absolute -inset-1 bg-linear-to-br from-cyan-600 via-blue-600 to-purple-600 rounded-2xl blur opacity-30"></div>
                <div className="relative bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-10 shadow-2xl">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-cyan-500/10 rounded-lg">
                      <FaPaperPlane className="text-cyan-400 text-2xl" />
                    </div>
                    <h3 className="text-3xl font-bold text-white">Envie uma Mensagem</h3>
                  </div>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-400 ml-1">Seu Nome</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="João Silva"
                                  className="py-6"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-400 ml-1">Seu Email</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="joao@exemplo.com"
                                  className="py-6"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-400 ml-1">Assunto (Opcional)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Interesse em desenvolvimento web..."
                                className="py-6"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-400 ml-1">Sua Mensagem</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Conte-nos sobre seu projeto ou dúvida..."
                                className="resize-none"
                                rows={5}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        variant="shiny"
                        className="w-full py-6 text-base"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          {isSubmitting ? (
                            <>Enviando...</>
                          ) : (
                            <>
                              <FaPaperPlane /> Enviar Agora
                            </>
                          )}
                        </span>
                      </Button>

                      <p className="text-center text-xs text-gray-500 mt-4">
                        Ao enviar, você concorda com nossa <a href="/politica-de-privacidade" className="text-cyan-500 hover:underline">Política de Privacidade</a>.
                      </p>
                    </form>
                  </Form>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </SquareReveal>
    </main>
  );
}
