'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/stores/auth';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        login(data.data.user, data.data.token);
        router.push('/setup/step-1-dados');
      } else {
        alert(data.message);
      }
    } catch {
      alert('Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-black mb-2">
            <span className="text-[#ff9607]">GB</span>.AI
          </h1>
          <p className="text-gray-400">Acesse sua conta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#ff9607] transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Senha</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#ff9607] transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ff9607] text-black py-4 rounded-xl font-bold text-lg hover:bg-[#ffaa33] transition-colors disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6">
          Não tem conta?{' '}
          <Link href="/cadastro" className="text-[#ff9607] hover:underline font-medium">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}
