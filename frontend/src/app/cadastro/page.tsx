"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
} from "react-icons/fi";
import SquareReveal from "../components/SquareReveal";
import { supabase } from "@/lib/supabase";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

const registerSchema = z
  .object({
    name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
    email: z.string().email({ message: "E-mail inválido" }),
    password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),
    confirmPassword: z.string().min(6, { message: "Confirmação é obrigatória" }),
    terms: z.boolean().refine((val) => val === true, {
      message: "Você deve aceitar os termos e condições",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Cadastro() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [globalError, setGlobalError] = useState("");

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setLoading(true);
    setGlobalError("");

    try {
      const client = supabase;
      if (!client) {
        setGlobalError("Conexão com o banco de dados não configurada.");
        setLoading(false);
        return;
      }

      // 1. Criar usuário no Supabase Auth
      const { data: authData, error: signUpError } = await client.auth.signUp({
        email: values.email,
        password: values.password,
      });

      if (signUpError) throw signUpError;

      if (authData.user) {
        // 2. Inserir dados complementares na tabela 'usuarios'
        const { error: dbError } = await (client.from("usuarios") as unknown as { insert: (data: Record<string, unknown>[]) => Promise<{ error: unknown }> }).insert([
          {
            id: authData.user.id,
            nome: values.name,
            email: values.email,
            cargo: "Usuário",
          },
        ]);

        if (dbError) throw dbError;
      }

      setSuccess(true);
      form.reset();
    } catch (error: unknown) {
      console.error("Erro no cadastro:", error);
      const message = (error as Error)?.message || "Erro ao cadastrar. Tente novamente.";
      setGlobalError(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="h-screen w-full bg-black overflow-hidden relative">
        <SquareReveal gridSize={12}>
          <div className="w-full h-full flex items-center justify-center p-4 relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('/grid-pattern.png')] opacity-20 pointer-events-none bg-repeat"></div>
            {/* Glow Effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-500/20 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-md p-8 bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]">
              <div className="flex flex-col items-center text-center">
                <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6 shadow-[0_0_20px_-5px_rgba(34,197,94,0.3)]">
                  <svg
                    className="h-10 w-10 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold bg-linear-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-4">
                  Cadastro concluído!
                </h2>
                <p className="text-gray-400 text-sm mb-8">
                  Sua conta foi criada com sucesso. Agora você pode fazer login e aproveitar todos os recursos.
                </p>
                <Link href="/login" className="w-full">
                  <Button variant="shiny" className="w-full py-6 text-base">
                    Ir para Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </SquareReveal>
      </main>
    );
  }

  return (
    <main className="h-screen w-full bg-black overflow-hidden relative">
      <SquareReveal gridSize={12}>
        <div className="w-full h-full flex items-center justify-center p-4 relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('/grid-pattern.png')] opacity-20 pointer-events-none bg-repeat"></div>

          {/* Glow Effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/20 blur-[120px] rounded-full pointer-events-none"></div>

          <div className="relative z-10 w-full max-w-md p-8 bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="text-center mb-8">
              <h3 className="text-lg font-bold bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">Configuração de Acesso</h3>
              <h2 className="text-3xl font-bold bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Crie sua conta
              </h2>
              <p className="text-gray-400 text-sm mt-2">
                Preencha os campos abaixo para começar
              </p>
            </div>

            {globalError && (
              <div className="flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/20 p-3 rounded-lg mb-6 text-sm animate-pulse">
                <FiAlertCircle />
                <span>{globalError}</span>
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {/* Nome */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Nome completo</FormLabel>
                      <div className="relative group">
                        <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-400 transition-colors duration-300 z-10" />
                        <FormControl>
                          <Input
                            placeholder="Seu nome completo"
                            className="pl-10"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* E-mail */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">E-mail</FormLabel>
                      <div className="relative group">
                        <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-400 transition-colors duration-300 z-10" />
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="seu@email.com"
                            className="pl-10"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Senha */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Senha</FormLabel>
                      <div className="relative group">
                        <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-400 transition-colors duration-300 z-10" />
                        <FormControl>
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Sua senha"
                            className="pl-10 pr-10"
                            {...field}
                          />
                        </FormControl>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-cyan-400 transition-colors z-10"
                        >
                          {showPassword ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Confirmar Senha */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">
                        Confirme sua senha
                      </FormLabel>
                      <div className="relative group">
                        <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-400 transition-colors duration-300 z-10" />
                        <FormControl>
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Confirme sua senha"
                            className="pl-10 pr-10"
                            {...field}
                          />
                        </FormControl>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-cyan-400 transition-colors z-10"
                        >
                          {showPassword ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Termos */}
                <FormField
                  control={form.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormDescription className="text-gray-400">
                          Eu concordo com os{" "}
                          <Link
                            href="/termos"
                            className="text-cyan-400 hover:text-cyan-300 transition-colors hover:underline decoration-cyan-500/30"
                          >
                            Termos de Serviço
                          </Link>{" "}
                          e{" "}
                          <Link
                            href="/privacidade"
                            className="text-cyan-400 hover:text-cyan-300 transition-colors hover:underline decoration-cyan-500/30"
                          >
                            Política de Privacidade
                          </Link>
                        </FormDescription>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                {/* Botão de cadastro */}
                <Button
                  type="submit"
                  disabled={loading}
                  variant="shiny"
                  className="w-full py-6 text-base mt-2"
                >
                  {loading ? "Carregando..." : "Cadastrar"}
                </Button>
              </form>
            </Form>

            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <p className="text-sm text-gray-400">
                Já tem uma conta?{" "}
                <Link
                  href="/login"
                  className="text-cyan-400 font-medium hover:text-cyan-300 transition-colors hover:underline decoration-cyan-500/30"
                >
                  Faça login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </SquareReveal>
    </main>
  );
}
