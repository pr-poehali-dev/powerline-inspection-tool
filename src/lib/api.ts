const URLS = {
  templates: 'https://functions.poehali.dev/084e2d86-4ca3-481e-9a69-dd6c4ef0feff',
  inspections: 'https://functions.poehali.dev/47b99d6e-00a5-4582-b023-fbb2b0e2911a',
};

export interface Pole {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
}

export interface LineTemplate {
  id?: number;
  lineName: string;
  voltage: string;
  poles: Pole[];
}

export interface InspectionRecord {
  id: string;
  poleId: string;
  poleName: string;
  lineName: string;
  templateId?: number | null;
  datetime: string;
  lat: number;
  lng: number;
  tiltAngle: string;
  photo: string | null;
  defects: string[];
  notes: string;
}

export const api = {
  async getTemplate(): Promise<LineTemplate | null> {
    const res = await fetch(URLS.templates);
    const data = await res.json();
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    return parsed.template ?? null;
  },

  async saveTemplate(template: LineTemplate): Promise<number> {
    const res = await fetch(URLS.templates, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template),
    });
    const data = await res.json();
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    return parsed.id;
  },

  async getInspections(): Promise<InspectionRecord[]> {
    const res = await fetch(URLS.inspections);
    const data = await res.json();
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    return parsed.inspections ?? [];
  },

  async saveInspection(record: Omit<InspectionRecord, 'id'>): Promise<string> {
    const res = await fetch(URLS.inspections, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
    const data = await res.json();
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    return parsed.id;
  },

  async updateInspection(id: string, updates: Partial<InspectionRecord>): Promise<void> {
    await fetch(`${URLS.inspections}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  },

  async deleteInspection(id: string): Promise<void> {
    await fetch(`${URLS.inspections}/${id}`, { method: 'DELETE' });
  },
};
