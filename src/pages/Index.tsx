import { useState } from 'react';
import Icon from '@/components/ui/icon';
import HomePage from './HomePage';
import TemplatePage from './TemplatePage';
import MapPage from './MapPage';
import InspectionPage from './InspectionPage';
import DefectsPage from './DefectsPage';
import ReportPage from './ReportPage';
import HistoryPage from './HistoryPage';

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

type PageId = 'home' | 'template' | 'map' | 'inspection' | 'defects' | 'report' | 'history';

const NAV_ITEMS: { id: PageId; label: string; icon: string; short: string }[] = [
  { id: 'home', label: 'Главная', icon: 'LayoutDashboard', short: 'Гл.' },
  { id: 'template', label: 'Шаблон', icon: 'Upload', short: 'Шабл.' },
  { id: 'map', label: 'Карта опор', icon: 'Map', short: 'Карта' },
  { id: 'inspection', label: 'Осмотр', icon: 'Camera', short: 'Осм.' },
  { id: 'defects', label: 'Дефекты', icon: 'AlertTriangle', short: 'Деф.' },
  { id: 'report', label: 'Отчёт', icon: 'FileSpreadsheet', short: 'Отч.' },
  { id: 'history', label: 'История', icon: 'History', short: 'Ист.' },
];

export default function Index() {
  const [activePage, setActivePage] = useState<PageId>('home');
  const [template, setTemplate] = useState<LineTemplate | null>(null);
  const [selectedPole, setSelectedPole] = useState<Pole | null>(null);
  const [inspections, setInspections] = useState<InspectionRecord[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = (page: string) => {
    setActivePage(page as PageId);
    setSidebarOpen(false);
  };

  const handleSaveInspection = (record: InspectionRecord) => {
    setInspections(prev => {
      const existing = prev.findIndex(r => r.poleId === record.poleId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], ...record };
        return updated;
      }
      return [...prev, record];
    });
  };

  const handleUpdateDefects = (id: string, defects: string[]) => {
    setInspections(prev => prev.map(r => r.id === id ? { ...r, defects } : r));
  };

  const handleDeleteInspection = (id: string) => {
    setInspections(prev => prev.filter(r => r.id !== id));
  };

  const inspectedPoles = inspections.map(r => r.poleId);
  const stats = {
    lines: template ? 1 : 0,
    poles: template?.poles.length ?? 0,
    inspections: inspections.length,
  };

  const currentPageLabel = NAV_ITEMS.find(n => n.id === activePage)?.label ?? '';
  const defectsCount = inspections.reduce((acc, r) => acc + r.defects.length, 0);

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage onNavigate={navigate} stats={stats} />;
      case 'template':
        return <TemplatePage onTemplateLoaded={setTemplate} currentTemplate={template} />;
      case 'map':
        return <MapPage template={template} onSelectPole={setSelectedPole} inspectedPoles={inspectedPoles} onNavigate={navigate} />;
      case 'inspection':
        return <InspectionPage template={template} selectedPole={selectedPole} onSaveInspection={handleSaveInspection} onNavigate={navigate} />;
      case 'defects':
        return <DefectsPage inspections={inspections} onUpdateDefects={handleUpdateDefects} />;
      case 'report':
        return <ReportPage inspections={inspections} template={template} />;
      case 'history':
        return <HistoryPage inspections={inspections} onDeleteInspection={handleDeleteInspection} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="h-12 bg-card border-b border-border flex items-center justify-between px-4 shrink-0 relative z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded hover:bg-secondary transition-colors md:hidden"
          >
            <Icon name="Menu" size={18} className="text-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-primary rounded-sm flex items-center justify-center">
              <Icon name="Zap" size={11} className="text-primary-foreground" />
            </div>
            <span className="font-mono text-sm font-semibold text-foreground tracking-tight">
              ЛЭП<span className="text-primary">·ИНС</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-1 text-muted-foreground">
            <span className="font-mono text-xs">/</span>
            <span className="font-mono text-xs">{currentPageLabel}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {template && (
            <div className="hidden md:flex items-center gap-1.5 bg-secondary px-2.5 py-1 rounded">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-amber" />
              <span className="font-mono text-xs text-muted-foreground truncate max-w-32">{template.lineName}</span>
            </div>
          )}
          {defectsCount > 0 && (
            <div className="flex items-center gap-1 bg-destructive/20 px-2 py-0.5 rounded">
              <Icon name="AlertTriangle" size={11} className="text-destructive" />
              <span className="font-mono text-xs text-destructive">{defectsCount}</span>
            </div>
          )}
          <div className="font-mono text-xs text-muted-foreground hidden md:block">
            {new Date().toLocaleDateString('ru-RU')}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-10 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside className={`
          w-52 bg-sidebar border-r border-sidebar-border flex-col shrink-0 z-20
          hidden md:flex
          ${sidebarOpen ? 'fixed top-12 left-0 bottom-0 flex' : ''}
        `}>
          <div className="p-2 flex-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-sm mb-0.5 text-left transition-all nav-item ${
                  activePage === item.id ? 'nav-item-active' : ''
                }`}
              >
                <Icon
                  name={item.icon}
                  size={15}
                  className={activePage === item.id ? 'text-primary' : 'text-muted-foreground'}
                />
                <span className={`font-sans text-sm ${activePage === item.id ? 'text-primary font-medium' : 'text-sidebar-foreground'}`}>
                  {item.label}
                </span>
                {item.id === 'defects' && defectsCount > 0 && (
                  <span className="ml-auto font-mono text-xs bg-destructive/20 text-destructive px-1.5 py-0.5 rounded">
                    {defectsCount}
                  </span>
                )}
                {item.id === 'history' && inspections.length > 0 && (
                  <span className="ml-auto font-mono text-xs text-muted-foreground">
                    {inspections.length}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="p-3 border-t border-sidebar-border">
            <div className="font-mono text-xs text-muted-foreground">v1.0.0</div>
            <div className="font-mono text-xs text-muted-foreground/60">ЛЭП Инспектор</div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <div className="max-w-2xl mx-auto">
            {renderPage()}
          </div>
        </main>

        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-20 flex">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 relative transition-colors ${
                activePage === item.id ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {activePage === item.id && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-b" />
              )}
              <Icon name={item.icon} size={16} />
              <span className="font-mono text-[9px]">{item.short}</span>
              {item.id === 'defects' && defectsCount > 0 && (
                <div className="absolute top-1 right-1 w-4 h-4 bg-destructive rounded-full flex items-center justify-center">
                  <span className="font-mono text-[8px] text-white">{defectsCount}</span>
                </div>
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
