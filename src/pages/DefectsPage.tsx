import { useState } from 'react';
import Icon from '@/components/ui/icon';

interface InspectionRecord {
  id: string;
  poleId: string;
  poleName: string;
  lineName: string;
  datetime: string;
  lat: number;
  lng: number;
  tiltAngle: string;
  photo: string | null;
  defects: string[];
  notes: string;
}

interface DefectsPageProps {
  inspections: InspectionRecord[];
  onUpdateDefects: (id: string, defects: string[]) => void | Promise<void>;
}

const DEFECT_CATEGORIES = [
  {
    category: 'Конструкция опоры',
    defects: [
      'Трещины в бетоне / металле',
      'Деформация / изгиб ствола',
      'Коррозия металлических элементов',
      'Отсутствие болтовых соединений',
      'Повреждение фундамента',
      'Наклон сверх нормы (>5°)',
      'Разрушение пасынка / приставки',
    ],
  },
  {
    category: 'Провода и арматура',
    defects: [
      'Обрыв провода',
      'Повреждение изоляции провода',
      'Недопустимое провисание провода',
      'Перехлёст проводов',
      'Повреждение грозозащитного троса',
      'Нарушение крепления провода',
    ],
  },
  {
    category: 'Изоляторы',
    defects: [
      'Разрушение изолятора',
      'Загрязнение изолятора',
      'Трещины в изоляторе',
      'Отсутствие изолятора',
      'Ожоговые следы на изоляторе',
    ],
  },
  {
    category: 'Заземление',
    defects: [
      'Отсутствие заземляющего спуска',
      'Обрыв заземляющего спуска',
      'Коррозия заземляющего спуска',
      'Нарушение подземного заземления',
    ],
  },
  {
    category: 'Безопасность и маркировка',
    defects: [
      'Отсутствие плаката-предупреждения',
      'Отсутствие нумерации опоры',
      'Стеснение охранной зоны',
      'Несанкционированное строение в охранной зоне',
      'Отсутствие освещения (для ОРУ)',
    ],
  },
];

export default function DefectsPage({ inspections, onUpdateDefects }: DefectsPageProps) {
  const [selectedInspectionId, setSelectedInspectionId] = useState<string>(
    inspections.length > 0 ? inspections[inspections.length - 1].id : ''
  );
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Конструкция опоры');
  const [saved, setSaved] = useState(false);

  const selectedInspection = inspections.find(i => i.id === selectedInspectionId);
  const [selectedDefects, setSelectedDefects] = useState<string[]>(selectedInspection?.defects ?? []);

  const handleSelectInspection = (id: string) => {
    setSelectedInspectionId(id);
    const insp = inspections.find(i => i.id === id);
    setSelectedDefects(insp?.defects ?? []);
    setSaved(false);
  };

  const toggleDefect = (defect: string) => {
    setSelectedDefects(prev =>
      prev.includes(defect) ? prev.filter(d => d !== defect) : [...prev, defect]
    );
    setSaved(false);
  };

  const handleSave = () => {
    if (!selectedInspectionId) return;
    onUpdateDefects(selectedInspectionId, selectedDefects);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (inspections.length === 0) {
    return (
      <div className="p-6 animate-fade-in flex flex-col items-center justify-center min-h-64">
        <Icon name="AlertTriangle" size={40} className="text-muted-foreground mb-4" />
        <h2 className="font-mono text-lg font-medium text-foreground mb-2">Нет выполненных осмотров</h2>
        <p className="text-muted-foreground text-sm text-center">
          Сначала выполните осмотр опоры в разделе «Осмотр»
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Icon name="AlertTriangle" size={16} className="text-destructive" />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Нарушения</span>
        </div>
        <h2 className="font-mono text-xl font-semibold text-foreground">Выбор дефектов</h2>
      </div>

      <div className="bg-card border border-border rounded p-4 mb-4">
        <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">Осмотр опоры</div>
        <select
          value={selectedInspectionId}
          onChange={(e) => handleSelectInspection(e.target.value)}
          className="w-full bg-background border border-border rounded px-3 py-2 font-mono text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
        >
          {inspections.map(insp => (
            <option key={insp.id} value={insp.id}>
              {insp.poleName} · {insp.datetime}
            </option>
          ))}
        </select>
        {selectedInspection && (
          <div className="mt-2 flex items-center gap-3">
            <span className="font-mono text-xs text-muted-foreground">{selectedInspection.lineName}</span>
            {selectedDefects.length > 0 && (
              <span className="font-mono text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded">
                {selectedDefects.length} дефектов
              </span>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2 mb-4">
        {DEFECT_CATEGORIES.map((cat) => {
          const catCount = cat.defects.filter(d => selectedDefects.includes(d)).length;
          return (
            <div key={cat.category} className="bg-card border border-border rounded overflow-hidden">
              <button
                onClick={() => setExpandedCategory(expandedCategory === cat.category ? null : cat.category)}
                className="w-full flex items-center justify-between p-3 hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Icon
                    name={expandedCategory === cat.category ? 'ChevronDown' : 'ChevronRight'}
                    size={14}
                    className="text-muted-foreground"
                  />
                  <span className="font-sans text-sm text-foreground font-medium">{cat.category}</span>
                </div>
                {catCount > 0 && (
                  <span className="font-mono text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded">
                    {catCount}
                  </span>
                )}
              </button>
              {expandedCategory === cat.category && (
                <div className="border-t border-border">
                  {cat.defects.map((defect) => {
                    const isSelected = selectedDefects.includes(defect);
                    return (
                      <button
                        key={defect}
                        onClick={() => toggleDefect(defect)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors border-b border-border last:border-0 ${
                          isSelected ? 'bg-destructive/10' : 'hover:bg-secondary'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                          isSelected ? 'bg-destructive border-destructive' : 'border-border'
                        }`}>
                          {isSelected && <Icon name="Check" size={10} className="text-white" />}
                        </div>
                        <span className={`font-sans text-xs ${isSelected ? 'text-destructive' : 'text-foreground'}`}>
                          {defect}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedDefects.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/30 rounded p-3 mb-4">
          <div className="font-mono text-xs text-destructive uppercase tracking-widest mb-2">
            Выбрано дефектов: {selectedDefects.length}
          </div>
          <div className="space-y-1">
            {selectedDefects.map(d => (
              <div key={d} className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-destructive shrink-0" />
                <span className="font-sans text-xs text-destructive/80">{d}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={!selectedInspectionId}
        className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded font-sans font-semibold text-sm hover:bg-primary/90 disabled:opacity-40 transition-all"
      >
        <Icon name="Save" size={16} />
        Сохранить дефекты
      </button>

      {saved && (
        <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded mt-3">
          <Icon name="CheckCircle" size={14} className="text-green-400" />
          <span className="text-green-400 text-xs font-sans">Дефекты сохранены</span>
        </div>
      )}
    </div>
  );
}