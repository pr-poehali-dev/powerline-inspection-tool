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

interface HistoryPageProps {
  inspections: InspectionRecord[];
  onDeleteInspection: (id: string) => void;
}

export default function HistoryPage({ inspections, onDeleteInspection }: HistoryPageProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = inspections.filter(r =>
    r.poleName.toLowerCase().includes(search.toLowerCase()) ||
    r.lineName.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      onDeleteInspection(id);
      setDeleteConfirm(null);
      if (expandedId === id) setExpandedId(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Icon name="History" size={16} className="text-accent" />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Журнал</span>
        </div>
        <h2 className="font-mono text-xl font-semibold text-foreground">История осмотров</h2>
        <div className="font-mono text-xs text-muted-foreground mt-1">
          {inspections.length} записей
        </div>
      </div>

      <div className="relative mb-4">
        <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по опоре или линии..."
          className="w-full bg-card border border-border rounded pl-9 pr-3 py-2.5 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-48 bg-card border border-border rounded p-6">
          <Icon name="ClipboardList" size={36} className="text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm text-center">
            {inspections.length === 0 ? 'История пуста — выполните первый осмотр' : 'Ничего не найдено'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((rec) => (
            <div
              key={rec.id}
              className="bg-card border border-border rounded overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(expandedId === rec.id ? null : rec.id)}
                className="w-full flex items-center justify-between p-3.5 hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    rec.defects.length > 0 ? 'bg-destructive animate-pulse-amber' : 'bg-green-400'
                  }`} />
                  <div className="text-left min-w-0">
                    <div className="font-mono text-sm text-foreground">{rec.poleName}</div>
                    <div className="font-sans text-xs text-muted-foreground truncate">{rec.lineName}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {rec.defects.length > 0 && (
                    <span className="font-mono text-xs bg-destructive/20 text-destructive px-1.5 py-0.5 rounded">
                      {rec.defects.length}
                    </span>
                  )}
                  {rec.photo && <Icon name="Image" size={12} className="text-accent" />}
                  <Icon
                    name={expandedId === rec.id ? 'ChevronUp' : 'ChevronDown'}
                    size={14}
                    className="text-muted-foreground"
                  />
                </div>
              </button>

              {expandedId === rec.id && (
                <div className="border-t border-border p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="font-mono text-xs text-muted-foreground mb-0.5">Дата и время</div>
                      <div className="font-mono text-xs text-foreground">{rec.datetime}</div>
                    </div>
                    <div>
                      <div className="font-mono text-xs text-muted-foreground mb-0.5">Угол наклона</div>
                      <div className={`font-mono text-sm font-medium ${
                        Math.abs(parseFloat(rec.tiltAngle) || 0) > 5 ? 'text-destructive' :
                        Math.abs(parseFloat(rec.tiltAngle) || 0) > 2 ? 'text-primary' : 'text-green-400'
                      }`}>{rec.tiltAngle}°</div>
                    </div>
                    <div>
                      <div className="font-mono text-xs text-muted-foreground mb-0.5">Координаты</div>
                      <div className="font-mono text-xs text-accent">
                        {rec.lat.toFixed(5)}, {rec.lng.toFixed(5)}
                      </div>
                    </div>
                    <div>
                      <div className="font-mono text-xs text-muted-foreground mb-0.5">Фотография</div>
                      <div className="font-mono text-xs text-foreground">
                        {rec.photo ? 'Есть' : 'Отсутствует'}
                      </div>
                    </div>
                  </div>

                  {rec.photo && (
                    <img
                      src={rec.photo}
                      alt={rec.poleName}
                      className="w-full h-36 object-cover rounded border border-border"
                    />
                  )}

                  {rec.defects.length > 0 && (
                    <div>
                      <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">
                        Дефекты ({rec.defects.length})
                      </div>
                      <div className="space-y-1">
                        {rec.defects.map((d) => (
                          <div key={d} className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-destructive shrink-0" />
                            <span className="font-sans text-xs text-destructive/80">{d}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {rec.notes && (
                    <div>
                      <div className="font-mono text-xs text-muted-foreground mb-1">Примечания</div>
                      <div className="font-sans text-xs text-foreground bg-secondary/50 rounded p-2">{rec.notes}</div>
                    </div>
                  )}

                  <button
                    onClick={() => handleDelete(rec.id)}
                    className={`w-full flex items-center justify-center gap-2 py-2 rounded text-xs font-sans transition-colors ${
                      deleteConfirm === rec.id
                        ? 'bg-destructive text-white'
                        : 'border border-border text-muted-foreground hover:border-destructive/50 hover:text-destructive'
                    }`}
                  >
                    <Icon name="Trash2" size={12} />
                    {deleteConfirm === rec.id ? 'Нажмите ещё раз для удаления' : 'Удалить запись'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
