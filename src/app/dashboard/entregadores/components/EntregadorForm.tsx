'use client';

import { useState, useEffect } from 'react';
import { X, Car, MapPin } from 'lucide-react';
import MotoIcon from '@/components/MotoIcon';
import { motion, AnimatePresence } from 'framer-motion';

interface DeliveryPerson {
  id: string;
  name: string;
  phone: string | null;
  vehicle: string;
  isActive: boolean;
}

interface Props {
  open: boolean;
  editing: DeliveryPerson | null;
  onClose: () => void;
  onSave: () => void;
}

export default function EntregadorForm({ open, editing, onClose, onSave }: Props) {
  const [form, setForm] = useState({ name: '', phone: '', vehicle: 'MOTO' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
        phone: editing.phone || '',
        vehicle: editing.vehicle,
      });
    } else {
      setForm({ name: '', phone: '', vehicle: 'MOTO' });
    }
  }, [editing, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);

    const url = '/api/delivery-people';
    const method = editing ? 'PUT' : 'POST';
    const body = editing ? { ...form, id: editing.id } : form;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        onSave();
        onClose();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={e => e.stopPropagation()}
            className="bg-[#0f0f14] border border-white/[0.08] rounded-2xl w-full max-w-lg p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">
                {editing ? 'Editar Entregador' : 'Novo Entregador'}
              </h3>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Nome completo</label>
                <input
                  type="text"
                  placeholder="Ex: João Silva"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff9607] transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Telefone</label>
                <input
                  type="text"
                  placeholder="(11) 99999-9999"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff9607] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Veículo</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'MOTO', icon: MotoIcon, label: 'Moto' },
                    { key: 'BIKE', icon: MapPin, label: 'Bike' },
                    { key: 'CARRO', icon: Car, label: 'Carro' },
                  ].map(v => (
                    <button
                      key={v.key}
                      type="button"
                      onClick={() => setForm({ ...form, vehicle: v.key })}
                      className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs transition-all ${
                        form.vehicle === v.key
                          ? 'border-[#ff9607] bg-[#ff9607]/10 text-[#ff9607]'
                          : 'border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <v.icon className="h-4 w-4" />
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-[#ff9607] hover:bg-[#ffaa33] text-black rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-400 rounded-xl text-sm transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
