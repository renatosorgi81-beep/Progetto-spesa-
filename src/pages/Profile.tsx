import React from 'react';
import { Bell, Shield, HelpCircle, LogOut, ChevronRight, Smartphone, Star, Gift, Leaf } from 'lucide-react';

interface SettingRowProps {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  value?: string;
  danger?: boolean;
  onClick?: () => void;
}

function SettingRow({ icon, label, sublabel, value, danger, onClick }: SettingRowProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors text-left"
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
        danger ? 'bg-red-50' : 'bg-slate-100'
      }`}>
        <span className={danger ? 'text-red-500' : 'text-slate-500'}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${danger ? 'text-red-500' : 'text-slate-700'}`}>{label}</p>
        {sublabel && <p className="text-xs text-slate-400 mt-0.5">{sublabel}</p>}
      </div>
      {value ? (
        <span className="text-xs text-slate-400 flex-shrink-0">{value}</span>
      ) : (
        <ChevronRight size={16} className={`flex-shrink-0 ${danger ? 'text-red-300' : 'text-slate-300'}`} />
      )}
    </button>
  );
}

export function Profile() {
  return (
    <div className="px-4 py-5 space-y-5">

      {/* User card */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl">
            👨‍💼
          </div>
          <div>
            <h2 className="text-xl font-bold">Marco Rossi</h2>
            <p className="text-white/70 text-sm">marco.rossi@email.com</p>
            <div className="flex items-center gap-1 mt-1">
              <Star size={12} className="text-yellow-300 fill-yellow-300" />
              <span className="text-xs text-white/80">Piano Premium</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="text-center">
            <p className="text-2xl font-bold">20</p>
            <p className="text-white/60 text-[10px]">Prodotti</p>
          </div>
          <div className="text-center border-x border-white/20">
            <p className="text-2xl font-bold">3</p>
            <p className="text-white/60 text-[10px]">Spese</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">4</p>
            <p className="text-white/60 text-[10px]">Famiglia</p>
          </div>
        </div>
      </div>

      {/* Sustainability score */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
            <Leaf size={22} className="text-emerald-600" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-emerald-800">Punteggio Eco</p>
            <p className="text-xs text-emerald-600 mt-0.5">Hai evitato €38 di spreco alimentare questo mese</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-emerald-600">87</p>
            <p className="text-xs text-emerald-500">/100</p>
          </div>
        </div>
        <div className="mt-3 w-full h-2 bg-emerald-200 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full" style={{ width: '87%' }} />
        </div>
      </div>

      {/* Supermercato collegato */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-50">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Supermercato collegato</p>
        </div>
        <div className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
            <Smartphone size={18} className="text-sky-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-700 text-sm">Esselunga</p>
            <p className="text-xs text-slate-400">Carta fedeltà · #4521-8823</p>
          </div>
          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg font-medium">
            Attivo ✓
          </span>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-50">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Impostazioni</p>
        </div>
        <div className="divide-y divide-slate-50">
          <SettingRow
            icon={<Bell size={18} />}
            label="Notifiche scadenze"
            sublabel="Avvisi 3 giorni prima"
            value="Attive"
          />
          <SettingRow
            icon={<Shield size={18} />}
            label="Privacy e dati"
            sublabel="Gestisci i tuoi dati personali"
          />
          <SettingRow
            icon={<Gift size={18} />}
            label="Piano SmartPantry Premium"
            sublabel="Attivo fino al 14/04/2027"
            value="Premium"
          />
          <SettingRow
            icon={<HelpCircle size={18} />}
            label="Supporto e FAQ"
            sublabel="Hai domande? Siamo qui"
          />
        </div>
      </div>

      {/* Logout */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <SettingRow
          icon={<LogOut size={18} />}
          label="Esci dall'account"
          danger
        />
      </div>

      {/* Version */}
      <p className="text-center text-xs text-slate-300">SmartPantry v1.0.0 · MVP Demo</p>

      <div className="h-2" />
    </div>
  );
}
