import { useState, useRef } from 'react';
import Icon from '@/components/ui/icon';

interface Pole {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
}

interface LineTemplate {
  lineName: string;
  voltage: string;
  poles: Pole[];
}

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

interface InspectionPageProps {
  template: LineTemplate | null;
  selectedPole: Pole | null;
  onSaveInspection: (record: InspectionRecord) => void;
  onNavigate: (page: string) => void;
}

export default function InspectionPage({ template, selectedPole, onSaveInspection, onNavigate }: InspectionPageProps) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [tiltAngle, setTiltAngle] = useState('0.0');
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);
  const [currentPole, setCurrentPole] = useState<Pole | null>(selectedPole);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const now = new Date();
  const datetime = now.toLocaleString('ru-RU');

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!currentPole || !template) return;
    const record: InspectionRecord = {
      id: Date.now().toString(),
      poleId: currentPole.id,
      poleName: currentPole.name,
      lineName: template.lineName,
      datetime,
      lat: currentPole.lat,
      lng: currentPole.lng,
      tiltAngle,
      photo,
      defects: [],
      notes,
    };
    onSaveInspection(record);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!template) {
    return (
      <div className="p-6 animate-fade-in flex flex-col items-center justify-center min-h-64">
        <Icon name="Camera" size={40} className="text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-sm text-center mb-4">Загрузите шаблон линии для начала осмотра</p>
        <button onClick={() => onNavigate('template')} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-sans font-medium hover:bg-primary/90 transition-colors">
          <Icon name="Upload" size={14} />Загрузить шаблон
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Icon name="Camera" size={16} className="text-primary" />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Фотофиксация</span>
        </div>
        <h2 className="font-mono text-xl font-semibold text-foreground">Осмотр опоры</h2>
      </div>

      <div className="bg-card border border-border rounded p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Выбор опоры</span>
        </div>
        <select
          value={currentPole?.id ?? ''}
          onChange={(e) => {
            const pole = template.poles.find(p => p.id === e.target.value) ?? null;
            setCurrentPole(pole);
            setPhoto(null);
            setNotes('');
            setSaved(false);
          }}
          className="w-full bg-background border border-border rounded px-3 py-2 font-mono text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
        >
          <option value="">— выберите опору —</option>
          {template.poles.map(p => (
            <option key={p.id} value={p.id}>{p.name} · {p.type}</option>
          ))}
        </select>
      </div>

      {currentPole && (
        <>
          <div className="bg-card border border-border rounded p-4 mb-4">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <div className="font-mono text-xs text-muted-foreground mb-1">Наименование опоры</div>
                <div className="font-mono text-sm text-foreground">{currentPole.name}</div>
              </div>
              <div>
                <div className="font-mono text-xs text-muted-foreground mb-1">Тип</div>
                <div className="font-mono text-sm text-foreground">{currentPole.type}</div>
              </div>
              <div>
                <div className="font-mono text-xs text-muted-foreground mb-1">Линия</div>
                <div className="font-mono text-xs text-foreground">{template.lineName}</div>
              </div>
              <div>
                <div className="font-mono text-xs text-muted-foreground mb-1">Напряжение</div>
                <div className="font-mono text-sm text-foreground">{template.voltage} кВ</div>
              </div>
              <div>
                <div className="font-mono text-xs text-muted-foreground mb-1">Широта</div>
                <div className="font-mono text-xs text-accent">{currentPole.lat.toFixed(6)}</div>
              </div>
              <div>
                <div className="font-mono text-xs text-muted-foreground mb-1">Долгота</div>
                <div className="font-mono text-xs text-accent">{currentPole.lng.toFixed(6)}</div>
              </div>
            </div>
            <div className="border-t border-border pt-3">
              <div className="font-mono text-xs text-muted-foreground mb-1">Дата и время осмотра</div>
              <div className="font-mono text-sm text-primary">{datetime}</div>
            </div>
          </div>

          <div className="bg-card border border-border rounded p-4 mb-4">
            <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-3">Фотография опоры</div>
            {photo ? (
              <div className="relative">
                <img src={photo} alt="Опора" className="w-full h-48 object-cover rounded border border-border" />
                <button
                  onClick={() => setPhoto(null)}
                  className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded hover:bg-destructive/80 transition-colors"
                >
                  <Icon name="X" size={12} />
                </button>
                <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded font-mono text-xs text-foreground">
                  {currentPole.name} · {datetime}
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded h-40 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <Icon name="Camera" size={32} className="text-muted-foreground mb-2" />
                <span className="font-sans text-sm text-muted-foreground">Нажмите для фотосъёмки</span>
                <span className="font-mono text-xs text-muted-foreground/60 mt-1">или выберите файл</span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoCapture}
              className="hidden"
            />
          </div>

          <div className="bg-card border border-border rounded p-4 mb-4">
            <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-3">Угол наклона опоры</div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={tiltAngle}
                onChange={(e) => setTiltAngle(e.target.value)}
                step="0.1"
                min="-45"
                max="45"
                className="flex-1 bg-background border border-border rounded px-3 py-2 font-mono text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
              <span className="font-mono text-sm text-muted-foreground">градусов</span>
              <div className={`w-8 h-8 border-2 rounded flex items-center justify-center transition-transform ${
                Math.abs(parseFloat(tiltAngle) || 0) > 5 ? 'border-destructive' :
                Math.abs(parseFloat(tiltAngle) || 0) > 2 ? 'border-primary' : 'border-green-500'
              }`} style={{ transform: `rotate(${tiltAngle}deg)` }}>
                <div className="w-0.5 h-4 bg-current rounded" />
              </div>
            </div>
            <div className="mt-2 font-mono text-xs text-muted-foreground">
              {Math.abs(parseFloat(tiltAngle) || 0) > 5 ? (
                <span className="text-destructive">⚠ Критический наклон</span>
              ) : Math.abs(parseFloat(tiltAngle) || 0) > 2 ? (
                <span className="text-primary">Допустимый наклон</span>
              ) : (
                <span className="text-green-400">Норма</span>
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded p-4 mb-4">
            <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">Примечания</div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Дополнительные наблюдения..."
              className="w-full h-20 bg-background border border-border rounded p-3 font-sans text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded font-sans font-semibold text-sm hover:bg-primary/90 transition-all"
          >
            <Icon name="Save" size={16} />
            Сохранить осмотр
          </button>

          {saved && (
            <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded mt-3">
              <Icon name="CheckCircle" size={14} className="text-green-400" />
              <span className="text-green-400 text-xs font-sans">Осмотр сохранён. Перейдите в раздел Дефекты для указания нарушений.</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
