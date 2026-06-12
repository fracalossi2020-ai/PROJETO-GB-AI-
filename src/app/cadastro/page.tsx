'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/stores/auth';
import { ArrowLeft, Eye, EyeOff, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { GridPattern, GlowOrb } from '@/components/GridPattern';
import { apiFetch } from '@/lib/api-client';

async function redirectAfterAuth(router: ReturnType<typeof useRouter>) {
  try {
    const res = await apiFetch('/api/stores');
    const data = await res.json();
    if (data.data?.length > 0) {
      router.push('/dashboard');
    } else {
      router.push('/planos');
    }
  } catch {
    router.push('/planos');
  }
}

export default function CadastroPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const { login } = useAuth();
  const router = useRouter();

  // Se já tem token, redireciona automaticamente
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      redirectAfterAuth(router);
    } else {
      setChecking(false);
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password }),
      });
      const data = await res.json();
      if (data.success) {
        login(data.data.user, data.data.token);
        await redirectAfterAuth(router);
      } else {
        alert(data.message);
      }
    } catch {
      alert('Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center relative overflow-hidden">
        <GridPattern className="opacity-40" />
        <div className="relative z-10 text-center">
          <Loader2 className="h-8 w-8 text-[#ff9607] animate-spin mx-auto mb-4" />
          <p className="text-white/40 text-sm">Verificando sessão...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4 relative overflow-hidden">
      <GridPattern className="opacity-40" />
      <GlowOrb color="magenta" className="w-[600px] h-[600px] -top-60 -left-60 opacity-20" />
      <GlowOrb color="cyan" className="w-[500px] h-[500px] -bottom-40 -right-40 opacity-15" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-8 transition-colors text-sm">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>

        <div className="backdrop-blur-2xl bg-white/[0.03] border border-white/[0.08] rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ff9607] to-[#ff0080] flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-6 w-6 text-black" />
            </div>
            <h1 className="text-2xl font-black">
              <span className="bg-gradient-to-r from-[#ff9607] to-[#ff0080] bg-clip-text text-transparent">GB</span>.AI
            </h1>
            <p className="text-white/40 text-sm mt-2">Crie sua conta gratuita</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Nome completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="João Silva"
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#ff9607]/50 focus:shadow-[0_0_15px_rgba(255,150,7,0.15)] transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#ff9607]/50 focus:shadow-[0_0_15px_rgba(255,150,7,0.15)] transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Telefone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 99999-9999"
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#ff9607]/50 focus:shadow-[0_0_15px_rgba(255,150,7,0.15)] transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#ff9607]/50 focus:shadow-[0_0_15px_rgba(255,150,7,0.15)] transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#ff9607] to-[#ffaa33] text-black py-3.5 rounded-xl font-bold text-base hover:shadow-[0_0_25px_rgba(255,150,7,0.4)] transition-all disabled:opacity-50 mt-2"
            >
              {loading ? 'Criando conta...' : 'Criar conta grátis'}
            </button>
          </form>

          <p className="text-center text-white/30 mt-6 text-sm">
            Já tem conta?{' '}
            <Link href="/login" className="text-[#ff9607] hover:text-[#ffaa33] font-medium transition-colors">
              Entrar
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
