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

interface LineTemplate {
  lineName: string;
  voltage: string;
  poles: Pole[];
}

interface Pole {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
}

interface ReportPageProps {
  inspections: InspectionRecord[];
  template: LineTemplate | null;
}

function exportToCSV(inspections: InspectionRecord[], template: LineTemplate | null) {
  const BOM = '\uFEFF';
  const header = [
    'Линия',
    'Напряжение кВ',
    'Опора',
    'Тип опоры',
    'Дата и время',
    'Широта',
    'Долгота',
    'Угол наклона °',
    'Дефекты',
    'Примечания',
    'Фото',
  ].join(';');

  const rows = inspections.map(rec => {
    const poleType = template?.poles.find(p => p.id === rec.poleId)?.type ?? '';
    return [
      rec.lineName,
      template?.voltage ?? '',
      rec.poleName,
      poleType,
      rec.datetime,
      rec.lat.toFixed(6),
      rec.lng.toFixed(6),
      rec.tiltAngle,
      rec.defects.join(' | '),
      rec.notes,
      rec.photo ? 'Есть' : 'Нет',
    ].map(v => `"${v}"`).join(';');
  });

  const csv = BOM + [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const date = new Date().toISOString().slice(0, 10);
  link.download = `Осмотр_ЛЭП_${date}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function ReportPage({ inspections, template }: ReportPageProps) {
  const totalDefects = inspections.reduce((acc, r) => acc + r.defects.length, 0);
  const withPhoto = inspections.filter(r => r.photo).length;
  const withDefects = inspections.filter(r => r.defects.length > 0).length;

  const defectFrequency: Record<string, number> = {};
  inspections.forEach(r => r.defects.forEach(d => {
    defectFrequency[d] = (defectFrequency[d] ?? 0) + 1;
  }));
  const topDefects = Object.entries(defectFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Icon name="FileSpreadsheet" size={16} className="text-green-400" />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Итоги осмотра</span>
        </div>
        <h2 className="font-mono text-xl font-semibold text-foreground">Отчёт по линии</h2>
        {template && (
          <p className="text-muted-foreground text-sm mt-1 font-sans">{template.lineName} · {template.voltage} кВ</p>
        )}
      </div>

      {inspections.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-40 bg-card border border-border rounded p-6">
          <Icon name="FileSpreadsheet" size={36} className="text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm text-center">Нет данных для отчёта — выполните осмотры опор</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { label: 'Осмотрено опор', value: inspections.length, icon: 'CheckCircle', color: 'text-green-400' },
              { label: 'Выявлено дефектов', value: totalDefects, icon: 'AlertTriangle', color: 'text-destructive' },
              { label: 'Опор с фото', value: withPhoto, icon: 'Camera', color: 'text-accent' },
              { label: 'Опор с нарушениями', value: withDefects, icon: 'Flag', color: 'text-primary' },
            ].map((item) => (
              <div key={item.label} className="bg-card border border-border rounded p-4">
                <Icon name={item.icon} size={16} className={`${item.color} mb-2`} />
                <div className={`font-mono text-2xl font-semibold ${item.color}`}>{item.value}</div>
                <div className="text-muted-foreground text-xs mt-1 font-sans">{item.label}</div>
              </div>
            ))}
          </div>

          {topDefects.length > 0 && (
            <div className="bg-card border border-border rounded p-4 mb-6">
              <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-3">
                Частые дефекты
              </div>
              <div className="space-y-2">
                {topDefects.map(([defect, count]) => (
                  <div key={defect} className="flex items-center justify-between">
                    <span className="font-sans text-xs text-foreground flex-1 mr-3">{defect}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-secondary rounded overflow-hidden">
                        <div
                          className="h-full bg-destructive rounded"
                          style={{ width: `${(count / inspections.length) * 100}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs text-destructive w-4 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-card border border-border rounded mb-6 overflow-hidden">
            <div className="p-3 border-b border-border">
              <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Таблица осмотров</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-2.5 text-muted-foreground font-normal">Опора</th>
                    <th className="text-left p-2.5 text-muted-foreground font-normal">Время</th>
                    <th className="text-left p-2.5 text-muted-foreground font-normal">Наклон</th>
                    <th className="text-left p-2.5 text-muted-foreground font-normal">Дефекты</th>
                    <th className="text-left p-2.5 text-muted-foreground font-normal">Фото</th>
                  </tr>
                </thead>
                <tbody>
                  {inspections.map((rec) => (
                    <tr key={rec.id} className="border-b border-border last:border-0 hover:bg-secondary transition-colors">
                      <td className="p-2.5 text-foreground">{rec.poleName}</td>
                      <td className="p-2.5 text-muted-foreground text-[10px]">{rec.datetime}</td>
                      <td className="p-2.5">
                        <span className={`${
                          Math.abs(parseFloat(rec.tiltAngle) || 0) > 5 ? 'text-destructive' :
                          Math.abs(parseFloat(rec.tiltAngle) || 0) > 2 ? 'text-primary' : 'text-green-400'
                        }`}>{rec.tiltAngle}°</span>
                      </td>
                      <td className="p-2.5">
                        {rec.defects.length > 0 ? (
                          <span className="bg-destructive/20 text-destructive px-1.5 py-0.5 rounded text-[10px]">
                            {rec.defects.length}
                          </span>
                        ) : (
                          <span className="text-green-400">—</span>
                        )}
                      </td>
                      <td className="p-2.5">
                        {rec.photo ? (
                          <Icon name="Image" size={12} className="text-accent" />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button
            onClick={() => exportToCSV(inspections, template)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded font-sans font-semibold text-sm hover:bg-green-500 transition-colors"
          >
            <Icon name="Download" size={16} />
            Выгрузить в Excel (CSV)
          </button>
          <p className="text-muted-foreground text-xs text-center mt-2 font-sans">
            Файл откроется в Microsoft Excel или Google Таблицах
          </p>
        </>
      )}
    </div>
  );
}
