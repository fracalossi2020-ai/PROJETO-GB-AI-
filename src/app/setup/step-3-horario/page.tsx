'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, ArrowRight, ArrowLeft } from 'lucide-react';

const days = [
  { label: 'Domingo', value: 0 },
  { label: 'Segunda', value: 1 },
  { label: 'Terça', value: 2 },
  { label: 'Quarta', value: 3 },
  { label: 'Quinta', value: 4 },
  { label: 'Sexta', value: 5 },
  { label: 'Sábado', value: 6 },
];

export default function Step3Horario() {
  const router = useRouter();
  const [sameHours, setSameHours] = useState(true);
  const [schedule, setSchedule] = useState(
    days.map(() => ({ open: true, openTime: '11:00', closeTime: '23:00' }))
  );

  function handleSameHoursChange(checked: boolean) {
    setSameHours(checked);
    if (checked) {
      const first = schedule[0];
      setSchedule(days.map(() => ({ ...first })));
    }
  }

  function updateSchedule(index: number, field: string, value: any) {
    const newSchedule = [...schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setSchedule(newSchedule);
    if (sameHours && (field === 'openTime' || field === 'closeTime')) {
      setSchedule(days.map(() => ({ ...newSchedule[index] })));
    }
  }

  function handleNext() {
    localStorage.setItem('setup_horario', JSON.stringify(schedule));
    router.push('/setup/step-4-cardapio');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-[#ff9607]/10 rounded-2xl flex items-center justify-center">
          <Clock className="h-7 w-7 text-[#ff9607]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Horário de funcionamento</h2>
          <p className="text-gray-400">Defina os dias e horários de operação</p>
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={sameHours}
          onChange={e => handleSameHoursChange(e.target.checked)}
          className="w-5 h-5 accent-[#ff9607]"
        />
        <span className="text-sm">Mesmo horário todos os dias</span>
      </label>

      <div className="space-y-3">
        {days.map((day, i) => (
          <div key={day.value} className="flex items-center gap-4 bg-white/5 rounded-xl p-4">
            <label className="flex items-center gap-3 w-28">
              <input
                type="checkbox"
                checked={schedule[i].open}
                onChange={e => updateSchedule(i, 'open', e.target.checked)}
                className="w-5 h-5 accent-[#ff9607]"
              />
              <span className="text-sm font-medium">{day.label}</span>
            </label>
            {schedule[i].open && (
              <>
                <input
                  type="time"
                  value={schedule[i].openTime}
                  onChange={e => updateSchedule(i, 'openTime', e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                />
                <span className="text-gray-500">até</span>
                <input
                  type="time"
                  value={schedule[i].closeTime}
                  onChange={e => updateSchedule(i, 'closeTime', e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                />
              </>
            )}
            {!schedule[i].open && <span className="text-gray-500 text-sm">Fechado</span>}
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => router.push('/setup/step-2-pagamento')}
          className="flex-1 border border-white/10 py-4 rounded-xl font-bold hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="h-5 w-5" /> Voltar
        </button>
        <button
          onClick={handleNext}
          className="flex-[2] bg-[#ff9607] text-black py-4 rounded-xl font-bold text-lg hover:bg-[#ffaa33] transition-colors flex items-center justify-center gap-2"
        >
          Continuar <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
