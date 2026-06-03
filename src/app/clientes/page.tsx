'use client';

import { useEffect, useState } from 'react';

export default function ClientesPage() {
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/stores')
      .then(r => r.json())
      .then(d => {
        if (d.data?.[0]) setCustomers(d.data[0].customers || []);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Clientes</h1>
        <p className="text-gray-400">Base de clientes do seu estabelecimento</p>
      </div>

      <div className="bg-gray-900 border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Nome</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Telefone</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Endereço</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-medium">{c.name}</td>
                <td className="px-6 py-4 text-gray-400">{c.phone}</td>
                <td className="px-6 py-4 text-gray-400">{c.address || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
