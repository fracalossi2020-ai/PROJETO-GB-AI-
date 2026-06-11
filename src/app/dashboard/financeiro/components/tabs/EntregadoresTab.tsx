'use client';

import { useEffect, useState } from 'react';
import { Truck, Plus, Pencil, Trash2, Car, Phone, CheckCircle, Clock, Package, DollarSign, MapPin } from 'lucide-react';
import MotoIcon from '@/components/MotoIcon';
import ExportarPdf from '../ExportarPdf';

interface DeliveryPerson {
  id: string;
  name: string;
  phone: string | null;
  vehicle: string;
  isActive: boolean;
  feePerDelivery: number;
  assignments: { id: string; status: string; fee: number; assignedAt: string; deliveredAt: string | null; orderId: string }[];
}

export default function EntregadoresTab() {
  const [people, setPeople] = useState<DeliveryPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<DeliveryPerson | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', vehicle: 'MOTO', feePerDelivery: 0 });

  useEffect(() => {
    fetch('/api/delivery-people')
      .then(r => r.json())
      .then(d => {
        if (d.success) setPeople(d.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    const url = '/api/delivery-people';
    const method = editing ? 'PUT' : 'POST';
    const body = editing ? { ...form, id: editing.id } : form;

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.success) {
      setShowForm(false);
      setEditing(null);
      setForm({ name: '', phone: '', vehicle: 'MOTO', feePerDelivery: 0 });
      // recarregar
      const r2 = await fetch('/api/delivery-people');
      const d2 = await r2.json();
      if (d2.success) setPeople(d2.data);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este entregador?')) return;
    await fetch(`/api/delivery-people?id=${id}`, { method: 'DELETE' });
    setPeople(prev => prev.filter(p => p.id !== id));
  };

  const handleToggleActive = async (person: DeliveryPerson) => {
    await fetch('/api/delivery-people', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...person, isActive: !person.isActive }),
    });
    setPeople(prev => prev.map(p => p.id === person.id ? { ...p, isActive: !p.isActive } : p));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 bg-white/5 rounded animate-pulse" />
        <div className="h-96 bg-white/5 rounded-2xl animate-pulse" />
      </div>
    );
  }

  const totalEntregas = people.reduce((s, p) => s + p.assignments.filter(a => a.status === 'ENTREGUE').length, 0);
  const totalPendentes = people.reduce((s, p) => s + p.assignments.filter(a => a.status === 'PENDENTE' || a.status === 'EM_ANDAMENTO').length, 0);
  const totalTaxas = people.reduce((s, p) => s + p.assignments.reduce((ss, a) => ss + a.fee, 0), 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Entregadores</h2>
          <p className="text-gray-400 text-xs">Controle de entregadores, taxas e entregas</p>
        </div>
        <div className="flex gap-2">
          <ExportarPdf targetId="entregadores-tab-content" fileName="relatorio-entregadores" label="Baixar PDF" />
          <button
            onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', phone: '', vehicle: 'MOTO', feePerDelivery: 0 }); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#ff9607] hover:bg-[#ffaa33] text-black rounded-lg text-sm font-bold transition-all"
          >
            <Plus className="h-4 w-4" /> Novo Entregador
          </button>
        </div>
      </div>

      <div id="entregadores-tab-content" className="space-y-5">
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
            <div className="flex items-center gap-2 mb-1">
              <Truck className="h-4 w-4 text-[#ff9607]" />
              <span className="text-gray-400 text-xs">Total de Entregas</span>
            </div>
            <p className="text-2xl font-bold">{totalEntregas}</p>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-blue-400" />
              <span className="text-gray-400 text-xs">Em Andamento</span>
            </div>
            <p className="text-2xl font-bold">{totalPendentes}</p>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-green-400" />
              <span className="text-gray-400 text-xs">Total em Taxas</span>
            </div>
            <p className="text-2xl font-bold text-green-400">R$ {totalTaxas.toFixed(2)}</p>
          </div>
        </div>

        {/* Formulário */}
        {showForm && (
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl backdrop-blur-sm p-5">
            <h3 className="font-bold text-sm mb-4">{editing ? 'Editar Entregador' : 'Novo Entregador'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Nome"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#ff9607]"
              />
              <input
                type="text"
                placeholder="Telefone"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#ff9607]"
              />
              <select
                value={form.vehicle}
                onChange={e => setForm({ ...form, vehicle: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#ff9607]"
              >
                <option value="MOTO">Moto</option>
                <option value="BIKE">Bike</option>
                <option value="CARRO">Carro</option>
              </select>
              <input
                type="number"
                placeholder="Taxa por entrega (R$)"
                value={form.feePerDelivery || ''}
                onChange={e => setForm({ ...form, feePerDelivery: Number(e.target.value) })}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#ff9607]"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleSave} className="px-4 py-2 bg-[#ff9607] text-black rounded-lg text-sm font-bold">Salvar</button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-white/5 text-gray-400 rounded-lg text-sm">Cancelar</button>
            </div>
          </div>
        )}

        {/* Lista de entregadores */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {people.map(person => {
            const entregues = person.assignments.filter(a => a.status === 'ENTREGUE').length;
            const pendentes = person.assignments.filter(a => a.status === 'PENDENTE' || a.status === 'EM_ANDAMENTO').length;
            const taxas = person.assignments.reduce((s, a) => s + a.fee, 0);
            return (
              <div key={person.id} className={`bg-white/[0.03] border rounded-2xl backdrop-blur-sm p-5 ${person.isActive ? 'border-white/[0.08]' : 'border-red-500/20 opacity-60'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff9607] to-[#ff0080] flex items-center justify-center text-black font-bold">
                      {person.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{person.name}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Phone className="h-3 w-3" /> {person.phone || 'Sem telefone'}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setEditing(person); setForm({ name: person.name, phone: person.phone || '', vehicle: person.vehicle, feePerDelivery: person.feePerDelivery }); setShowForm(true); }}
                      className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(person.id)}
                      className="p-1.5 rounded-lg hover:bg-red-400/10 text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 rounded-md bg-white/5 text-xs text-gray-400 flex items-center gap-1">
                    {person.vehicle === 'MOTO' ? <MotoIcon className="h-3 w-3" /> : person.vehicle === 'BIKE' ? <MapPin className="h-3 w-3" /> : <Car className="h-3 w-3" />}
                    {person.vehicle}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white/5 text-xs text-gray-400">
                    R$ {person.feePerDelivery.toFixed(2)} / entrega
                  </span>
                  <button
                    onClick={() => handleToggleActive(person)}
                    className={`px-2 py-0.5 rounded-md text-xs font-medium ${person.isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}
                  >
                    {person.isActive ? 'Ativo' : 'Inativo'}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/5">
                  <div className="text-center">
                    <p className="text-lg font-bold">{entregues}</p>
                    <p className="text-[10px] text-gray-500">Entregues</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{pendentes}</p>
                    <p className="text-[10px] text-gray-500">Pendentes</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-400">R$ {taxas.toFixed(0)}</p>
                    <p className="text-[10px] text-gray-500">Taxas</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {people.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Truck className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Nenhum entregador cadastrado</p>
            <p className="text-xs text-gray-600 mt-1">Clique em "Novo Entregador" para começar</p>
          </div>
        )}
      </div>
    </div>
  );
}
