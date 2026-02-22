"use client";
import { NextPage } from 'next';
import NextImage from 'next/image';
import Head from 'next/head';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PostgrestSingleResponse } from '@supabase/supabase-js';
import { FiCheckCircle } from 'react-icons/fi';

import jsPDF from 'jspdf';
import SquareReveal from '../components/SquareReveal';
import { supabase } from '@/lib/supabase';
import { useForm, useWatch } from 'react-hook-form';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const paymentSchema = z.object({
  paymentMethod: z.enum(["pix", "boleto", "cartao"]),
  discountCode: z.string().optional(),
  terms: z.boolean().refine((val) => val === true, {
    message: "Você deve aceitar os termos e condições",
  }),
  cardNumber: z.string().optional(),
  cardName: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCvv: z.string().optional(),
  installments: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.paymentMethod === "cartao") {
    if (!data.cardNumber || data.cardNumber.length < 16) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Número do cartão inválido", path: ["cardNumber"] });
    }
    if (!data.cardName || data.cardName.length < 3) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Nome no cartão é obrigatório", path: ["cardName"] });
    }
    if (!data.cardExpiry || !/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(data.cardExpiry)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Data inválida (MM/AA)", path: ["cardExpiry"] });
    }
    if (!data.cardCvv || data.cardCvv.length < 3) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "CVV inválido", path: ["cardCvv"] });
    }
    if (!data.installments) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Parcelas obrigatórias", path: ["installments"] });
    }
  }
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

const PaymentContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'boleto' | 'pix' | 'cartao'>('pix');
  const [copiedPixCode, setCopiedPixCode] = useState(false);
  const [pagamentoFinalizado, setPagamentoFinalizado] = useState(false);

  const [planName, setPlanName] = useState('Plano Premium');
  const [valorOriginal, setValorOriginal] = useState(49.99);
  const [valorComDesconto, setValorComDesconto] = useState(49.99);
  const [descontoAplicado, setDescontoAplicado] = useState(false);
  const [mensagemVoucher, setMensagemVoucher] = useState('');
  const [tipoMensagemVoucher, setTipoMensagemVoucher] = useState<'success' | 'error' | ''>('');
  const [boletoCode, setBoletoCode] = useState('');

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentMethod: "pix",
      discountCode: "",
      terms: false,
    },
    mode: "onChange"
  });

  const discountCode = useWatch({ control: form.control, name: "discountCode" });

  const generarCodigoBarrasAleatorio = useCallback(() => {
    const r1 = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    const r2 = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    const code = `23790.12345 ${r1}.678901 ${r2}.123456 1 999900000${Math.floor(valorOriginal * 100)}`;
    setBoletoCode(code);
  }, [valorOriginal]);

  useEffect(() => {
    const plan = searchParams.get('plan');
    const price = searchParams.get('price');

    if (plan) setPlanName(plan);
    if (price) {
      const p = parseFloat(price);
      setValorOriginal(p);
      setValorComDesconto(p);
    }
    generarCodigoBarrasAleatorio();
  }, [searchParams, generarCodigoBarrasAleatorio]);

  useEffect(() => {
    form.setValue("paymentMethod", activeTab);
  }, [activeTab, form]);

  const aplicarDescontoLogic = (valor: number, codigo?: string) => {
    if (!codigo || codigo.toUpperCase() !== 'OUT31/10') {
      return { valorComDesconto: valor, percentual: 0 };
    }
    if (valor > 100.00) {
      return { valorComDesconto: parseFloat((valor * 0.7).toFixed(2)), percentual: 30 };
    } else if (valor >= 40.00) {
      return { valorComDesconto: parseFloat((valor * 0.8).toFixed(2)), percentual: 20 };
    } else {
      return { valorComDesconto: parseFloat((valor * 0.95).toFixed(2)), percentual: 5 };
    }
  };

  const handleAplicarVoucher = () => {
    if (!discountCode?.trim()) {
      setMensagemVoucher('Insira um código');
      setTipoMensagemVoucher('error');
      return;
    }

    if (discountCode.toUpperCase() !== 'OUT31/10') {
      setMensagemVoucher('Voucher inválido');
      setTipoMensagemVoucher('error');
      setDescontoAplicado(false);
      setValorComDesconto(valorOriginal);
      return;
    }

    const resultado = aplicarDescontoLogic(valorOriginal, discountCode);
    setMensagemVoucher(`Voucher aplicado! ${resultado.percentual}% de desc.`);
    setTipoMensagemVoucher('success');
    setDescontoAplicado(true);
    setValorComDesconto(resultado.valorComDesconto);
  };


  const getPixCode = () => {
    const valor = descontoAplicado ? valorComDesconto : valorOriginal;
    return `00020126360014BR.GOV.BCB.PIX0114+5548999999999520400005303986540${valor.toFixed(2).length.toString().padStart(2, '0')}${valor.toFixed(2)}5802BR5925GEDS INOVACAO6007BRASILIA62070503***6304`;
  };

  const copyPixCode = () => {
    navigator.clipboard.writeText(getPixCode());
    setCopiedPixCode(true);
    setTimeout(() => setCopiedPixCode(false), 2000);
  };

  const handleFinalizarPagamento = async (values: PaymentFormValues) => {
    const valorPago = descontoAplicado ? valorComDesconto : valorOriginal;

    if (activeTab === 'boleto') {
      await handleDownloadPdf();
    }

    setPagamentoFinalizado(true);

    try {
      const client = supabase;
      if (!client) {
        console.warn('Supabase not configured, skipping payment registration');
        return;
      }

      const { data: userData } = await (client
        .from('usuarios')
        .select('id')
        .eq('email', 'edmilson@gedsinovacao.com')
        .single() as unknown as Promise<PostgrestSingleResponse<Record<string, unknown>>>);

      const { data: planData } = await (client
        .from('planos')
        .select('id')
        .eq('nome', planName)
        .single() as unknown as Promise<PostgrestSingleResponse<Record<string, unknown>>>);

      const { error } = await (client
        .from('pagamentos') as unknown as { insert: (data: Record<string, unknown>[]) => Promise<{ error: unknown }> })
        .insert([
          {
            usuario_id: userData?.id,
            plano_id: planData?.id,
            valor: valorPago,
            metodo_pagamento: activeTab,
            status: 'concluido',
            codigo_voucher: values.discountCode || null,
            parcelas: values.paymentMethod === 'cartao' ? parseInt(values.installments || '1') : 1,
            cartao_final: values.paymentMethod === 'cartao' ? values.cardNumber?.slice(-4) : null,
            data_pagamento: new Date().toISOString()
          }
        ]);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
    }

    const historico = JSON.parse(localStorage.getItem('historicoPagamentos') || '[]');
    historico.unshift({
      id: Date.now(),
      data: new Date().toLocaleDateString('pt-BR'),
      hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      metodo: activeTab,
      valor: valorPago,
      plano: planName,
      status: 'Concluído'
    });
    localStorage.setItem('historicoPagamentos', JSON.stringify(historico));

    setTimeout(() => {
      router.push('/');
    }, 3000);
  };

  const handleDownloadPdf = async () => {
    const pdf = new jsPDF();
    pdf.setFillColor(0, 0, 0);
    pdf.rect(0, 0, 210, 40, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(22);
    pdf.text('GEDS INOVAÇÃO', 50, 20);
    pdf.setFontSize(14);
    pdf.text('DETALHES DO PEDIDO', 20, 60);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Plano: ${planName}`, 20, 75);
    pdf.text(`Valor: ${formatCurrency(descontoAplicado ? valorComDesconto : valorOriginal)}`, 20, 85);
    pdf.text(`Código de Barras: ${boletoCode}`, 20, 100);
    pdf.save('boleto-geds.pdf');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <main className="min-h-screen w-full bg-black overflow-x-hidden relative">
      <SquareReveal gridSize={12}>
        <div className="w-full min-h-screen flex items-center justify-center p-4 relative py-20">
          <div className="absolute inset-0 bg-[url('/grid-pattern.png')] opacity-20 pointer-events-none bg-repeat"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/20 blur-[120px] rounded-full pointer-events-none"></div>

          <div className="relative z-10 w-full max-w-6xl bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl flex flex-col md:flex-row overflow-hidden">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleFinalizarPagamento)} className="w-full flex flex-col md:flex-row">
                <div className="w-full p-6 md:p-10">
                  <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold bg-linear-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-2">Finalizar Pagamento</h1>
                    <p className="text-gray-400 text-sm">Escolha a forma de pagamento para o {planName}</p>
                  </div>

                  {pagamentoFinalizado && (
                    <div className="mb-8 p-6 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
                      <FiCheckCircle className="w-10 h-10 text-cyan-500" />
                      <div>
                        <h3 className="text-xl font-bold text-white">Pagamento concluído!</h3>
                        <p className="text-cyan-500 text-sm">Redirecionando para a página principal...</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-8">
                      <Tabs defaultValue="pix" value={activeTab} onValueChange={(v) => setActiveTab(v as 'boleto' | 'pix' | 'cartao')} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10">
                          <TabsTrigger value="pix">Pix</TabsTrigger>
                          <TabsTrigger value="boleto">Boleto</TabsTrigger>
                          <TabsTrigger value="cartao">Cartão</TabsTrigger>
                        </TabsList>

                        <TabsContent value="pix" className="space-y-6 pt-4">
                          <div className="bg-cyan-500/5 p-8 rounded-xl border border-cyan-500/20 text-center">
                            <div className="flex justify-center mb-6">
                              <div className="bg-white p-2 rounded-lg">
                                <NextImage
                                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(getPixCode())}`}
                                  alt="QR Code" width={150} height={150} unoptimized
                                />
                              </div>
                            </div>
                            <Button type="button" onClick={copyPixCode} variant="outline" className="w-full border-cyan-500/30 text-cyan-400">
                              {copiedPixCode ? "Copiado!" : "Copiar Código Pix"}
                            </Button>
                          </div>
                        </TabsContent>

                        <TabsContent value="boleto" className="space-y-6 pt-4">
                          <div className="bg-white/5 p-8 rounded-xl border border-white/10">
                            <p className="text-gray-400 text-sm mb-4">O boleto será gerado após clicar em &quot;Gerar Boleto&quot;.</p>
                            <div className="bg-black/40 p-4 rounded border border-white/10 font-mono text-xs text-gray-300 break-all">
                              {boletoCode}
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="cartao" className="space-y-4 pt-4">
                          <div className="space-y-4">
                            <FormField
                              control={form.control}
                              name="cardNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Número do Cartão</FormLabel>
                                  <FormControl>
                                    <Input placeholder="0000 0000 0000 0000" {...field} maxLength={19} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="cardName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Nome no Cartão</FormLabel>
                                  <FormControl>
                                    <Input placeholder="JOÃO SILVA" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="cardExpiry"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Validade</FormLabel>
                                    <FormControl>
                                      <Input placeholder="MM/AA" {...field} maxLength={5} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="cardCvv"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>CVV</FormLabel>
                                    <FormControl>
                                      <Input placeholder="000" {...field} maxLength={4} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <FormField
                              control={form.control}
                              name="installments"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Parcelas</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecione as parcelas" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="1">1x de {formatCurrency(descontoAplicado ? valorComDesconto : valorOriginal)}</SelectItem>
                                      <SelectItem value="2">2x de {formatCurrency((descontoAplicado ? valorComDesconto : valorOriginal) / 2)}</SelectItem>
                                      <SelectItem value="3">3x de {formatCurrency((descontoAplicado ? valorComDesconto : valorOriginal) / 3)}</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormItem>
                              )}
                            />
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                        <h3 className="text-lg font-semibold text-white mb-4">Resumo</h3>
                        <div className="space-y-2 text-sm text-gray-300">
                          <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>{formatCurrency(valorOriginal)}</span>
                          </div>
                          {descontoAplicado && (
                            <div className="flex justify-between text-cyan-400">
                              <span>Desconto</span>
                              <span>-{formatCurrency(valorOriginal - valorComDesconto)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-white font-bold text-lg pt-4 border-t border-white/10">
                            <span>Total</span>
                            <span className="text-cyan-400">{formatCurrency(descontoAplicado ? valorComDesconto : valorOriginal)}</span>
                          </div>
                        </div>

                        <div className="mt-6 space-y-4">
                          <div className="flex gap-2">
                            <FormField
                              control={form.control}
                              name="discountCode"
                              render={({ field }) => (
                                <Input placeholder="Voucher" {...field} className="h-9" />
                              )}
                            />
                            <Button type="button" onClick={handleAplicarVoucher} className="bg-cyan-500 text-black h-9 text-xs">Aplicar</Button>
                          </div>
                          {mensagemVoucher && <p className={`text-[10px] ${tipoMensagemVoucher === 'success' ? 'text-cyan-400' : 'text-red-400'}`}>{mensagemVoucher}</p>}
                        </div>

                        <div className="mt-8 space-y-4">
                          <FormField
                            control={form.control}
                            name="terms"
                            render={({ field }) => (
                              <FormItem className="flex items-start space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <FormLabel className="text-[10px] text-gray-400 leading-tight cursor-pointer">
                                  Aceito os termos e condições.
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                          <Button type="submit" disabled={pagamentoFinalizado} variant="shiny" className="w-full">
                            {pagamentoFinalizado ? "PROCESSANDO..." : "FINALIZAR AGORA"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </SquareReveal>
    </main>
  );
};

const PaymentPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>GEDS - Finalizar Pagamento</title>
      </Head>
      <Suspense fallback={<div className="h-screen w-full bg-black flex items-center justify-center text-white">Carregando...</div>}>
        <PaymentContent />
      </Suspense>
    </>
  );
};

export default PaymentPage;