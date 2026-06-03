'use client';

import { useEffect, useState, useMemo } from 'react';
import { Search, User, Phone, MapPin, ShoppingBag, Star } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  orders?: any[];
}

export default function ClientesPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/stores')
      .then(r => r.json())
      .then(d => {
        if (d.data?.[0]?.customers) {
          setCustomers(d.data[0].customers);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.toLowerCase();
    return customers.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.phone?.includes(q)
    );
  }, [customers, search]);

  const totalSpent = (customer: Customer) => {
    return customer.orders?.reduce((s, o) => s + (o.total || 0), 0) || 0;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 bg-white/5 rounded animate-pulse" />
        <div className="h-96 bg-white/5 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Clientes</h1>
          <p className="text-gray-400 text-sm">{customers.length} cliente{customers.length !== 1 ? 's' : ''} cadastrado{customers.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nome ou telefone..."
          className="w-full bg-zinc-900 border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#ff9607]"
        />
      </div>

      <div className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-white/5 text-xs text-gray-500 font-medium">
          <div className="col-span-4">Cliente</div>
          <div className="col-span-3">Contato</div>
          <div className="col-span-2 text-center">Pedidos</div>
          <div className="col-span-2 text-right">Total Gasto</div>
          <div className="col-span-1 text-center">Avaliação</div>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500 text-sm">Nenhum cliente encontrado</div>
        )}
        {filtered.map(customer => (
          <div key={customer.id} className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-white/5 hover:bg-white/[0.02] transition-colors items-center">
            <div className="col-span-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-[#ff9607]/10 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-[#ff9607]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{customer.name}</p>
                {customer.address && (
                  <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                    <MapPin className="h-3 w-3" />{customer.address}
                  </p>
                )}
              </div>
            </div>
            <div className="col-span-3">
              <p className="text-sm text-gray-400 flex items-center gap-1">
                <Phone className="h-3 w-3" />{customer.phone}
              </p>
              {customer.email && <p className="text-xs text-gray-500">{customer.email}</p>}
            </div>
            <div className="col-span-2 text-center">
              <span className="text-sm font-medium flex items-center justify-center gap-1">
                <ShoppingBag className="h-3 w-3 text-gray-500" />
                {customer.orders?.length || 0}
              </span>
            </div>
            <div className="col-span-2 text-right">
              <p className="text-sm font-bold">R$ {totalSpent(customer).toFixed(2)}</p>
            </div>
            <div className="col-span-1 text-center">
              <div className="flex items-center justify-center gap-0.5">
                <Star className="h-3 w-3 text-[#ff9607] fill-[#ff9607]" />
                <span className="text-xs">4.8</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
