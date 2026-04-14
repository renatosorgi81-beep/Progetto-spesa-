import { useState } from 'react';
import { Leaf, Flame, ChevronRight } from 'lucide-react';
import { CONSUMPTION_HISTORY, MONTHLY_IMPACT, IMPACT_BADGES, FAMILY_MEMBERS } from '../data/mockData';
import type { PageName } from '../types';

interface ImpactProps {
  onNavigate: (page: PageName) => void;
}

// ─── Mini bar chart ───────────────────────────────────────────────────────────
function BarChart() {
  const max = Math.max(...MONTHLY_IMPACT.map(m => m.consumed));
  return (
    <div className="flex items-end justify-between gap-2 h-24 mt-2">
      {MONTHLY_IMPACT.map((m, i) => {
        const isLast = i === MONTHLY_IMPACT.length - 1;
        const consumedPct = Math.round((m.consumed / max) * 100);
        const wastedPct = Math.round((m.wasted / m.consumed) * consumedPct);
        return (
          <div key={m.shortMonth} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex flex-col justify-end" style={{ height: '80px' }}>
              {/* Stack: wasted on top (red), consumed below (green) */}
              <div className="w-full rounded-t-lg overflow-hidden flex flex-col justify-end" style={{ height: `${consumedPct}%` }}>
                <div
                  className="w-full bg-red-300 rounded-t-md"
                  style={{ height: `${Math.max((wastedPct / consumedPct) * 100, 0)}%` }}
                />
                <div className={`w-full flex-1 ${isLast ? 'bg-emerald-500' : 'bg-emerald-300'} rounded-b-md`} />
              </div>
            </div>
            <span className={`text-[10px] font-semibold ${isLast ? 'text-emerald-600' : 'text-slate-400'}`}>
              {m.shortMonth}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Category breakdown ───────────────────────────────────────────────────────
const CATEGORY_LABELS: Record<string, string> = {
  latticini: '🥛 Latticini', carne: '🥩 Carne', pesce: '🐟 Pesce',
  verdura: '🥦 Verdura', frutta: '🍎 Frutta', pane: '🍞 Pane',
  pasta_riso: '🍝 Pasta & Riso', conserve: '🥫 Conserve', bevande: '🥤 Bevande',
  dolci: '🍪 Dolci', surgelati: '❄️ Surgelati', salumi: '🥓 Salumi',
  condimenti: '🫙 Condimenti',
};

export function Impact({ onNavigate }: ImpactProps) {
  const [activeTab, setActiveTab] = useState<'mese' | 'settimana'>('mese');

  // ── Calcoli aggregati ────────────────────────────────────────────────────
  const thisMonth = MONTHLY_IMPACT[MONTHLY_IMPACT.length - 1];
  const lastMonth = MONTHLY_IMPACT[MONTHLY_IMPACT.length - 2];

  const totalKgSaved = MONTHLY_IMPACT.reduce((s, m) => s + m.kgSaved, 0);
  const totalEurosSaved = MONTHLY_IMPACT.reduce((s, m) => s + m.eurosSaved, 0);
  const totalCo2 = MONTHLY_IMPACT.reduce((s, m) => s + m.co2Kg, 0);

  // Italian average: ~27kg/year waste per person → ~2.25kg/month per person
  // Family of 4 = ~9kg/month typically wasted
  const italianAvgMonthly = 9.0;
  const ourWasteThisMonth = 0.8; // kg
  const savedVsAverage = italianAvgMonthly - ourWasteThisMonth;
  const percentBetterThanAvg = Math.round((savedVsAverage / italianAvgMonthly) * 100);

  // Weekly stats
  const weekData = CONSUMPTION_HISTORY.filter(c => {
    const d = new Date(c.date);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    return d >= cutoff;
  });
  const weekConsumed = weekData.filter(c => !c.wasWasted).length;
  const weekWasted = weekData.filter(c => c.wasWasted).length;
  const weekEurosSaved = weekData.filter(c => !c.wasWasted).reduce((s, c) => s + c.valueEuros, 0);

  // Category breakdown
  const categoryMap: Record<string, { consumed: number; wasted: number; euros: number }> = {};
  CONSUMPTION_HISTORY.forEach(c => {
    if (!categoryMap[c.category]) categoryMap[c.category] = { consumed: 0, wasted: 0, euros: 0 };
    if (c.wasWasted) categoryMap[c.category].wasted++;
    else { categoryMap[c.category].consumed++; categoryMap[c.category].euros += c.valueEuros; }
  });
  const topCategories = Object.entries(categoryMap)
    .sort((a, b) => (b[1].consumed + b[1].wasted) - (a[1].consumed + a[1].wasted))
    .slice(0, 4);

  // Member stats
  const memberConsumption: Record<string, number> = {};
  CONSUMPTION_HISTORY.filter(c => !c.wasWasted).forEach(c => {
    memberConsumption[c.consumedByMember] = (memberConsumption[c.consumedByMember] || 0) + 1;
  });

  const earnedBadges = IMPACT_BADGES.filter(b => b.earned);
  const improvingTrend = thisMonth.wasted < lastMonth.wasted;

  return (
    <div className="pb-6 space-y-5">

      {/* ── Hero banner ──────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 px-4 pt-5 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-emerald-200 text-xs font-medium uppercase tracking-widest">Il tuo impatto reale</p>
            <h2 className="text-white text-2xl font-bold mt-0.5">Famiglia Rossi</h2>
          </div>
          <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center">
            <Leaf size={24} className="text-white" />
          </div>
        </div>

        {/* 3 KPI principali */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/15 rounded-2xl p-3 text-center backdrop-blur-sm">
            <p className="text-2xl font-bold text-white">{totalKgSaved.toFixed(1)}</p>
            <p className="text-emerald-200 text-[10px] font-medium mt-0.5 leading-tight">kg di cibo<br/>non sprecato</p>
          </div>
          <div className="bg-white/15 rounded-2xl p-3 text-center backdrop-blur-sm">
            <p className="text-2xl font-bold text-white">€{totalEurosSaved.toFixed(0)}</p>
            <p className="text-emerald-200 text-[10px] font-medium mt-0.5 leading-tight">risparmiati<br/>in 4 mesi</p>
          </div>
          <div className="bg-white/15 rounded-2xl p-3 text-center backdrop-blur-sm">
            <p className="text-2xl font-bold text-white">{totalCo2.toFixed(0)}</p>
            <p className="text-emerald-200 text-[10px] font-medium mt-0.5 leading-tight">kg CO₂<br/>evitata</p>
          </div>
        </div>

        {/* Vs media italiana */}
        <div className="mt-4 bg-white/10 rounded-2xl p-3 flex items-center gap-3">
          <span className="text-2xl">🇮🇹</span>
          <div className="flex-1">
            <p className="text-white text-xs font-semibold">
              Sprechi il {percentBetterThanAvg}% in meno della media italiana
            </p>
            <p className="text-emerald-200 text-[10px] mt-0.5">
              Media famiglie italiane: ~9kg/mese · Voi: ~0.8kg/mese
            </p>
          </div>
          <div className="w-10 h-10 bg-emerald-400/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-lg">🏅</span>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-5">

        {/* ── Tab mese / settimana ─────────────────────────────────────────── */}
        <div className="flex gap-2">
          {(['mese', 'settimana'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === tab
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white border border-slate-200 text-slate-500'
              }`}
            >
              {tab === 'mese' ? 'Questo mese' : 'Questa settimana'}
            </button>
          ))}
        </div>

        {/* ── Stats periodo selezionato ─────────────────────────────────────── */}
        {activeTab === 'mese' ? (
          <div className="grid grid-cols-2 gap-3">
            <StatBox
              icon="✅" value={`${thisMonth.consumed}`}
              label="Prodotti consumati" color="emerald"
              sub={`+${thisMonth.consumed - lastMonth.consumed} vs mese scorso`}
            />
            <StatBox
              icon="🗑️" value={`${thisMonth.wasted}`}
              label="Prodotti sprecati" color={thisMonth.wasted > 0 ? 'red' : 'emerald'}
              sub={improvingTrend ? '↓ in miglioramento' : ''}
            />
            <StatBox
              icon="💶" value={`€${thisMonth.eurosSaved.toFixed(2)}`}
              label="Valore risparmiato" color="blue"
              sub="cibo non buttato"
            />
            <StatBox
              icon="🌿" value={`${thisMonth.co2Kg}kg`}
              label="CO₂ evitata" color="teal"
              sub="equiv. 0.8 alberi/mese"
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <StatBox icon="✅" value={`${weekConsumed}`} label="Prodotti consumati" color="emerald" />
            <StatBox icon="🗑️" value={`${weekWasted}`} label="Sprecati" color={weekWasted > 0 ? 'red' : 'emerald'} />
            <StatBox icon="💶" value={`€${weekEurosSaved.toFixed(2)}`} label="Valore consumato" color="blue" />
            <StatBox icon="👥" value={`${Object.keys(memberConsumption).length}`} label="Membri attivi" color="violet" />
          </div>
        )}

        {/* ── Trend 4 mesi ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Trend 4 mesi</p>
            <div className="flex items-center gap-3 text-[10px] text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Consumato</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-300 inline-block" /> Sprecato</span>
            </div>
          </div>
          <BarChart />
          {improvingTrend && (
            <div className="mt-3 bg-emerald-50 rounded-xl p-2.5 flex items-center gap-2">
              <span className="text-lg">📉</span>
              <p className="text-xs text-emerald-700 font-medium">
                Gli sprechi stanno diminuendo mese su mese. Continua così!
              </p>
            </div>
          )}
        </div>

        {/* ── Consumo per categoria ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Cosa consumi di più</p>
          <div className="space-y-3">
            {topCategories.map(([cat, stats]) => {
              const total = stats.consumed + stats.wasted;
              const pct = Math.round((stats.consumed / total) * 100);
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-700">{CATEGORY_LABELS[cat] || cat}</span>
                    <div className="flex items-center gap-2">
                      {stats.wasted > 0 && (
                        <span className="text-[10px] text-red-400">{stats.wasted} sprecati</span>
                      )}
                      <span className="text-xs font-semibold text-slate-600">{stats.consumed} usati</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                    <div className="h-full bg-emerald-500 rounded-l-full transition-all" style={{ width: `${pct}%` }} />
                    {stats.wasted > 0 && (
                      <div className="h-full bg-red-300" style={{ width: `${100 - pct}%` }} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Consumo per membro ───────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Chi consuma di più</p>
          <div className="space-y-3">
            {FAMILY_MEMBERS.map(member => {
              const count = memberConsumption[member.name] || 0;
              const maxCount = Math.max(...Object.values(memberConsumption));
              const pct = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
              return (
                <div key={member.id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-xl flex-shrink-0">
                    {member.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700">{member.name}</span>
                      <span className="text-xs text-slate-400">{count} prodotti</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-violet-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Ultime attività (consumo timeline) ───────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Ultimi consumi</p>
          <div className="space-y-3">
            {CONSUMPTION_HISTORY.slice(0, 6).map(c => {
              const d = new Date(c.date);
              const today = new Date();
              const diff = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
              const dateLabel = diff === 0 ? 'Oggi' : diff === 1 ? 'Ieri' : `${diff}g fa`;
              return (
                <div key={c.id} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${
                    c.wasWasted ? 'bg-red-50' : 'bg-emerald-50'
                  }`}>
                    {c.productEmoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{c.productName}</p>
                    <p className="text-xs text-slate-400">
                      {c.consumedByMember} · {c.qtyConsumed} {c.unit}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      c.wasWasted
                        ? 'bg-red-100 text-red-500'
                        : 'bg-emerald-100 text-emerald-600'
                    }`}>
                      {c.wasWasted ? 'Sprecato' : 'Usato'}
                    </span>
                    <p className="text-[10px] text-slate-300 mt-0.5">{dateLabel}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Badge ─────────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Badge conquistati</p>
            <span className="text-xs text-slate-400">{earnedBadges.length}/{IMPACT_BADGES.length}</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {IMPACT_BADGES.map(badge => (
              <div
                key={badge.id}
                className={`rounded-2xl p-3 text-center ${
                  badge.earned
                    ? 'bg-emerald-50 border border-emerald-100'
                    : 'bg-slate-50 border border-slate-100 opacity-50'
                }`}
              >
                <p className="text-3xl mb-1">{badge.icon}</p>
                <p className={`text-[10px] font-bold leading-tight ${badge.earned ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {badge.title}
                </p>
                {badge.earned && badge.earnedDate && (
                  <p className="text-[9px] text-emerald-400 mt-0.5">
                    {new Date(badge.earnedDate).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── CO2 equivalenze ───────────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Flame size={18} className="text-yellow-300" />
            <p className="font-bold text-sm">Il tuo impatto ambientale</p>
          </div>
          <p className="text-white/80 text-xs mb-4">
            Hai evitato <strong className="text-white">{totalCo2.toFixed(0)}kg di CO₂</strong> — equivale a:
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/15 rounded-xl p-3 text-center">
              <p className="text-xl">🌳</p>
              <p className="text-white font-bold text-sm mt-1">{Math.round(totalCo2 / 21)}</p>
              <p className="text-white/70 text-[10px]">alberi piantati</p>
            </div>
            <div className="bg-white/15 rounded-xl p-3 text-center">
              <p className="text-xl">🚗</p>
              <p className="text-white font-bold text-sm mt-1">{Math.round(totalCo2 / 0.21)}km</p>
              <p className="text-white/70 text-[10px]">auto in meno</p>
            </div>
            <div className="bg-white/15 rounded-xl p-3 text-center">
              <p className="text-xl">💡</p>
              <p className="text-white font-bold text-sm mt-1">{Math.round(totalCo2 * 1.4)}h</p>
              <p className="text-white/70 text-[10px]">TV risparmiate</p>
            </div>
          </div>
        </div>

        {/* ── CTA verso dispensa ───────────────────────────────────────────── */}
        <button
          onClick={() => onNavigate('pantry')}
          className="w-full bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between hover:border-emerald-200 hover:bg-emerald-50 active:scale-95 transition-all"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">📦</span>
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-700">Gestisci la dispensa</p>
              <p className="text-xs text-slate-400">Aggiorna le quantità per dati precisi</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-400" />
        </button>

      </div>
    </div>
  );
}

// ─── Componente stat box ──────────────────────────────────────────────────────
type StatColor = 'emerald' | 'red' | 'blue' | 'teal' | 'violet';

const COLOR_MAP: Record<StatColor, string> = {
  emerald: 'bg-emerald-50 text-emerald-700',
  red: 'bg-red-50 text-red-600',
  blue: 'bg-sky-50 text-sky-700',
  teal: 'bg-teal-50 text-teal-700',
  violet: 'bg-violet-50 text-violet-700',
};

function StatBox({ icon, value, label, color, sub }: {
  icon: string; value: string; label: string; color: StatColor; sub?: string;
}) {
  return (
    <div className={`${COLOR_MAP[color]} rounded-2xl p-4`}>
      <p className="text-xl mb-1">{icon}</p>
      <p className="text-2xl font-bold leading-none">{value}</p>
      <p className="text-xs font-medium mt-1 opacity-80">{label}</p>
      {sub && <p className="text-[10px] opacity-60 mt-0.5">{sub}</p>}
    </div>
  );
}
