import { useState } from 'react';
import type { ProductStatus } from './types';

export function daysUntilExpiry(expiryDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  return Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function computeStatus(expiryDate: string): ProductStatus {
  const days = daysUntilExpiry(expiryDate);
  if (days < 0) return 'scaduto';
  if (days <= 3) return 'in_scadenza';
  return 'ok';
}

export function defaultExpiry(daysFromNow = 7): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

export function guessEmoji(n: string): string {
  const map: [string[], string][] = [
    [['latte', 'panna', 'crema'], '🥛'],
    [['formaggio', 'grana', 'parmigian', 'pecorino', 'mozzarella', 'brie', 'asiago', 'emmental', 'cheddar'], '🧀'],
    [['uova', 'uovo'], '🥚'],
    [['pollo', 'tacchino', 'petto di pollo'], '🍗'],
    [['carne', 'bistecca', 'manzo', 'maiale', 'vitello', 'hamburger', 'arrosto', 'filetto'], '🥩'],
    [['pesce', 'salmone', 'merluzzo', 'branzino', 'orata', 'trota', 'tonno'], '🐟'],
    [['gamber', 'polpo', 'vongole', 'cozze'], '🦐'],
    [['pomodoro', 'passata', 'pelat'], '🍅'],
    [['broccoli', 'cavolfiore', 'spinaci', 'insalata', 'rucola', 'lattuga', 'zucchina', 'melanzana', 'peperone', 'verdura', 'finocchio', 'sedano', 'carciofo'], '🥦'],
    [['carota'], '🥕'],
    [['patata'], '🥔'],
    [['cipolla'], '🧅'],
    [['aglio'], '🧄'],
    [['fungo', 'champignon'], '🍄'],
    [['limone', 'lime'], '🍋'],
    [['mela'], '🍎'],
    [['banana'], '🍌'],
    [['fragola'], '🍓'],
    [['uva'], '🍇'],
    [['arancia'], '🍊'],
    [['pesca', 'pesche'], '🍑'],
    [['ananas'], '🍍'],
    [['kiwi'], '🥝'],
    [['pasta', 'spaghetti', 'penne', 'rigatoni', 'fusilli', 'farfalle', 'linguine', 'tagliatelle', 'lasagne'], '🍝'],
    [['riso', 'risotto'], '🍚'],
    [['pane', 'panino', 'focaccia', 'ciabatta', 'baguette', 'grissini'], '🍞'],
    [['burro'], '🧈'],
    [['yogurt'], '🫙'],
    [['olio', 'oliva'], '🫒'],
    [['aceto', 'sale', 'pepe', 'origano', 'basilico', 'spezie', 'rosmarino'], '🧂'],
    [['acqua'], '💧'],
    [['birra'], '🍺'],
    [['vino'], '🍷'],
    [['succo', 'aranciata', 'limonata', 'chinotto'], '🧃'],
    [['caffè', 'caffe', 'espresso', 'cialde', 'capsule', 'nespresso'], '☕'],
    [['cioccolato', 'cacao', 'nutella'], '🍫'],
    [['biscotti', 'biscotto', 'wafer', 'cracker'], '🍪'],
    [['gelato'], '🍨'],
    [['torta', 'crostata', 'pandoro', 'panettone', 'colomba'], '🎂'],
    [['prosciutto', 'salame', 'mortadella', 'bresaola', 'speck', 'pancetta'], '🥓'],
    [['surgelat', 'congelat'], '🧊'],
    [['ketchup', 'maionese', 'salsa', 'senape'], '🫙'],
    [['detersivo', 'sapone', 'shampoo', 'dentifricio', 'bagnoschiuma'], '🧴'],
    [['carta', 'scottex', 'fazzoletti', 'tovaglioli'], '🧻'],
    [['zucchero', 'sugar'], '🍚'],
    [['farina', 'flour'], '🌾'],
    [['pizza'], '🍕'],
  ];
  for (const [kws, emoji] of map) {
    if (kws.some(k => n.includes(k))) return emoji;
  }
  return '🛒';
}

export function useLocalStorage<T>(key: string, initial: T): [T, (val: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : initial;
    } catch {
      return initial;
    }
  });

  function set(val: T | ((prev: T) => T)) {
    const next = typeof val === 'function' ? (val as (p: T) => T)(state) : val;
    setState(next);
    try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* ignore */ }
  }

  return [state, set];
}
