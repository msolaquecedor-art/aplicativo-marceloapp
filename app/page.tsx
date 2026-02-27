'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  parseISO,
  startOfMonth,
  startOfWeek
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, PlusCircle, Trash2 } from 'lucide-react';
import { serviceTypeColors, serviceTypeLabels, serviceTypes } from '@/app/lib/types';

type Service = {
  id: number;
  nomeCliente: string;
  telefoneCliente: string | null;
  tipoServico: keyof typeof serviceTypeLabels;
  dataServico: string;
  horaInicio: string;
  horaFim: string;
  localServico: string;
  enderecoCompleto: string;
  valorServico: number;
  observacoes: string | null;
  status: 'AGENDADO' | 'CONCLUIDO' | 'CANCELADO';
};

type FormState = {
  nomeCliente: string;
  telefoneCliente: string;
  tipoServico: keyof typeof serviceTypeLabels;
  dataServico: string;
  horaInicio: string;
  horaFim: string;
  localServico: string;
  enderecoCompleto: string;
  valorServico: number;
  observacoes: string;
  status: 'AGENDADO' | 'CONCLUIDO' | 'CANCELADO';
};

const defaultForm = (date: Date): FormState => ({
  nomeCliente: '',
  telefoneCliente: '',
  tipoServico: 'MANUTENCAO',
  dataServico: format(date, 'yyyy-MM-dd'),
  horaInicio: '08:00',
  horaFim: '09:00',
  localServico: '',
  enderecoCompleto: '',
  valorServico: 0,
  observacoes: '',
  status: 'AGENDADO'
});

export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<'dia' | 'semana' | 'mes' | 'ano'>('mes');
  const [filters, setFilters] = useState({ cliente: '', tipoServico: '', data: '', status: '', q: '' });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState<FormState>(defaultForm(selectedDate));
  const queryClient = useQueryClient();

  const query = new URLSearchParams(filters).toString();

  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ['services', query],
    queryFn: async () => {
      const res = await fetch(`/api/services?${query}`);
      return res.json();
    }
  });

  const { data: dashboard } = useQuery<{ servicosHoje: number; valorHoje: number; valorSemana: number; valorMes: number; concluidos: number; agendados: number }>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard');
      return res.json();
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: FormState) => {
      const endpoint = editing ? `/api/services/${editing.id}` : '/api/services';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Erro ao salvar');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setShowForm(false);
      setEditing(null);
      setForm(defaultForm(selectedDate));
      setMessage('Serviço salvo com sucesso.');
    },
    onError: (error: Error) => setMessage(error.message)
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/services/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });


  useEffect(() => {
    const todayCount = services.filter((s) => isSameDay(parseISO(s.dataServico), new Date())).length;
    if (todayCount > 0) {
      setMessage(`🔔 Você tem ${todayCount} serviço(s) programado(s) para hoje.`);
    }
  }, [services]);
  const servicesToday = services.filter((s) => isSameDay(parseISO(s.dataServico), selectedDate));

  const visibleDays = useMemo(() => {
    if (view === 'dia') return [selectedDate];
    if (view === 'semana') {
      return eachDayOfInterval({
        start: startOfWeek(selectedDate, { weekStartsOn: 1 }),
        end: endOfWeek(selectedDate, { weekStartsOn: 1 })
      });
    }
    if (view === 'mes') {
      return eachDayOfInterval({
        start: startOfMonth(selectedDate),
        end: endOfMonth(selectedDate)
      });
    }
    return Array.from({ length: 365 }, (_, i) => addDays(new Date(new Date().getFullYear(), 0, 1), i));
  }, [selectedDate, view]);

  return (
    <main className="mx-auto max-w-7xl p-4 md:p-8">
      <header className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agenda Pro Serviços</h1>
          <p className="text-sm text-slate-600">Organize serviços, ganhos e evite conflitos de agenda.</p>
        </div>
        <button
          className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-white"
          onClick={() => {
            setForm(defaultForm(selectedDate));
            setEditing(null);
            setShowForm(true);
          }}
        >
          <PlusCircle size={18} /> Novo Serviço
        </button>
      </header>

      <section className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-6">
        {[
          ['Serviços Hoje', dashboard?.servicosHoje ?? 0],
          ['Valor do Dia', `R$ ${(dashboard?.valorHoje ?? 0).toFixed(2)}`],
          ['Valor da Semana', `R$ ${(dashboard?.valorSemana ?? 0).toFixed(2)}`],
          ['Valor do Mês', `R$ ${(dashboard?.valorMes ?? 0).toFixed(2)}`],
          ['Concluídos', dashboard?.concluidos ?? 0],
          ['Agendados', dashboard?.agendados ?? 0]
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-card p-4 shadow-sm">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-lg font-semibold">{value}</p>
          </div>
        ))}
      </section>

      <section className="mb-4 rounded-2xl bg-card p-4 shadow-sm">
        <p className="mb-3 text-sm font-semibold">Filtros e busca</p>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-5">
          <input placeholder="Cliente" onChange={(e) => setFilters((f) => ({ ...f, cliente: e.target.value }))} />
          <input placeholder="Busca rápida por nome" onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))} />
          <select onChange={(e) => setFilters((f) => ({ ...f, tipoServico: e.target.value }))}>
            <option value="">Tipo de serviço</option>
            {serviceTypes.map((type) => (
              <option key={type} value={type}>{serviceTypeLabels[type]}</option>
            ))}
          </select>
          <input type="date" onChange={(e) => setFilters((f) => ({ ...f, data: e.target.value }))} />
          <select onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
            <option value="">Status</option>
            <option value="AGENDADO">Agendado</option>
            <option value="CONCLUIDO">Concluído</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Calendário anual</h2>
            <div className="flex gap-2 text-sm">
              {(['dia', 'semana', 'mes', 'ano'] as const).map((v) => (
                <button key={v} onClick={() => setView(v)} className={`rounded-full px-3 py-1 ${view === v ? 'bg-slate-900 text-white' : 'bg-slate-100'}`}>
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-7">
            {visibleDays.map((day) => {
              const dayItems = services.filter((s) => isSameDay(parseISO(s.dataServico), day));
              return (
                <button key={day.toISOString()} onClick={() => setSelectedDate(day)} className={`rounded-xl border p-2 text-left ${isSameDay(day, selectedDate) ? 'border-slate-900' : 'border-slate-200'}`}>
                  <p className="text-xs font-semibold">{format(day, 'dd/MM', { locale: ptBR })}</p>
                  <p className="text-xs text-slate-500">{dayItems.length} serviços</p>
                </button>
              );
            })}
          </div>
        </div>

        <aside className="rounded-2xl bg-card p-4 shadow-sm">
          <h3 className="mb-2 font-semibold">Serviços do dia</h3>
          <p className="mb-3 text-xs text-slate-500">{format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}</p>
          <div className="space-y-2">
            {servicesToday.map((service) => (
              <article key={service.id} className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{service.nomeCliente}</p>
                  <span className={`rounded-full border px-2 py-1 text-xs ${serviceTypeColors[service.tipoServico]}`}>
                    {serviceTypeLabels[service.tipoServico]}
                  </span>
                </div>
                <p className="text-xs text-slate-600">{service.horaInicio} - {service.horaFim} • R$ {service.valorServico.toFixed(2)}</p>
                <div className="mt-2 flex gap-2">
                  <button className="rounded-lg bg-slate-100 p-2" onClick={() => { setEditing(service); setForm({ ...service, telefoneCliente: service.telefoneCliente ?? '', enderecoCompleto: service.enderecoCompleto, observacoes: service.observacoes ?? '', dataServico: service.dataServico.slice(0,10) }); setShowForm(true); }}>
                    <Pencil size={14} />
                  </button>
                  <button className="rounded-lg bg-red-100 p-2 text-red-600" onClick={() => deleteMutation.mutate(service.id)}>
                    <Trash2 size={14} />
                  </button>
                  {service.status !== 'CONCLUIDO' && (
                    <button
                      className="rounded-lg bg-green-100 px-2 text-xs text-green-700"
                      onClick={() => saveMutation.mutate({ ...service, dataServico: service.dataServico.slice(0, 10), telefoneCliente: service.telefoneCliente ?? '', observacoes: service.observacoes ?? '', status: 'CONCLUIDO' })}
                    >
                      Concluir
                    </button>
                  )}
                </div>
              </article>
            ))}
            {servicesToday.length === 0 && <p className="text-sm text-slate-500">Nenhum serviço para a data selecionada.</p>}
          </div>
        </aside>
      </section>

      <section className="mt-4 flex flex-wrap gap-2">
        <a className="rounded-lg bg-slate-200 px-3 py-2 text-sm" href="/api/export/pdf">Exportar agenda em PDF</a>
        <a className="rounded-lg bg-slate-200 px-3 py-2 text-sm" href="/api/export/services">Exportar lista de serviços</a>
        <a className="rounded-lg bg-slate-200 px-3 py-2 text-sm" href="/api/export/monthly">Relatório financeiro mensal</a>
      </section>

      {message && <p className="mt-4 rounded-xl bg-amber-100 p-3 text-sm">{message}</p>}

      {showForm && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 p-4">
          <form
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5"
            onSubmit={(e) => {
              e.preventDefault();
              saveMutation.mutate(form);
            }}
          >
            <h2 className="mb-3 text-xl font-semibold">{editing ? 'Editar serviço' : 'Novo serviço'}</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <input placeholder="Nome do cliente" value={form.nomeCliente} onChange={(e) => setForm({ ...form, nomeCliente: e.target.value })} required />
              <input placeholder="Telefone" value={form.telefoneCliente} onChange={(e) => setForm({ ...form, telefoneCliente: e.target.value })} />
              <select value={form.tipoServico} onChange={(e) => setForm({ ...form, tipoServico: e.target.value as FormState['tipoServico'] })}>
                {serviceTypes.map((type) => <option key={type} value={type}>{serviceTypeLabels[type]}</option>)}
              </select>
              <input type="date" value={form.dataServico} onChange={(e) => setForm({ ...form, dataServico: e.target.value })} required />
              <input type="time" value={form.horaInicio} onChange={(e) => setForm({ ...form, horaInicio: e.target.value })} required />
              <input type="time" value={form.horaFim} onChange={(e) => setForm({ ...form, horaFim: e.target.value })} required />
              <input placeholder="Local" value={form.localServico} onChange={(e) => setForm({ ...form, localServico: e.target.value })} required />
              <input placeholder="Endereço" value={form.enderecoCompleto} onChange={(e) => setForm({ ...form, enderecoCompleto: e.target.value })} required />
              <input type="number" min="0" step="0.01" placeholder="Valor" value={form.valorServico} onChange={(e) => setForm({ ...form, valorServico: Number(e.target.value) })} required />
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as FormState['status'] })}>
                <option value="AGENDADO">Agendado</option>
                <option value="CONCLUIDO">Concluído</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </div>
            <textarea className="mt-3" rows={3} placeholder="Observações" value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="rounded-xl bg-slate-100 px-4 py-2" onClick={() => setShowForm(false)}>Cancelar</button>
              <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-white">Salvar</button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
