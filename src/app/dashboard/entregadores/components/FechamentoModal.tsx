'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, Package, DollarSign, Calendar, CheckCircle2, Clock, AlertCircle, CreditCard, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  order: {
    id: string;
    orderNumber: string | null;
    total: number;
    status: string;
    customer: {
      name: string;
      address: string | null;
      neighborhood: string | null;
    } | null;
  };
}

interface Props {
  open: boolean;
  personId: string | null;
  personName: string;
  personCode: string | null;
  onClose: () => void;
  onUpdate: () => void;
}

export default function FechamentoModal({ open, personId, personName, personCode, onClose, onUpdate }: Props) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const hoje = new Date().toISOString().split('T')[0];

  const load = useCallback(async () => {
    if (!personId) return;
    setLoading(true);
    try {
      const r = await apiFetch(`/api/delivery-people/${personId}`);
      const d = await r.json();
      if (d.success) {
        // Filtra apenas entregas de hoje
        const hojeData = new Date();
        hojeData.setHours(0, 0, 0, 0);
        const filtradas = d.data.filter((a: Assignment) => {
          const data = new Date(a.assignedAt);
          data.setHours(0, 0, 0, 0);
          return data.getTime() === hojeData.getTime() && a.status === 'ENTREGUE';
        });
        setAssignments(filtradas);
      }
    } finally {
      setLoading(false);
    }
  }, [personId]);

  useEffect(() => {
    if (!open || !personId) return;
    load();
  }, [open, personId, load]);

  const totalTaxas = assignments.reduce((s, a) => s + a.fee, 0);
  const totalPendente = assignments.filter(a => !a.paid).reduce((s, a) => s + a.fee, 0);
  const totalPago = assignments.filter(a => a.paid).reduce((s, a) => s + a.fee, 0);

  const handleQuitarTudo = async () => {
    if (!personId) return;
    if (!confirm('Quitar pagamento de todas as entregas de hoje?')) return;
    const res = await apiFetch('/api/delivery-people/assign/pay', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deliveryPersonId: personId, paid: true }),
    });
    if (res.ok) {
      setAssignments(prev => prev.map(a => ({ ...a, paid: true, paidAt: new Date().toISOString() })));
      onUpdate();
    }
  };

  const handleImprimir = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={e => e.stopPropagation()}
            className="bg-[#0f0f14] border border-white/[0.08] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">Fechamento de Expediente</h3>
                <p className="text-xs text-gray-400">
                  {personCode ? `${personCode} - ` : ''}{personName} • {new Date().toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleImprimir}
                  className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                  title="Imprimir"
                >
                  <Printer className="h-4 w-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-3 gap-3 p-4">
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-3 text-center">
                <Package className="h-4 w-4 text-[#ff9607] mx-auto mb-1" />
                <p className="text-xl font-bold">{assignments.length}</p>
                <p className="text-[10px] text-gray-500">Entregas hoje</p>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-3 text-center">
                <DollarSign className="h-4 w-4 text-green-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-green-400">R$ {totalTaxas.toFixed(2)}</p>
                <p className="text-[10px] text-gray-500">Total em taxas</p>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-3 text-center">
                <AlertCircle className="h-4 w-4 text-yellow-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-yellow-400">R$ {totalPendente.toFixed(2)}</p>
                <p className="text-[10px] text-gray-500">Pendente</p>
              </div>
            </div>

            {/* Lista de entregas do dia */}
            <div className="flex-1 overflow-auto px-4 pb-4 space-y-2">
              {loading && (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
                  ))}
                </div>
              )}

              {!loading && assignments.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <CheckCircle2 className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Nenhuma entrega hoje</p>
                </div>
              )}

              {assignments.map((a, idx) => (
                <div key={a.id} className="flex items-center justify-between bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-5">{idx + 1}</span>
                    <div>
                      <p className="text-sm font-medium">
                        Pedido #{a.order.orderNumber || a.order.id.slice(-4)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {a.order.customer?.name}
                        {a.order.customer?.neighborhood && ` • ${a.order.customer.neighborhood}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">R$ {a.fee.toFixed(2)}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${a.paid ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                      {a.paid ? 'Pago' : 'Pendente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            {assignments.length > 0 && (
              <div className="p-4 border-t border-white/[0.06] flex items-center justify-between">
                <div className="text-sm">
                  <span className="text-gray-400">Total a pagar: </span>
                  <span className="font-bold text-white">R$ {totalPendente.toFixed(2)}</span>
                </div>
                {totalPendente > 0 && (
                  <button
                    onClick={handleQuitarTudo}
                    className="flex items-center gap-2 px-4 py-2 bg-[#ff9607] hover:bg-[#ffaa33] text-black rounded-xl text-sm font-bold transition-all"
                  >
                    <CreditCard className="h-4 w-4" /> Quitar Tudo
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
