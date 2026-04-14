import React from 'react';
import { UserPlus, Settings, ShoppingCart, Package, TrendingDown, Clock } from 'lucide-react';
import { FAMILY_MEMBERS } from '../data/mockData';

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  'Ha aggiunto': <ShoppingCart size={14} className="text-emerald-500" />,
  'Ha aggiornato': <Package size={14} className="text-sky-500" />,
  'Ha consumato': <TrendingDown size={14} className="text-amber-500" />,
  'Ha usato': <Clock size={14} className="text-purple-500" />,
};

function getActivityIcon(description: string) {
  for (const [key, icon] of Object.entries(ACTIVITY_ICONS)) {
    if (description.startsWith(key)) return icon;
  }
  return <Package size={14} className="text-slate-400" />;
}

function formatActivityDate(dateStr: string) {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Oggi';
  if (diff === 1) return 'Ieri';
  return `${diff} giorni fa`;
}

export function Family() {
  return (
    <div className="px-4 py-5 space-y-6">

      {/* Family overview */}
      <div className="bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-lg">Famiglia Rossi</h3>
            <p className="text-white/70 text-sm">{FAMILY_MEMBERS.length} membri · Dispensa condivisa</p>
          </div>
          <button className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors">
            <Settings size={18} className="text-white" />
          </button>
        </div>
        <div className="flex -space-x-2">
          {FAMILY_MEMBERS.map(m => (
            <div
              key={m.id}
              className="w-10 h-10 rounded-full bg-white/20 border-2 border-white flex items-center justify-center text-lg"
              title={m.name}
            >
              {m.avatar}
            </div>
          ))}
          <button className="w-10 h-10 rounded-full bg-white/10 border-2 border-dashed border-white/50 flex items-center justify-center hover:bg-white/20 transition-colors">
            <UserPlus size={14} className="text-white/70" />
          </button>
        </div>
      </div>

      {/* Members list */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Membri</h3>
        <div className="space-y-3">
          {FAMILY_MEMBERS.map(member => (
            <div
              key={member.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl flex-shrink-0">
                {member.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-800">{member.name}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    member.role === 'Amministratore'
                      ? 'bg-violet-100 text-violet-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {member.role}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{member.activityDescription}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[10px] text-slate-400">{formatActivityDate(member.lastActivity)}</p>
                <div className="w-2 h-2 bg-emerald-400 rounded-full ml-auto mt-1" title="Online" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity feed */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Attività recenti</h3>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
          {FAMILY_MEMBERS.map(member => (
            <div key={member.id} className="flex items-center gap-3 p-4">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-lg flex-shrink-0">
                {member.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 mt-0.5">{getActivityIcon(member.activityDescription)}</span>
                  <p className="text-sm text-slate-600 leading-tight">
                    <strong className="text-slate-800">{member.name}</strong>{' '}
                    {member.activityDescription.charAt(0).toLowerCase() + member.activityDescription.slice(1)}
                  </p>
                </div>
              </div>
              <span className="text-xs text-slate-300 flex-shrink-0">{formatActivityDate(member.lastActivity)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Invite CTA */}
      <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-5 text-center">
        <div className="text-3xl mb-2">👥</div>
        <p className="font-semibold text-slate-700 text-sm">Aggiungi un membro</p>
        <p className="text-xs text-slate-400 mt-1 mb-3">
          Condividi la gestione della dispensa con tutta la famiglia
        </p>
        <button className="px-5 py-2.5 bg-violet-500 text-white text-sm font-semibold rounded-xl hover:bg-violet-600 transition-colors inline-flex items-center gap-2">
          <UserPlus size={16} />
          Invita via link
        </button>
      </div>

      {/* Shared stats */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Questo mese</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-emerald-50 rounded-2xl p-3 text-center">
            <p className="text-xl font-bold text-emerald-600">47</p>
            <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Prodotti usati</p>
          </div>
          <div className="bg-sky-50 rounded-2xl p-3 text-center">
            <p className="text-xl font-bold text-sky-600">3</p>
            <p className="text-[10px] text-sky-600 font-medium mt-0.5">Spese caricate</p>
          </div>
          <div className="bg-violet-50 rounded-2xl p-3 text-center">
            <p className="text-xl font-bold text-violet-600">€12</p>
            <p className="text-[10px] text-violet-600 font-medium mt-0.5">Spreco evitato</p>
          </div>
        </div>
      </div>

      <div className="h-2" />
    </div>
  );
}
