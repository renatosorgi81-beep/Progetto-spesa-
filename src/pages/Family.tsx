import React from 'react';
import { UserPlus, ShoppingCart, Package, TrendingDown, Clock } from 'lucide-react';
import { FAMILY_MEMBERS } from '../data/mockData';

function getActivityIcon(description: string): React.ReactNode {
  if (description.startsWith('Ha aggiunto')) return <ShoppingCart size={13} className="text-emerald-500" />;
  if (description.startsWith('Ha aggiornato')) return <Package size={13} className="text-sky-500" />;
  if (description.startsWith('Ha consumato')) return <TrendingDown size={13} className="text-amber-500" />;
  return <Clock size={13} className="text-purple-500" />;
}

function formatActivityDate(dateStr: string) {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Oggi';
  if (diff === 1) return 'Ieri';
  return `${diff}g fa`;
}

export function Family() {
  return (
    <div className="px-4 py-5 space-y-6">

      {/* Header famiglia */}
      <div className="bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl p-5 text-white">
        <h3 className="font-bold text-lg">Famiglia Rossi</h3>
        <p className="text-white/70 text-sm mt-0.5">{FAMILY_MEMBERS.length} membri · Dispensa condivisa</p>
        <div className="flex items-center gap-2 mt-4">
          {FAMILY_MEMBERS.map(m => (
            <div
              key={m.id}
              className="w-11 h-11 rounded-full bg-white/20 border-2 border-white/60 flex items-center justify-center text-xl"
              title={m.name}
            >
              {m.avatar}
            </div>
          ))}
        </div>
      </div>

      {/* Statistiche mensili */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Questo mese</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-emerald-50 rounded-2xl p-3 text-center">
            <p className="text-2xl font-bold text-emerald-600">47</p>
            <p className="text-[10px] text-emerald-600 font-medium mt-0.5 leading-tight">Prodotti usati</p>
          </div>
          <div className="bg-sky-50 rounded-2xl p-3 text-center">
            <p className="text-2xl font-bold text-sky-600">3</p>
            <p className="text-[10px] text-sky-600 font-medium mt-0.5 leading-tight">Spese caricate</p>
          </div>
          <div className="bg-violet-50 rounded-2xl p-3 text-center">
            <p className="text-2xl font-bold text-violet-600">€12</p>
            <p className="text-[10px] text-violet-600 font-medium mt-0.5 leading-tight">Spreco evitato</p>
          </div>
        </div>
      </div>

      {/* Attività recenti — membro + azione in un'unica card */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Attività recenti</h3>
        <div className="space-y-2">
          {FAMILY_MEMBERS.map(member => (
            <div
              key={member.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 p-4"
            >
              <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center text-2xl flex-shrink-0">
                {member.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-slate-800">{member.name}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                    member.role === 'Amministratore'
                      ? 'bg-violet-100 text-violet-700'
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    {member.role}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {getActivityIcon(member.activityDescription)}
                  <p className="text-xs text-slate-500 truncate">{member.activityDescription}</p>
                </div>
              </div>
              <div className="flex flex-col items-end flex-shrink-0 gap-1">
                <span className="text-[10px] text-slate-300">{formatActivityDate(member.lastActivity)}</span>
                <span className="w-2 h-2 bg-emerald-400 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invita membro */}
      <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-5 text-center">
        <div className="text-3xl mb-2">👥</div>
        <p className="font-semibold text-slate-700 text-sm">Aggiungi un membro</p>
        <p className="text-xs text-slate-400 mt-1 mb-3">
          Condividi la gestione della dispensa con tutta la famiglia
        </p>
        <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2">
          <UserPlus size={15} className="text-violet-500" />
          <span className="text-sm text-slate-500 font-medium">Disponibile nella versione completa</span>
        </div>
      </div>

    </div>
  );
}
