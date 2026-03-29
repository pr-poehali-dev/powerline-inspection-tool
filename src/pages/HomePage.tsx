import Icon from '@/components/ui/icon';

interface HomePageProps {
  onNavigate: (page: string) => void;
  stats: { lines: number; poles: number; inspections: number };
}

export default function HomePage({ onNavigate, stats }: HomePageProps) {
  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-xs text-muted-foreground tracking-widest uppercase">Система мониторинга</span>
          <span className="cursor-blink font-mono text-primary text-xs">█</span>
        </div>
        <h1 className="font-mono text-3xl font-semibold text-foreground tracking-tight">
          ЛЭП <span className="text-primary">Инспектор</span>
        </h1>
        <p className="text-muted-foreground text-sm mt-1 font-sans">
          Профессиональный инструмент осмотра линий электропередач
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: 'Линий загружено', value: stats.lines, icon: 'Zap', color: 'text-primary' },
          { label: 'Опор в базе', value: stats.poles, icon: 'MapPin', color: 'text-accent' },
          { label: 'Осмотров выполнено', value: stats.inspections, icon: 'ClipboardCheck', color: 'text-green-400' },
        ].map((item) => (
          <div key={item.label} className="bg-card border border-border rounded p-4">
            <Icon name={item.icon} size={20} className={`${item.color} mb-2`} />
            <div className={`font-mono text-2xl font-semibold ${item.color}`}>{item.value}</div>
            <div className="text-muted-foreground text-xs mt-1 font-sans">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <h2 className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-3">Быстрый доступ</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Загрузить шаблон', desc: 'Импорт линии с опорами', icon: 'Upload', page: 'template', accent: true },
            { label: 'Карта опор', desc: 'Просмотр на местности', icon: 'Map', page: 'map', accent: false },
            { label: 'Начать осмотр', desc: 'Фотофиксация и данные', icon: 'Camera', page: 'inspection', accent: false },
            { label: 'Выгрузить отчёт', desc: 'Экспорт в Excel', icon: 'FileSpreadsheet', page: 'report', accent: false },
          ].map((item) => (
            <button
              key={item.page}
              onClick={() => onNavigate(item.page)}
              className={`text-left p-4 rounded border transition-all group ${
                item.accent
                  ? 'bg-primary/10 border-primary/30 hover:bg-primary/15 hover:border-primary/50 amber-glow'
                  : 'bg-card border-border hover:bg-secondary hover:border-border'
              }`}
            >
              <Icon
                name={item.icon}
                size={18}
                className={`mb-2 transition-transform group-hover:scale-110 ${item.accent ? 'text-primary' : 'text-muted-foreground'}`}
              />
              <div className={`font-sans font-medium text-sm ${item.accent ? 'text-primary' : 'text-foreground'}`}>
                {item.label}
              </div>
              <div className="text-muted-foreground text-xs mt-0.5">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded p-4">
        <div className="flex items-center gap-2 mb-3">
          <Icon name="Activity" size={14} className="text-accent" />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Последние действия</span>
        </div>
        <div className="space-y-2">
          {[
            { text: 'Нет данных — начните с загрузки шаблона линии', time: '', type: 'muted' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
              <span className={`text-xs font-sans ${item.type === 'muted' ? 'text-muted-foreground' : 'text-foreground'}`}>
                {item.text}
              </span>
              {item.time && <span className="font-mono text-xs text-muted-foreground">{item.time}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}