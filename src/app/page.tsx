import Link from 'next/link';
import { ArrowRight, ShoppingBag, QrCode, Smartphone, Zap, Clock, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-transparent to-transparent" />
        <div className="max-w-6xl mx-auto px-6 py-20 relative">
          <nav className="flex items-center justify-between mb-16">
            <h1 className="text-3xl font-black tracking-tight">
              <span className="text-[#ff9607]">GB</span>.AI
            </h1>
            <div className="flex gap-4">
              <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
                Entrar
              </Link>
              <Link
                href="/cadastro"
                className="text-sm bg-[#ff9607] text-black px-5 py-2 rounded-full font-semibold hover:bg-[#ffaa33] transition-colors"
              >
                Começar Grátis
              </Link>
            </div>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm">
                <Zap className="h-4 w-4 text-[#ff9607]" />
                A nova era do delivery
              </div>
              <h2 className="text-5xl lg:text-7xl font-black leading-tight">
                Seu delivery<br />
                <span className="text-[#ff9607]">na velocidade</span><br />
                da luz
              </h2>
              <p className="text-xl text-gray-400 max-w-md">
                Crie seu cardápio digital, receba pedidos pelo WhatsApp e gerencie tudo em um só lugar.
                Sem comissões abusivas.
              </p>
              <div className="flex gap-4">
                <Link
                  href="/cadastro"
                  className="bg-[#ff9607] text-black px-8 py-4 rounded-2xl font-bold text-lg hover:bg-[#ffaa33] transition-colors flex items-center gap-2"
                >
                  Criar minha loja <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/burger-king-gb"
                  className="border border-white/20 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/5 transition-colors"
                >
                  Ver demonstração
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-[#ff9607] to-orange-600 rounded-3xl p-1">
                <div className="bg-gray-900 rounded-[22px] p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#ff9607] rounded-xl flex items-center justify-center">
                      <ShoppingBag className="h-6 w-6 text-black" />
                    </div>
                    <div>
                      <p className="font-bold">🍔 Burger King do GB</p>
                      <p className="text-sm text-gray-500">Aberto agora • 25-45 min</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {['X-Burger Artesanal', 'Batata Frita Grande', 'Coca-Cola'].map((item, i) => (
                      <div key={i} className="bg-white/5 rounded-xl p-3 flex justify-between items-center">
                        <span className="text-sm">{item}</span>
                        <span className="text-[#ff9607] font-bold text-sm">R$ {['28,90', '18,90', '6,50'][i]}</span>
                      </div>
                    ))}
                  </div>
                  <button className="w-full bg-[#ff9607] text-black py-3 rounded-xl font-bold">
                    Ver cardápio completo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-950">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-3xl font-bold text-center mb-12">
            Tudo que você <span className="text-[#ff9607]">precisa</span>
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: QrCode, title: 'Cardápio Digital', desc: 'QR Code por mesa. Cliente escaneia e pede pelo celular.' },
              { icon: Smartphone, title: 'Pedidos no WhatsApp', desc: 'Receba e gerencie pedidos direto no WhatsApp do seu negócio.' },
              { icon: Clock, title: 'Controle Total', desc: 'Painel completo com pedidos, clientes, relatórios e muito mais.' },
              { icon: Shield, title: 'Sem Comissão', desc: 'Você paga uma assinatura fixa. Não perca dinheiro com taxas por pedido.' },
              { icon: Zap, title: 'Pronto em Minutos', desc: 'Templates pré-prontos por tipo de estabelecimento. Configure e comece a vender.' },
              { icon: ShoppingBag, title: 'Modo Salão', desc: 'Controle mesas, comandas e garçons. Tudo integrado.' },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-[#ff9607]/50 transition-colors">
                  <div className="w-12 h-12 bg-[#ff9607]/10 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-[#ff9607]" />
                  </div>
                  <h4 className="font-bold text-lg mb-2">{feature.title}</h4>
                  <p className="text-gray-400 text-sm">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-4xl font-black mb-6">
            Pronto para <span className="text-[#ff9607]">revolucionar</span> seu delivery?
          </h3>
          <p className="text-gray-400 text-lg mb-8">
            Junte-se a milhares de estabelecimentos que já escolheram o GB.AI
          </p>
          <Link
            href="/cadastro"
            className="inline-block bg-[#ff9607] text-black px-10 py-4 rounded-2xl font-bold text-lg hover:bg-[#ffaa33] transition-colors"
          >
            Criar minha loja grátis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-gray-500 text-sm">
          © 2024 GB.AI - Todos os direitos reservados
        </div>
      </footer>
    </div>
  );
}
