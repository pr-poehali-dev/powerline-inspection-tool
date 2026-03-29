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

interface TemplatePageProps {
  onTemplateLoaded: (template: LineTemplate) => void;
  currentTemplate: LineTemplate | null;
}

const EXAMPLE_TEMPLATE = `{
  "lineName": "ВЛ-110 кВ Северная–Центральная",
  "voltage": "110",
  "poles": [
    { "id": "1", "name": "Оп.1", "lat": 55.7522, "lng": 37.6156, "type": "анкерная" },
    { "id": "2", "name": "Оп.2", "lat": 55.7534, "lng": 37.6178, "type": "промежуточная" },
    { "id": "3", "name": "Оп.3", "lat": 55.7548, "lng": 37.6201, "type": "промежуточная" }
  ]
}`;

export default function TemplatePage({ onTemplateLoaded, currentTemplate }: TemplatePageProps) {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleLoad = () => {
    setError('');
    setSuccess(false);
    try {
      const parsed = JSON.parse(jsonText) as LineTemplate;
      if (!parsed.lineName || !parsed.poles || !Array.isArray(parsed.poles)) {
        setError('Неверный формат: требуются поля lineName и poles[]');
        return;
      }
      onTemplateLoaded(parsed);
      setSuccess(true);
    } catch {
      setError('Ошибка разбора JSON — проверьте формат файла');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setJsonText(ev.target?.result as string);
      setError('');
      setSuccess(false);
    };
    reader.readAsText(file);
  };

  const handleExample = () => {
    setJsonText(EXAMPLE_TEMPLATE);
    setError('');
    setSuccess(false);
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Icon name="Upload" size={16} className="text-primary" />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Импорт данных</span>
        </div>
        <h2 className="font-mono text-xl font-semibold text-foreground">Загрузка шаблона линии</h2>
      </div>

      {currentTemplate && (
        <div className="bg-green-500/10 border border-green-500/30 rounded p-4 mb-4 flex items-start gap-3">
          <Icon name="CheckCircle" size={16} className="text-green-400 mt-0.5 shrink-0" />
          <div>
            <div className="text-green-400 text-sm font-sans font-medium">{currentTemplate.lineName}</div>
            <div className="text-muted-foreground text-xs mt-0.5">
              {currentTemplate.poles.length} опор · {currentTemplate.voltage} кВ
            </div>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Формат JSON</span>
          <button
            onClick={handleExample}
            className="text-xs text-accent hover:text-accent/80 font-mono transition-colors"
          >
            вставить пример
          </button>
        </div>
        <textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          placeholder='{"lineName": "ВЛ-110 кВ ...", "voltage": "110", "poles": [...]}'
          className="w-full h-48 bg-background border border-border rounded p-3 font-mono text-xs text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      <div className="flex gap-3 mb-4">
        <label className="flex-1 flex items-center justify-center gap-2 p-3 border border-border rounded cursor-pointer hover:bg-secondary transition-colors">
          <Icon name="FileJson" size={16} className="text-muted-foreground" />
          <span className="text-sm font-sans text-muted-foreground">Загрузить файл JSON</span>
          <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
        </label>
        <button
          onClick={handleLoad}
          disabled={!jsonText.trim()}
          className="flex-1 flex items-center justify-center gap-2 p-3 bg-primary text-primary-foreground rounded font-sans font-medium text-sm hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <Icon name="Play" size={16} />
          Загрузить шаблон
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded mb-4">
          <Icon name="AlertTriangle" size={14} className="text-destructive mt-0.5 shrink-0" />
          <span className="text-destructive text-xs font-sans">{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded mb-4">
          <Icon name="CheckCircle" size={14} className="text-green-400" />
          <span className="text-green-400 text-xs font-sans">Шаблон успешно загружен</span>
        </div>
      )}

      <div className="bg-card border border-border rounded p-4">
        <div className="flex items-center gap-2 mb-3">
          <Icon name="Info" size={14} className="text-muted-foreground" />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Структура файла</span>
        </div>
        <pre className="font-mono text-xs text-muted-foreground leading-relaxed overflow-x-auto">
{`{
  "lineName": "Название линии",
  "voltage": "110",           // кВ
  "poles": [
    {
      "id": "1",
      "name": "Оп.1",
      "lat": 55.7522,         // широта
      "lng": 37.6156,         // долгота
      "type": "анкерная"
    }
  ]
}`}
        </pre>
      </div>
    </div>
  );
}
