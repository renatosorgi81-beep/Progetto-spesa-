import { useState } from 'react';
import { Clock, ChefHat, AlertTriangle, CheckCircle, XCircle, Users } from 'lucide-react';
import { RECIPES, PRODUCTS } from '../data/mockData';
import type { Recipe, Product } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  onSelect: (recipe: Recipe) => void;
}

function RecipeCard({ recipe, onSelect }: RecipeCardProps) {
  const pct = Math.round((recipe.availableIngredients / recipe.totalIngredients) * 100);
  const canMake = pct === 100;

  return (
    <button
      onClick={() => onSelect(recipe)}
      className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md hover:border-emerald-200 transition-all text-left"
    >
      {recipe.isUrgent && (
        <div className="bg-amber-500 text-white text-xs font-semibold px-4 py-1.5 flex items-center gap-1">
          <AlertTriangle size={12} /> Usa ingredienti in scadenza
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center text-4xl flex-shrink-0">
            {recipe.imageEmoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-slate-800 leading-tight">{recipe.name}</h3>
              {canMake ? (
                <span className="flex-shrink-0 text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                  Pronto!
                </span>
              ) : (
                <span className="flex-shrink-0 text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                  Quasi
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{recipe.description}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Clock size={11} /> {recipe.time}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <ChefHat size={11} /> {recipe.difficulty}
              </span>
            </div>
          </div>
        </div>

        {/* Ingredient progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-500">Ingredienti disponibili</span>
            <span className={`text-xs font-bold ${canMake ? 'text-emerald-600' : 'text-amber-600'}`}>
              {recipe.availableIngredients}/{recipe.totalIngredients}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${canMake ? 'bg-emerald-500' : 'bg-amber-400'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Missing ingredients */}
        {recipe.missingIngredients.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            <span className="text-[10px] text-slate-400 mr-1 mt-0.5">Manca:</span>
            {recipe.missingIngredients.map(ing => (
              <span key={ing} className="text-[10px] bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-medium">
                {ing}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}

interface CookingViewProps {
  recipe: Recipe;
  requiredProducts: Product[];
  onBack: () => void;
}

function CookingView({ recipe, requiredProducts, onBack }: CookingViewProps) {
  const [step, setStep] = useState(0);
  const totalSteps = recipe.steps.length;
  const isDone = step >= totalSteps;

  if (isDone) {
    return (
      <div className="px-4 py-8 text-center space-y-5">
        <div className="text-7xl">🎉</div>
        <h3 className="text-xl font-bold text-slate-800">Complimenti! Hai cucinato!</h3>
        {recipe.tip && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left">
            <p className="text-amber-700 text-sm font-semibold mb-1">💡 Consiglio dello chef</p>
            <p className="text-amber-600 text-sm">{recipe.tip}</p>
          </div>
        )}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-left">
          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-3">
            Ingredienti usati
          </p>
          <div className="space-y-2">
            {requiredProducts.map(p => (
              <div key={p.id} className="flex items-center gap-2">
                <span>{p.imageEmoji}</span>
                <span className="text-sm text-slate-700">{p.name}</span>
                <span className="ml-auto text-xs text-slate-400">
                  {p.remainingQty} {p.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-sm text-slate-500">
          Ricorda di aggiornare le quantità nella dispensa!
        </p>
        <button
          onClick={onBack}
          className="w-full py-3.5 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-600 transition-colors"
        >
          Torna alla ricetta
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          ← Torna alla ricetta
        </button>
        <span className="text-xs font-semibold text-slate-400">
          Passo {step + 1} di {totalSteps}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
          style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
        />
      </div>

      {/* Recipe title */}
      <div className="flex items-center gap-3">
        <span className="text-3xl">{recipe.imageEmoji}</span>
        <div>
          <p className="font-bold text-slate-800">{recipe.name}</p>
          <p className="text-xs text-slate-400">{recipe.time} · {recipe.difficulty}</p>
        </div>
      </div>

      {/* Step card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-emerald-500 text-white rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0">
            {step + 1}
          </div>
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
            {step === 0 ? 'Iniziamo!' : step === totalSteps - 1 ? 'Ultimo passo!' : `Step ${step + 1}`}
          </p>
        </div>
        <p className="text-slate-800 leading-relaxed text-base">{recipe.steps[step]}</p>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        {step > 0 && (
          <button
            onClick={() => setStep(s => s - 1)}
            className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-semibold rounded-2xl hover:bg-slate-50 transition-colors"
          >
            ← Indietro
          </button>
        )}
        <button
          onClick={() => setStep(s => s + 1)}
          className={`py-3 font-bold rounded-2xl transition-colors ${
            step === 0 ? 'w-full' : 'flex-1'
          } bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95`}
        >
          {step === totalSteps - 1 ? '🎉 Fatto!' : 'Avanti →'}
        </button>
      </div>

      {/* Ingredients reminder */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          Ingredienti per questa ricetta
        </p>
        <div className="flex flex-wrap gap-2">
          {requiredProducts.map(p => (
            <span
              key={p.id}
              className="flex items-center gap-1 bg-white border border-slate-200 rounded-full px-3 py-1"
            >
              <span className="text-sm">{p.imageEmoji}</span>
              <span className="text-xs text-slate-600">{p.name}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

interface RecipeDetailProps {
  recipe: Recipe;
  onBack: () => void;
}

function RecipeDetail({ recipe, onBack }: RecipeDetailProps) {
  const [cooking, setCooking] = useState(false);
  const requiredProducts = PRODUCTS.filter(p => recipe.requiredProductIds.includes(p.id));
  const pct = Math.round((recipe.availableIngredients / recipe.totalIngredients) * 100);

  if (cooking) {
    return <CookingView recipe={recipe} requiredProducts={requiredProducts} onBack={() => setCooking(false)} />;
  }

  return (
    <div>
      {/* Back button */}
      <div className="px-4 pt-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          ← Tutte le ricette
        </button>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 px-4 py-6 mt-3 text-center">
        <div className="text-6xl mb-3">{recipe.imageEmoji}</div>
        <h2 className="text-xl font-bold text-slate-800">{recipe.name}</h2>
        <p className="text-sm text-slate-500 mt-1">{recipe.description}</p>
        <div className="flex items-center justify-center gap-3 mt-3 flex-wrap">
          <span className="flex items-center gap-1 text-xs text-slate-500 bg-white px-3 py-1.5 rounded-full shadow-sm">
            <Clock size={12} /> {recipe.time}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-500 bg-white px-3 py-1.5 rounded-full shadow-sm">
            <ChefHat size={12} /> {recipe.difficulty}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-500 bg-white px-3 py-1.5 rounded-full shadow-sm">
            <Users size={12} /> 2-4 persone
          </span>
        </div>
      </div>

      <div className="px-4 py-5 space-y-5">
        {recipe.isUrgent && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="text-amber-700 font-semibold text-sm flex items-center gap-2">
              <AlertTriangle size={16} /> Ingredienti in scadenza!
            </p>
            <p className="text-amber-600 text-xs mt-1">
              Alcuni ingredienti scadono presto. Preparala oggi per non sprecarli!
            </p>
          </div>
        )}

        {/* Availability */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Ingredienti disponibili
            </p>
            <span className={`text-xs font-bold ${pct === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {recipe.availableIngredients}/{recipe.totalIngredients}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
            <div
              className={`h-full rounded-full ${pct === 100 ? 'bg-emerald-500' : 'bg-amber-400'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="space-y-3">
            {requiredProducts.map(p => (
              <div key={p.id} className="flex items-center gap-3">
                <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                <span className="text-xl">{p.imageEmoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">{p.name}</p>
                  <p className="text-xs text-slate-400">{p.remainingQty} {p.unit} disponibili</p>
                </div>
              </div>
            ))}
            {recipe.missingIngredients.map(ing => (
              <div key={ing} className="flex items-center gap-3">
                <XCircle size={16} className="text-red-400 flex-shrink-0" />
                <span className="text-xl">🛒</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-400">{ing}</p>
                  <p className="text-xs text-red-400">Da acquistare</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {recipe.tags.map(tag => (
            <span key={tag} className="text-xs bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full">
              #{tag}
            </span>
          ))}
        </div>

        {/* CTA */}
        {pct === 100 ? (
          <button
            onClick={() => setCooking(true)}
            className="w-full py-4 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-600 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <ChefHat size={20} /> Inizia a cucinare
          </button>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
            <p className="text-sm font-semibold text-slate-600 mb-1">Mancano {recipe.missingIngredients.length} ingredienti</p>
            <p className="text-xs text-slate-400">Aggiungili alla prossima spesa per preparare questa ricetta.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function Recipes() {
  const [selected, setSelected] = useState<Recipe | null>(null);
  const [filter, setFilter] = useState<'all' | 'ready' | 'urgent'>('all');

  const urgent = RECIPES.filter(r => r.isUrgent);
  const ready = RECIPES.filter(r => r.availableIngredients === r.totalIngredients);

  const filtered = RECIPES.filter(r => {
    if (filter === 'ready') return r.availableIngredients === r.totalIngredients;
    if (filter === 'urgent') return r.isUrgent;
    return true;
  }).sort((a, b) => {
    // Sort: urgent first, then by availability %
    if (a.isUrgent && !b.isUrgent) return -1;
    if (!a.isUrgent && b.isUrgent) return 1;
    const pctA = a.availableIngredients / a.totalIngredients;
    const pctB = b.availableIngredients / b.totalIngredients;
    return pctB - pctA;
  });

  if (selected) {
    return (
      <div className="pb-6">
        <RecipeDetail recipe={selected} onBack={() => setSelected(null)} />
      </div>
    );
  }

  return (
    <div className="px-4 py-5 space-y-5">

      {/* Intro banner */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-4 text-white">
        <div className="flex items-center gap-3">
          <ChefHat size={28} className="text-white/90" />
          <div>
            <p className="font-bold">Basato sulla tua dispensa</p>
            <p className="text-white/80 text-xs mt-0.5">
              {ready.length} ricette complete · {urgent.length} con ingredienti in scadenza
            </p>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {([
          ['all', 'Tutte'],
          ['ready', `Pronte (${ready.length})`],
          ['urgent', `Urgenti (${urgent.length})`],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
              filter === key
                ? 'bg-emerald-500 text-white'
                : 'bg-white text-slate-500 border border-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Recipe list */}
      <div className="space-y-3">
        {filtered.map(recipe => (
          <RecipeCard key={recipe.id} recipe={recipe} onSelect={setSelected} />
        ))}
      </div>

      {/* No waste tip */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
        <p className="text-emerald-700 text-xs font-medium">
          🌱 <strong>Zero sprechi:</strong> pianificando i pasti in base alla dispensa riduci i rifiuti alimentari fino al 40%.
        </p>
      </div>

      <div className="h-2" />
    </div>
  );
}
