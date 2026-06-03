'use client';

import { useEffect, useState } from 'react';

export default function CardapioAdminPage() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/stores')
      .then(r => r.json())
      .then(d => {
        if (d.data?.[0]) setProducts(d.data[0].products || []);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cardápio</h1>
          <p className="text-gray-400">Gerencie seus produtos e categorias</p>
        </div>
        <button className="bg-[#ff9607] text-black px-6 py-3 rounded-xl font-bold hover:bg-[#ffaa33] transition-colors">
          + Novo produto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product.id} className="bg-gray-900 border border-white/5 rounded-2xl overflow-hidden">
            <div className="aspect-video bg-white/5">
              {product.image ? (
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-600">Sem imagem</div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold">{product.name}</h3>
                  <p className="text-sm text-gray-500">{product.category?.name}</p>
                </div>
                <span className="text-[#ff9607] font-bold">R$ {product.price.toFixed(2)}</span>
              </div>
              <p className="text-sm text-gray-400 mt-2 line-clamp-2">{product.description}</p>
              <div className="flex gap-2 mt-3">
                {product.isFeatured && <span className="text-xs bg-[#ff9607]/10 text-[#ff9607] px-2 py-1 rounded-full">Destaque</span>}
                {product.isPromotion && <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded-full">Promoção</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
