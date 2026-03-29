import { useState } from 'react';
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

interface MapPageProps {
  template: LineTemplate | null;
  onSelectPole: (pole: Pole) => void;
  inspectedPoles: string[];
  onNavigate: (page: string) => void;
}

export default function MapPage({ template, onSelectPole, inspectedPoles, onNavigate }: MapPageProps) {
  const [selectedPole, setSelectedPole] = useState<Pole | null>(null);

  const handlePoleClick = (pole: Pole) => {
    setSelectedPole(pole);
  };

  const handleStartInspection = () => {
    if (selectedPole) {
      onSelectPole(selectedPole);
      onNavigate('inspection');
    }
  };

  if (!template) {
    return (
      <div className="p-6 animate-fade-in flex flex-col items-center justify-center min-h-64">
        <Icon name="Map" size={40} className="text-muted-foreground mb-4" />
        <h2 className="font-mono text-lg font-medium text-foreground mb-2">Нет загруженного шаблона</h2>
        <p className="text-muted-foreground text-sm text-center mb-4">
          Загрузите шаблон линии с координатами опор
        </p>
        <button
          onClick={() => onNavigate('template')}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-sans font-medium hover:bg-primary/90 transition-colors"
        >
          <Icon name="Upload" size={14} />
          Загрузить шаблон
        </button>
      </div>
    );
  }

  const minLat = Math.min(...template.poles.map(p => p.lat));
  const maxLat = Math.max(...template.poles.map(p => p.lat));
  const minLng = Math.min(...template.poles.map(p => p.lng));
  const maxLng = Math.max(...template.poles.map(p => p.lng));
  const latRange = maxLat - minLat || 0.001;
  const lngRange = maxLng - minLng || 0.001;

  const toX = (lng: number) => 5 + ((lng - minLng) / lngRange) * 90;
  const toY = (lat: number) => 95 - ((lat - minLat) / latRange) * 90;

  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Icon name="Map" size={16} className="text-accent" />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Схема линии</span>
        </div>
        <h2 className="font-mono text-xl font-semibold text-foreground">{template.lineName}</h2>
        <div className="flex gap-4 mt-1">
          <span className="font-mono text-xs text-muted-foreground">{template.voltage} кВ</span>
          <span className="font-mono text-xs text-muted-foreground">{template.poles.length} опор</span>
          <span className="font-mono text-xs text-green-400">{inspectedPoles.length} осмотрено</span>
        </div>
      </div>

      <div className="bg-card border border-border rounded mb-4 overflow-hidden">
        <div className="relative grid-bg" style={{ height: '320px' }}>
          <div className="absolute inset-0 scanline" />
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {template.poles.length > 1 && template.poles.map((pole, i) => {
              if (i === 0) return null;
              const prev = template.poles[i - 1];
              return (
                <line
                  key={`line-${i}`}
                  x1={toX(prev.lng)} y1={toY(prev.lat)}
                  x2={toX(pole.lng)} y2={toY(pole.lat)}
                  stroke="hsl(195 85% 45% / 0.4)"
                  strokeWidth="0.3"
                  strokeDasharray="1,0.5"
                />
              );
            })}
          </svg>
          {template.poles.map((pole) => {
            const x = toX(pole.lng);
            const y = toY(pole.lat);
            const isInspected = inspectedPoles.includes(pole.id);
            const isSelected = selectedPole?.id === pole.id;
            return (
              <button
                key={pole.id}
                onClick={() => handlePoleClick(pole)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <div className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-primary border-primary scale-125'
                    : isInspected
                    ? 'bg-green-500/20 border-green-500'
                    : 'bg-card border-accent hover:border-primary hover:scale-110'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-sm ${
                    isSelected ? 'bg-primary-foreground' : isInspected ? 'bg-green-400' : 'bg-accent'
                  }`} />
                </div>
                <div className={`absolute left-1/2 -translate-x-1/2 bottom-full mb-1 font-mono text-[9px] whitespace-nowrap px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                  isSelected ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {pole.name}
                </div>
              </button>
            );
          })}
        </div>
        <div className="flex gap-4 p-3 border-t border-border">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm border-2 border-accent bg-card" />
            <span className="font-mono text-xs text-muted-foreground">Не осмотрена</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm border-2 border-green-500 bg-green-500/20" />
            <span className="font-mono text-xs text-muted-foreground">Осмотрена</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm border-2 border-primary bg-primary" />
            <span className="font-mono text-xs text-muted-foreground">Выбрана</span>
          </div>
        </div>
      </div>

      {selectedPole ? (
        <div className="bg-primary/10 border border-primary/30 rounded p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="font-mono text-sm text-primary font-medium">{selectedPole.name}</div>
              <div className="text-muted-foreground text-xs mt-0.5 font-sans">{selectedPole.type}</div>
            </div>
            <div className="text-right">
              <div className="font-mono text-xs text-muted-foreground">{selectedPole.lat.toFixed(6)}</div>
              <div className="font-mono text-xs text-muted-foreground">{selectedPole.lng.toFixed(6)}</div>
            </div>
          </div>
          <button
            onClick={handleStartInspection}
            className="w-full flex items-center justify-center gap-2 py-2 bg-primary text-primary-foreground rounded text-sm font-sans font-medium hover:bg-primary/90 transition-colors"
          >
            <Icon name="Camera" size={14} />
            Начать осмотр опоры
          </button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Icon name="MousePointer" size={14} />
            <span className="text-xs font-sans">Нажмите на опору для выбора и начала осмотра</span>
          </div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-1 max-h-48 overflow-y-auto">
        {template.poles.map((pole) => {
          const isInspected = inspectedPoles.includes(pole.id);
          const isSelected = selectedPole?.id === pole.id;
          return (
            <button
              key={pole.id}
              onClick={() => handlePoleClick(pole)}
              className={`flex items-center justify-between p-2.5 rounded border text-left transition-all ${
                isSelected
                  ? 'bg-primary/10 border-primary/40'
                  : 'bg-card border-border hover:bg-secondary'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${isInspected ? 'bg-green-400' : 'bg-muted-foreground'}`} />
                <span className={`font-mono text-xs ${isSelected ? 'text-primary' : 'text-foreground'}`}>{pole.name}</span>
                <span className="text-xs text-muted-foreground font-sans">{pole.type}</span>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                {pole.lat.toFixed(4)}, {pole.lng.toFixed(4)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
