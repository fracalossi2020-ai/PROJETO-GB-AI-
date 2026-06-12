'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, Package, Calendar, DollarSign, MapPin, User, Phone, CheckCircle2, Clock, XCircle, CreditCard, AlertCircle } from 'lucide-react';
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
    type: string;
    customer: {
      name: string;
      phone: string | null;
      address: string | null;
      neighborhood: string | null;
    } | null;
  };
}

interface Props {
  open: boolean;
  personId: string | null;
  personName: string;
  onClose: () => void;
  onUpdate: () => void;
}

export default function HistoricoDrawer({ open, personId, personName, onClose, onUpdate }: Props) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!personId) return;
    setLoading(true);
    try {
      const r = await apiFetch(`/api/delivery-people/${personId}`);
      const d = await r.json();
      if (d.success) setAssignments(d.data);
    } finally {
      setLoading(false);
    }
  }, [personId]);

  useEffect(() => {
    if (!open || !personId) return;
    load();
  }, [open, personId, load]);

  const togglePay = async (assignment: Assignment) => {
    const res = await apiFetch('/api/delivery-people/assign/pay', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: assignment.id, paid: !assignment.paid }),
    });
    if (res.ok) {
      setAssignments(prev => prev.map(a =>
        a.id === assignment.id ? { ...a, paid: !a.paid, paidAt: !a.paid ? new Date().toISOString() : null } : a
      ));
      onUpdate();
    }
  };

  const quitarTudo = async () => {
    if (!personId) return;
    if (!confirm('Quitar pagamento de todas as entregas não pagas?')) return;
    const res = await apiFetch('/api/delivery-people/assign/pay', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deliveryPersonId: personId, paid: true }),
    });
    if (res.ok) {
      setAssignments(prev => prev.map(a =>
        a.status === 'ENTREGUE' && !a.paid ? { ...a, paid: true, paidAt: new Date().toISOString() } : a
      ));
      onUpdate();
    }
  };

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    PENDENTE: { label: 'Pendente', color: 'text-yellow-400 bg-yellow-400/10', icon: Clock },
    EM_ANDAMENTO: { label: 'Em andamento', color: 'text-blue-400 bg-blue-400/10', icon: Clock },
    ENTREGUE: { label: 'Entregue', color: 'text-green-400 bg-green-400/10', icon: CheckCircle2 },
    CANCELADO: { label: 'Cancelado', color: 'text-red-400 bg-red-400/10', icon: XCircle },
  };

  const totalTaxas = assignments.filter(a => a.status === 'ENTREGUE').reduce((s, a) => s + a.fee, 0);
  const totalPendente = assignments.filter(a => a.status === 'ENTREGUE' && !a.paid).reduce((s, a) => s + a.fee, 0);
  const entregues = assignments.filter(a => a.status === 'ENTREGUE').length;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md bg-[#0f0f14] border-l border-white/[0.08] h-full flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Histórico de Entregas</h3>
                <p className="text-xs text-gray-400">{personName}</p>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 gap-3 p-4">
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Package className="h-3.5 w-3.5 text-[#ff9607]" />
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">Total</span>
                </div>
                <p className="text-xl font-bold">{entregues}</p>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <DollarSign className="h-3.5 w-3.5 text-green-400" />
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">Taxas</span>
                </div>
                <p className="text-xl font-bold text-green-400">R$ {totalTaxas.toFixed(2)}</p>
              </div>
            </div>

            {/* Alerta de pendente */}
            {totalPendente > 0 && (
              <div className="mx-4 mb-3 flex items-center justify-between bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-400" />
                  <span className="text-xs text-yellow-400">R$ {totalPendente.toFixed(2)} pendente</span>
                </div>
                <button
                  onClick={quitarTudo}
                  className="flex items-center gap-1 px-2.5 py-1 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 rounded-lg text-[10px] font-medium transition-all"
                >
                  <CreditCard className="h-3 w-3" /> Quitar tudo
                </button>
              </div>
            )}

            {/* Lista */}
            <div className="flex-1 overflow-auto px-4 pb-4 space-y-3">
              {loading && (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-28 bg-white/5 rounded-xl animate-pulse" />
                  ))}
                </div>
              )}

              {!loading && assignments.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Package className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Nenhuma entrega registrada</p>
                </div>
              )}

              {assignments.map(a => {
                const cfg = statusConfig[a.status] || statusConfig.PENDENTE;
                const Icon = cfg.icon;
                const isDelivered = a.status === 'ENTREGUE';
                return (
                  <div key={a.id} className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-bold">Pedido #{a.order.orderNumber || a.order.id.slice(-4)}</p>
                        <p className="text-xs text-gray-400">R$ {a.order.total.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium ${cfg.color}`}>
                          <Icon className="h-3 w-3" /> {cfg.label}
                        </span>
                        {isDelivered && (
                          <button
                            onClick={() => togglePay(a)}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium transition-all ${
                              a.paid
                                ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                                : 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20'
                            }`}
                            title={a.paid ? 'Marcar como pendente' : 'Marcar como pago'}
                          >
                            {a.paid ? (
                              <><CheckCircle2 className="h-3 w-3" /> Pago</>
                            ) : (
                              <><AlertCircle className="h-3 w-3" /> Pendente</>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {a.order.customer && (
                      <div className="space-y-1 mb-2">
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <User className="h-3 w-3" />
                          {a.order.customer.name}
                        </div>
                        {a.order.customer.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <Phone className="h-3 w-3" />
                            {a.order.customer.phone}
                          </div>
                        )}
                        {(a.order.customer.address || a.order.customer.neighborhood) && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <MapPin className="h-3 w-3" />
                            {a.order.customer.address}
                            {a.order.customer.neighborhood && ` - ${a.order.customer.neighborhood}`}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <div className="flex items-center gap-1 text-[10px] text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {new Date(a.assignedAt).toLocaleDateString('pt-BR')}
                      </div>
                      <span className={`text-xs font-medium ${a.paid ? 'text-green-400' : 'text-gray-400'}`}>
                        R$ {a.fee.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
