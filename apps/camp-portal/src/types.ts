export interface Camp {
  id: string;
  name: string;
  state: string;
  district: string;
  lat: number;
  lng: number;
  contact_phone: string;
  created_at?: string;
}

export interface Need {
  id: string;
  camp_id: string;
  item: string;
  quantity_needed: number;
  quantity_fulfilled: number;
  status: string;
  urgency: 'critical' | 'high' | 'moderate';
  archived?: boolean;
  created_at?: string;
}
