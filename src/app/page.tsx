'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Sparkles, Bot, UtensilsCrossed, BarChart3, ShieldCheck,
  Zap, Clock, CreditCard, MessageCircle, Users, ChevronDown, Check,
  ShoppingBag, User, Receipt, TrendingUp, CheckCircle2, ChefHat
} from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { NeonButton } from '@/components/NeonButton';
import { GradientText } from '@/components/GradientText';
import { GridPattern, GlowOrb } from '@/components/GridPattern';




function AuthNav() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);
  if (isLoggedIn) {
    return (
      <div className="flex items-center gap-3">
        <NeonButton href="/dashboard" size="sm">
          Ir para Dashboard
        </NeonButton>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3">
      <Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors hidden sm:block">
        Entrar
      </Link>
      <NeonButton href="/cadastro" size="sm">
        Começar Grátis
      </NeonButton>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-[#050505]/70 backdrop-blur-sm" />
        <div className="max-w-7xl mx-auto px-6 py-4 relative flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff9607] to-[#ff0080] flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-black" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              <GradientText variant="orange">GB</GradientText>.AI
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-white/60 hover:text-white transition-colors">Funcionalidades</a>
            <a href="#como-funciona" className="text-sm text-white/60 hover:text-white transition-colors">Como funciona</a>
            <a href="#precos" className="text-sm text-white/60 hover:text-white transition-colors">Preços</a>
          </div>
          <AuthNav />
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-20">
        <GridPattern />
        <GlowOrb color="orange" className="w-[200px] h-[200px] -top-40 -right-40 opacity-30" />
        <GlowOrb color="cyan" className="w-[250px] h-[250px] top-1/2 -left-40 opacity-20" />
        <GlowOrb color="magenta" className="w-[200px] h-[200px] bottom-20 right-1/4 opacity-15" />

        <div className="max-w-7xl mx-auto px-6 py-20 relative w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div
              className="space-y-8"
            >
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] text-sm"
              >
                <Sparkles className="h-4 w-4 text-[#ff9607]" />
                <span className="text-white/80">Powered by Artificial Intelligence</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-black leading-[1.1] tracking-tight">
                Seu restaurante<br />
                no <GradientText>piloto automático</GradientText>
              </h1>

              <p className="text-lg lg:text-xl text-white/50 max-w-lg leading-relaxed">
                IA que cria cardápios completos, recebe pedidos pelo WhatsApp e gerencia 
                seu negócio sozinha. Você só precisa cozinhar.
              </p>

              <div className="flex flex-wrap gap-4">
                <AuthNav />
                <NeonButton href="/burger-king-gb" variant="secondary" size="lg">
                  Ver demonstração
                </NeonButton>
              </div>

              <div className="flex items-center gap-6 text-sm text-white/40 pt-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-green-400" />
                  <span>Sem comissões</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#00d4ff]" />
                  <span>Setup em 5 min</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-[#ff9607]" />
                  <span>IA integrada</span>
                </div>
              </div>
            </div>

            {/* Hero Visual - Dashboard Mockup */}
            <div
              className="relative hidden lg:block"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#ff9607]/20 via-[#ff0080]/10 to-[#00d4ff]/20 rounded-3xl blur-lg" />
                <div className="relative glass-strong rounded-3xl p-6 space-y-4">
                  {/* Header mock */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff9607] to-[#ff0080]" />
                      <div>
                        <div className="h-3 w-32 bg-white/20 rounded" />
                        <div className="h-2 w-20 bg-white/10 rounded mt-1" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-lg bg-white/5" />
                      <div className="w-8 h-8 rounded-lg bg-white/5" />
                    </div>
                  </div>
                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Pedidos hoje', value: 'R$ 1.247', icon: ShoppingBag, color: 'from-[#ff9607] to-[#ffaa33]', bg: 'bg-[#ff9607]/10' },
                      { label: 'Clientes', value: '89', icon: Users, color: 'from-[#00d4ff] to-[#0088ff]', bg: 'bg-[#00d4ff]/10' },
                      { label: 'Ticket médio', value: 'R$ 42', icon: Receipt, color: 'from-[#ff0080] to-[#aa00ff]', bg: 'bg-[#ff0080]/10' },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.06] hover:bg-white/[0.05] transition-colors">
                        <div className={`w-7 h-7 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
                          <stat.icon className="w-3.5 h-3.5 text-white/90" strokeWidth={2} />
                        </div>
                        <div className={`text-lg font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                          {stat.value}
                        </div>
                        <div className="text-[10px] text-white/40 mt-0.5">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                  {/* Chart mock */}
                  <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06]">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-white/70">Vendas da semana</span>
                      <div className="flex items-center gap-1 text-[10px] text-green-400">
                        <TrendingUp className="w-3 h-3" />
                        <span>+12%</span>
                      </div>
                    </div>
                    <div className="flex items-end justify-between h-20 gap-2">
                      {[40, 65, 45, 80, 55, 90, 70].map((h, i) => {
                        const labels = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                            <div
                              className="w-full bg-gradient-to-t from-[#ff9607]/80 to-[#ff9607]/20 rounded-t-md"
                              style={{ height: `${h}%` }}
                            />
                            <span className="text-[9px] text-white/30">{labels[i]}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {/* Orders mock */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-xs font-medium text-white/70">Pedidos recentes</span>
                      <span className="text-[10px] text-white/30">Ver todos</span>
                    </div>
                    <div className="space-y-2">
                      {[
                        { id: '#1042', name: 'João Silva', items: '1x Smash Burger, 1x Coca', time: '2 min', status: 'Entregue', statusColor: 'text-green-400 bg-green-400/10', dot: 'bg-green-400', value: 28.00 },
                        { id: '#1041', name: 'Maria Oliveira', items: '2x Pizza Média', time: '15 min', status: 'Em preparo', statusColor: 'text-[#ff9607] bg-[#ff9607]/10', dot: 'bg-[#ff9607]', value: 40.00 },
                        { id: '#1040', name: 'Carlos Souza', items: '1x Combo Família', time: '32 min', status: 'Novo', statusColor: 'text-[#00d4ff] bg-[#00d4ff]/10', dot: 'bg-[#00d4ff]', value: 52.00 },
                      ].map((order) => (
                        <div key={order.id} className="flex items-center justify-between bg-white/[0.03] rounded-lg p-3 border border-white/[0.06] hover:bg-white/[0.05] transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-2 h-2 rounded-full ${order.dot} shrink-0`} />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Pedido {order.id}</span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${order.statusColor}`}>{order.status}</span>
                              </div>
                              <div className="text-[10px] text-white/40 truncate">{order.name} • {order.items}</div>
                            </div>
                          </div>
                          <div className="text-right shrink-0 pl-3">
                            <div className="text-sm font-medium">R$ {order.value.toFixed(2)}</div>
                            <div className="text-[9px] text-white/30 flex items-center justify-end gap-1">
                              <Clock className="w-2.5 h-2.5" /> {order.time}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <a href="#features" className="flex flex-col items-center gap-2 text-white/30 hover:text-white/60 transition-colors">
            <span className="text-xs">Scroll</span>
            <ChevronDown className="h-4 w-4 animate-bounce" />
          </a>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 border-y border-white/[0.06] relative">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm text-white/40 mb-6">Já usado por estabelecimentos em todo o Brasil</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-30">
            {['🍔 Hamburguerias', '🍕 Pizzarias', '🍣 Japonesas', '🥐 Padarias', '🥤 Açaíterias'].map((item) => (
              <span key={item} className="text-lg font-medium whitespace-nowrap">{item}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section id="como-funciona" className="py-24 relative">
        <GridPattern />
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-4">
              De zero ao ar em <GradientText>3 passos</GradientText>
            </h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto">
              Configure tudo em minutos. Nossa IA faz o trabalho pesado por você.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-24 left-[16%] right-[16%] h-[1px]">
              <div className="h-full bg-gradient-to-r from-transparent via-[#ff9607]/50 to-transparent" />
            </div>

            {[
              {
                step: '01',
                icon: Zap,
                title: 'Configure em minutos',
                desc: 'Cadastre seu estabelecimento, endereço e formas de pagamento em um wizard simples e rápido.',
              },
              {
                step: '02',
                icon: Bot,
                title: 'IA cria seu cardápio',
                desc: 'Escolha o tipo do seu negócio e nossa IA gera categorias, produtos e preços em segundos.',
              },
              {
                step: '03',
                icon: MessageCircle,
                title: 'Receba pedidos no WhatsApp',
                desc: 'Seu robô automático recebe pedidos, confirma pagamentos e avisa quando sair para entrega.',
              },
            ].map((item, i) => (
              <div
                key={item.step}
                className="relative"
              >
                <GlassCard className="text-center h-full" glow="orange">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#ff9607]/20 to-[#ff0080]/20 border border-[#ff9607]/20 flex items-center justify-center">
                    <item.icon className="h-7 w-7 text-[#ff9607]" />
                  </div>
                  <div className="text-5xl font-black text-white/[0.04] absolute top-4 right-6">{item.step}</div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 relative">
        <GlowOrb color="cyan" className="w-[350px] h-[350px] top-0 right-0 opacity-10" />
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-4">
              Tudo que seu <GradientText>negócio precisa</GradientText>
            </h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto">
              Uma plataforma completa para você vender mais e gerenciar menos.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: UtensilsCrossed, title: 'Cardápio com IA', desc: 'Templates inteligentes por tipo de estabelecimento. Gere tudo automaticamente.', glow: 'orange' as const },
              { icon: MessageCircle, title: 'Pedidos no WhatsApp', desc: 'Robô que recebe pedidos, envia confirmações e notifica o cliente.', glow: 'cyan' as const },
              { icon: Users, title: 'Controle de Mesas', desc: 'QR Code por mesa. Cliente escaneia e pede sem esperar pelo garçom.', glow: 'magenta' as const },
              { icon: BarChart3, title: 'Relatórios Inteligentes', desc: 'Saiba o que vende mais, horários de pico e ticket médio em tempo real.', glow: 'orange' as const },
              { icon: ShieldCheck, title: 'Sem Comissão', desc: 'Você paga uma assinatura fixa. Não perca dinheiro com taxas por pedido.', glow: 'cyan' as const },
              { icon: CreditCard, title: 'Múltiplas Formas de Pagamento', desc: 'Pix, dinheiro, cartão na entrega. Você escolhe o que aceita.', glow: 'magenta' as const },
            ].map((feature, i) => (
              <GlassCard key={feature.title} delay={i * 0.1} glow={feature.glow} className="h-full">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4 ${
                  feature.glow === 'orange' ? 'from-[#ff9607]/20 to-[#ff9607]/5' :
                  feature.glow === 'cyan' ? 'from-[#00d4ff]/20 to-[#00d4ff]/5' :
                  'from-[#ff0080]/20 to-[#ff0080]/5'
                }`}>
                  <feature.icon className={`h-6 w-6 ${
                    feature.glow === 'orange' ? 'text-[#ff9607]' :
                    feature.glow === 'cyan' ? 'text-[#00d4ff]' :
                    'text-[#ff0080]'
                  }`} />
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{feature.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#ff9607]/[0.02] to-transparent" />
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-4">
              Painel de <GradientText>controle total</GradientText>
            </h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto">
              Acompanhe pedidos, financeiro, clientes e cardápio em um só lugar.
            </p>
          </div>

          <div
            className="relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-[#ff9607]/20 via-[#ff0080]/10 to-[#00d4ff]/20 rounded-3xl blur-xl" />
            <div className="relative glass-strong rounded-3xl p-1 overflow-hidden">
              <div className="bg-[#0a0a0f] rounded-[22px] p-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex-1 text-center text-xs text-white/20">dashboard.gb.ai</div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Faturamento hoje', value: 'R$ 1.247', trend: '+12%', color: 'text-[#ff9607]' },
                    { label: 'Pedidos', value: '32', trend: '+5', color: 'text-[#00d4ff]' },
                    { label: 'Clientes novos', value: '8', trend: '+2', color: 'text-[#ff0080]' },
                    { label: 'Ticket médio', value: 'R$ 38,90', trend: '+3%', color: 'text-green-400' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06]">
                      <div className="text-xs text-white/40 mb-1">{stat.label}</div>
                      <div className="flex items-end gap-2">
                        <span className={`text-xl font-bold ${stat.color}`}>{stat.value}</span>
                        <span className="text-xs text-green-400 mb-1">{stat.trend}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 bg-white/[0.03] rounded-xl p-4 border border-white/[0.06] h-48 flex items-end gap-2">
                    {[35, 55, 40, 70, 50, 85, 60, 75, 45, 65, 80, 55].map((h, i) => (
                      <div key={i} className="flex-1 bg-gradient-to-t from-[#ff9607]/40 to-[#ff9607]/10 rounded-t-sm" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                  <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06] space-y-3">
                    <div className="text-xs text-white/40">Pedidos recentes</div>
                    {['#1045 — R$ 67,80', '#1044 — R$ 45,90', '#1043 — R$ 89,50'].map((o) => (
                      <div key={o} className="flex items-center justify-between text-sm">
                        <span className="text-white/60">{o.split(' — ')[0]}</span>
                        <span className="text-[#ff9607] font-medium">{o.split(' — ')[1]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precos" className="py-24 relative">
        <GridPattern />
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-4">
              Preços <GradientText>simples</GradientText>
            </h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto">
              Comece grátis. Escale quando seu negócio crescer.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: 'Grátis',
                price: 'R$ 0',
                period: '/mês',
                desc: 'Perfeito para começar',
                features: ['1 loja', 'Cardápio digital', 'Pedidos via WhatsApp', 'Até 50 produtos', 'Relatórios básicos'],
                cta: 'Começar agora',
                popular: false,
              },
              {
                name: 'Pro',
                price: 'R$ 49',
                period: '/mês',
                desc: 'Para quem quer crescer',
                features: ['Tudo do Grátis', 'Cardápio com IA', 'Múltiplas lojas', 'Produtos ilimitados', 'Relatórios avançados', 'Modo salão', 'Robô WhatsApp'],
                cta: 'Escolher Pro',
                popular: true,
              },
              {
                name: 'Premium',
                price: 'R$ 99',
                period: '/mês',
                desc: 'Para redes e franquias',
                features: ['Tudo do Pro', 'API de integração', 'Suporte prioritário', 'Múltiplos usuários', 'White label', 'Analytics em tempo real'],
                cta: 'Falar com vendas',
                popular: false,
              },
            ].map((plan, i) => (
              <div
                key={plan.name}
              >
                <div className={`relative rounded-2xl p-6 h-full flex flex-col ${
                  plan.popular
                    ? 'bg-gradient-to-b from-[#ff9607]/10 to-transparent border border-[#ff9607]/30'
                    : 'bg-white/[0.03] border border-white/[0.08]'
                }`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-[#ff9607] to-[#ff0080] text-black text-xs font-bold px-3 py-1 rounded-full">
                        Mais popular
                      </span>
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-white/40 text-sm">{plan.desc}</p>
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-black">{plan.price}</span>
                    <span className="text-white/40">{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-white/60">
                        <Check className="h-4 w-4 text-[#ff9607] flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <NeonButton
                    href="/cadastro"
                    variant={plan.popular ? 'primary' : 'secondary'}
                    className="w-full"
                  >
                    {plan.cta}
                  </NeonButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 relative">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">
              Dúvidas <GradientText>frequentes</GradientText>
            </h2>
          </div>
          <div className="space-y-4">
            {[
              { q: 'Quanto tempo leva para começar?', a: 'Em menos de 5 minutos você já pode ter sua loja configurada. Nossa IA gera o cardápio automaticamente baseado no tipo do seu estabelecimento.' },
              { q: 'Preciso pagar comissão por pedido?', a: 'Nunca. Você paga apenas a assinatura mensal. Todo o faturamento é seu.' },
              { q: 'O robô do WhatsApp funciona como?', a: 'Assim que um cliente envia uma mensagem, o robô identifica o pedido, calcula o total, confirma o pagamento e envia atualizações de status automaticamente.' },
              { q: 'Posso usar sem o WhatsApp?', a: 'Sim! O cardápio digital funciona independentemente. O WhatsApp é uma funcionalidade extra para automação.' },
              { q: 'Tem contrato de fidelidade?', a: 'Não. Você pode cancelar a qualquer momento sem multa.' },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white/[0.03] rounded-xl border border-white/[0.08] p-5"
              >
                <h3 className="font-bold mb-2">{item.q}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#ff9607]/[0.03] to-transparent" />
        <GlowOrb color="orange" className="w-[350px] h-[350px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20" />
        <div
          className="max-w-4xl mx-auto px-6 text-center relative"
        >
          <h2 className="text-4xl lg:text-6xl font-black mb-6">
            Pronto para o <GradientText>futuro</GradientText> do seu negócio?
          </h2>
          <p className="text-white/40 text-lg mb-10 max-w-xl mx-auto">
            Junte-se a centenas de estabelecimentos que já automatizaram seus pedidos com IA.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <AuthNav />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-[#ff9607] to-[#ff0080] flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-black" />
              </div>
              <span className="font-bold">
                <GradientText variant="orange">GB</GradientText>.AI
              </span>
            </div>
            <div className="flex gap-6 text-sm text-white/30">
              <a href="#" className="hover:text-white/60 transition-colors">Termos</a>
              <a href="#" className="hover:text-white/60 transition-colors">Privacidade</a>
              <a href="#" className="hover:text-white/60 transition-colors">Contato</a>
            </div>
            <p className="text-sm text-white/20">© 2026 GB.AI. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
