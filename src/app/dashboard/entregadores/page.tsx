'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Bike, Plus, Pencil, Trash2, Car, Phone, CheckCircle2, Clock,
  Package, DollarSign, MapPin, Search, TrendingUp, Users, Activity,
  ChevronRight, History, AlertCircle, CheckCircle, XCircle, CreditCard,
  ClipboardCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EntregadorForm from './components/EntregadorForm';
import HistoricoDrawer from './components/HistoricoDrawer';
import FechamentoModal from './components/FechamentoModal';
import { useCelebration } from './components/ConfettiCelebration';
import Link from 'next/link';
import { apiFetch } from '@/lib/api-client';

interface Assignment {
  id: string;
  status: string;
  fee: number;
  paid: boolean;
  paidAt: string | null;
  assignedAt: string;
  deliveredAt: string | null;
  orderId: string;
}

interface DeliveryPerson {
  id: string;
  code: string | null;
  name: string;
  phone: string | null;
  vehicle: string;
  isActive: boolean;
  assignments: Assignment[];
}

type Period = 'hoje' | '7d' | '30d' | 'mes' | 'tudo';

const periodLabels: Record<Period, string> = {
  hoje: 'Hoje',
  '7d': '7 dias',
  '30d': '30 dias',
  mes: 'Este mês',
  tudo: 'Tudo',
};

function isWithinPeriod(dateStr: string, period: Period): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (period) {
    case 'hoje':
      return date >= today;
    case '7d':
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return date >= weekAgo;
    case '30d':
      const monthAgo = new Date(today);
      monthAgo.setDate(monthAgo.getDate() - 30);
      return date >= monthAgo;
    case 'mes':
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    case 'tudo':
      return true;
  }
}

export default function EntregadoresPage() {
  const [people, setPeople] = useState<DeliveryPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState<Period>('30d');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<DeliveryPerson | null>(null);
  const [historicoId, setHistoricoId] = useState<string | null>(null);
  const [historicoName, setHistoricoName] = useState('');
  const [fechamentoId, setFechamentoId] = useState<string | null>(null);
  const [fechamentoName, setFechamentoName] = useState('');
  const [fechamentoCode, setFechamentoCode] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'todos' | 'ativos' | 'inativos'>('todos');
  const celebrate = useCelebration();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await apiFetch('/api/delivery-people');
      const d = await r.json();
      if (d.success) setPeople(d.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredPeople = useMemo(() => {
    return people.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.phone?.includes(search) ?? false) ||
        (p.code?.toLowerCase().includes(search.toLowerCase()) ?? false);
      const matchesStatus = filterStatus === 'todos' ? true :
        filterStatus === 'ativos' ? p.isActive : !p.isActive;
      return matchesSearch && matchesStatus;
    });
  }, [people, search, filterStatus]);

  const stats = useMemo(() => {
    const activePeople = people.filter(p => p.isActive).length;
    const totalAssignments = people.flatMap(p => p.assignments);
    const periodAssignments = totalAssignments.filter(a => isWithinPeriod(a.assignedAt, period));
    const entregues = periodAssignments.filter(a => a.status === 'ENTREGUE');
    const emAndamento = periodAssignments.filter(a => a.status === 'PENDENTE' || a.status === 'EM_ANDAMENTO');
    const totalTaxas = entregues.reduce((s, a) => s + a.fee, 0);
    const pendentesPagamento = entregues.filter(a => !a.paid).reduce((s, a) => s + a.fee, 0);

    return {
      activePeople,
      totalEntregas: entregues.length,
      emAndamento: emAndamento.length,
      totalTaxas,
      pendentesPagamento,
    };
  }, [people, period]);

  const entregasEmAndamento = useMemo(() => {
    const list = people.flatMap(p =>
      p.assignments
        .filter(a => a.status === 'PENDENTE' || a.status === 'EM_ANDAMENTO')
        .map(a => ({ ...a, personName: p.name, personCode: p.code }))
    );
    return list;
  }, [people]);

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este entregador?')) return;
    await apiFetch(`/api/delivery-people?id=${id}`, { method: 'DELETE' });
    setPeople(prev => prev.filter(p => p.id !== id));
  };

  const handleToggleActive = async (person: DeliveryPerson) => {
    await apiFetch('/api/delivery-people', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...person, isActive: !person.isActive }),
    });
    setPeople(prev => prev.map(p => p.id === person.id ? { ...p, isActive: !p.isActive } : p));
  };

  const handleConfirmarEntrega = async (assignmentId: string) => {
    if (!confirm('Marcar esta entrega como entregue?')) return;
    const res = await apiFetch('/api/delivery-people/assign', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: assignmentId, status: 'ENTREGUE' }),
    });
    if (res.ok) {
      celebrate();
      setPeople(prev => prev.map(p => ({
        ...p,
        assignments: p.assignments.map(a =>
          a.id === assignmentId ? { ...a, status: 'ENTREGUE', deliveredAt: new Date().toISOString() } : a
        ),
      })));
    }
  };

  const handleQuitarTudo = async (personId: string) => {
    if (!confirm('Quitar pagamento de todas as entregas não pagas deste entregador?')) return;
    const res = await apiFetch('/api/delivery-people/assign/pay', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deliveryPersonId: personId, paid: true }),
    });
    if (res.ok) {
      setPeople(prev => prev.map(p => p.id === personId ? {
        ...p,
        assignments: p.assignments.map(a =>
          a.status === 'ENTREGUE' && !a.paid ? { ...a, paid: true, paidAt: new Date().toISOString() } : a
        ),
      } : p));
    }
  };

  const openHistorico = (person: DeliveryPerson) => {
    setHistoricoId(person.id);
    setHistoricoName(`${person.code ? `${person.code} - ` : ''}${person.name}`);
  };

  const openFechamento = (person: DeliveryPerson) => {
    setFechamentoId(person.id);
    setFechamentoName(person.name);
    setFechamentoCode(person.code);
  };

  const vehicleIcon = (v: string) => {
    if (v === 'MOTO') return <Bike className="h-3.5 w-3.5" />;
    if (v === 'CARRO') return <Car className="h-3.5 w-3.5" />;
    return <MapPin className="h-3.5 w-3.5" />;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Entregadores</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Gerencie entregadores, acompanhe entregas e controle taxas
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white/[0.03] rounded-lg p-1 border border-white/5">
            {(Object.keys(periodLabels) as Period[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  period === p ? 'bg-[#ff9607] text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                {periodLabels[p]}
              </button>
            ))}
          </div>
          <Link
            href="/dashboard/entregadores/zonas"
            className="flex items-center gap-2 px-4 py-2 bg-white/[0.05] hover:bg-white/10 border border-white/10 text-white rounded-xl text-sm font-medium transition-all"
          >
            <MapPin className="h-4 w-4" /> Zonas de Entrega
          </Link>
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#ff9607] hover:bg-[#ffaa33] text-black rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(255,150,7,0.2)]"
          >
            <Plus className="h-4 w-4" /> Novo Entregador
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-[#ff9607]/10"><Users className="h-4 w-4 text-[#ff9607]" /></div>
            <span className="text-gray-400 text-xs">Ativos</span>
          </div>
          <p className="text-2xl font-bold">{stats.activePeople}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-green-500/10"><Package className="h-4 w-4 text-green-400" /></div>
            <span className="text-gray-400 text-xs">Entregas {periodLabels[period]}</span>
          </div>
          <p className="text-2xl font-bold">{stats.totalEntregas}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10"><Activity className="h-4 w-4 text-blue-400" /></div>
            <span className="text-gray-400 text-xs">Em Andamento</span>
          </div>
          <p className="text-2xl font-bold">{stats.emAndamento}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-green-500/10"><DollarSign className="h-4 w-4 text-green-400" /></div>
            <span className="text-gray-400 text-xs">Taxas {periodLabels[period]}</span>
          </div>
          <p className="text-2xl font-bold text-green-400">R$ {stats.totalTaxas.toFixed(2)}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-yellow-500/10"><AlertCircle className="h-4 w-4 text-yellow-400" /></div>
            <span className="text-gray-400 text-xs">Pendentes</span>
          </div>
          <p className="text-2xl font-bold text-yellow-400">R$ {stats.pendentesPagamento.toFixed(2)}</p>
        </motion.div>
      </div>

      {/* Entregas em Andamento - Comprovante sem foto */}
      {entregasEmAndamento.length > 0 && (
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardCheck className="h-5 w-5 text-[#ff9607]" />
            <h2 className="font-bold">Entregas em Andamento</h2>
            <span className="text-xs text-gray-500">({entregasEmAndamento.length})</span>
          </div>
          <div className="space-y-2">
            {entregasEmAndamento.map(a => (
              <div key={a.id} className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${a.status === 'EM_ANDAMENTO' ? 'bg-blue-400 animate-pulse' : 'bg-yellow-400'}`} />
                  <div>
                    <p className="text-sm font-medium">
                      {a.personCode ? `${a.personCode} - ` : ''}{a.personName}
                    </p>
                    <p className="text-xs text-gray-500">Pedido #{a.orderId.slice(-4)} • R$ {a.fee.toFixed(2)}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleConfirmarEntrega(a.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg text-xs font-medium transition-all"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  Confirmar Entrega
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por nome, telefone ou código..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#ff9607] transition-colors"
          />
        </div>
        <div className="flex bg-white/[0.03] rounded-xl p-1 border border-white/5">
          {([
            { key: 'todos', label: 'Todos' },
            { key: 'ativos', label: 'Ativos' },
            { key: 'inativos', label: 'Inativos' },
          ] as const).map(f => (
            <button
              key={f.key}
              onClick={() => setFilterStatus(f.key)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterStatus === f.key ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-56 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredPeople.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Bike className="h-14 w-14 mx-auto mb-4 opacity-20" />
          <p className="text-sm">{search || filterStatus !== 'todos' ? 'Nenhum entregador encontrado' : 'Nenhum entregador cadastrado'}</p>
          <p className="text-xs text-gray-600 mt-1">{search || filterStatus !== 'todos' ? 'Tente ajustar os filtros' : 'Clique em "Novo Entregador" para começar'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredPeople.map((person, idx) => {
              const periodAssignments = person.assignments.filter(a => isWithinPeriod(a.assignedAt, period));
              const entregues = periodAssignments.filter(a => a.status === 'ENTREGUE');
              const pendentes = periodAssignments.filter(a => a.status === 'PENDENTE' || a.status === 'EM_ANDAMENTO');
              const canceladas = periodAssignments.filter(a => a.status === 'CANCELADO');
              const taxas = entregues.reduce((s, a) => s + a.fee, 0);
              const taxasPendentes = entregues.filter(a => !a.paid).reduce((s, a) => s + a.fee, 0);
              const totalHistorico = person.assignments.length;

              return (
                <motion.div
                  key={person.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.03 }}
                  className={`group bg-white/[0.03] border rounded-2xl backdrop-blur-sm p-5 hover:bg-white/[0.05] transition-all ${
                    person.isActive ? 'border-white/[0.08]' : 'border-red-500/20 opacity-70'
                  }`}
                >
                  {/* Header do card */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ff9607] to-[#ff0080] flex items-center justify-center text-black font-bold text-lg relative">
                        {person.name.charAt(0).toUpperCase()}
                        {person.code && (
                          <span className="absolute -bottom-1 -right-1 bg-[#0f0f14] border border-white/10 text-[9px] px-1.5 py-0.5 rounded-full text-white font-medium">
                            {person.code}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{person.name}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                          <Phone className="h-3 w-3" />
                          {person.phone || 'Sem telefone'}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setEditing(person); setShowForm(true); }}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                        title="Editar"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(person.id)}
                        className="p-1.5 rounded-lg hover:bg-red-400/10 text-gray-400 hover:text-red-400 transition-colors"
                        title="Remover"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="px-2.5 py-1 rounded-lg bg-white/5 text-[11px] text-gray-300 flex items-center gap-1.5">
                      {vehicleIcon(person.vehicle)}
                      {person.vehicle}
                    </span>
                    <button
                      onClick={() => handleToggleActive(person)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                        person.isActive
                          ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                          : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                      }`}
                    >
                      {person.isActive ? 'Ativo' : 'Inativo'}
                    </button>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="text-center bg-white/[0.02] rounded-xl p-2 border border-white/5">
                      <p className="text-lg font-bold">{entregues.length}</p>
                      <p className="text-[10px] text-gray-500">Entregues</p>
                    </div>
                    <div className="text-center bg-white/[0.02] rounded-xl p-2 border border-white/5">
                      <p className="text-lg font-bold text-blue-400">{pendentes.length}</p>
                      <p className="text-[10px] text-gray-500">Pendentes</p>
                    </div>
                    <div className="text-center bg-white/[0.02] rounded-xl p-2 border border-white/5">
                      <p className="text-lg font-bold text-red-400">{canceladas.length}</p>
                      <p className="text-[10px] text-gray-500">Canceladas</p>
                    </div>
                    <div className="text-center bg-white/[0.02] rounded-xl p-2 border border-white/5">
                      <p className="text-lg font-bold text-green-400">R$ {taxas.toFixed(0)}</p>
                      <p className="text-[10px] text-gray-500">Taxas</p>
                    </div>
                  </div>

                  {/* Pagamento pendente */}
                  {taxasPendentes > 0 && (
                    <div className="flex items-center justify-between bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-2.5 mb-3">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-3.5 w-3.5 text-yellow-400" />
                        <span className="text-xs text-yellow-400">R$ {taxasPendentes.toFixed(2)} pendente</span>
                      </div>
                      <button
                        onClick={() => handleQuitarTudo(person.id)}
                        className="flex items-center gap-1 px-2.5 py-1 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 rounded-lg text-[10px] font-medium transition-all"
                      >
                        <CreditCard className="h-3 w-3" /> Quitar
                      </button>
                    </div>
                  )}

                  {/* Footer actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openFechamento(person)}
                        className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-white transition-colors"
                      >
                        <ClipboardCheck className="h-3 w-3" />
                        Fechamento
                      </button>
                      <div className="flex items-center gap-1 text-[10px] text-gray-500">
                        <History className="h-3 w-3" />
                        {totalHistorico} entrega{totalHistorico !== 1 ? 's' : ''} no total
                      </div>
                    </div>
                    <button
                      onClick={() => openHistorico(person)}
                      className="flex items-center gap-1 text-xs text-[#ff9607] hover:text-[#ffaa33] font-medium transition-colors"
                    >
                      Ver histórico <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Modals */}
      <EntregadorForm
        open={showForm}
        editing={editing}
        onClose={() => { setShowForm(false); setEditing(null); }}
        onSave={load}
      />

      <HistoricoDrawer
        open={!!historicoId}
        personId={historicoId}
        personName={historicoName}
        onClose={() => setHistoricoId(null)}
        onUpdate={load}
      />

      <FechamentoModal
        open={!!fechamentoId}
        personId={fechamentoId}
        personName={fechamentoName}
        personCode={fechamentoCode}
        onClose={() => setFechamentoId(null)}
        onUpdate={load}
      />
    </div>
  );
}
