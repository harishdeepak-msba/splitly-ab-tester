export type ExperimentStatus = 'draft' | 'active' | 'paused' | 'completed';

export interface VariantStats {
  controlRate: number;
  variantRate: number;
  zScore?: number;
  pValue?: number;
  confidence: number;
  relativeImprovement: number;
  significant: boolean;
}

export interface Variant {
  id: string;
  experiment_id: string;
  name: string;
  description: string;
  traffic_split: number;
  is_control: number;
  impressions?: number;
  conversions?: number;
  stats?: VariantStats | null;
}

export interface DailyEvent {
  day: string;
  variant_id: string;
  event_type: string;
  count: number;
}

export interface Experiment {
  id: string;
  name: string;
  hypothesis: string;
  status: ExperimentStatus;
  goal: string;
  created_at: number;
  updated_at: number;
  variants: Variant[];
  totalImpressions?: number;
  totalConversions?: number;
  daily?: DailyEvent[];
}

export interface NewVariantInput {
  name: string;
  description: string;
  trafficSplit: number;
}

export interface CreateExperimentInput {
  name: string;
  hypothesis: string;
  goal: string;
  variants: NewVariantInput[];
}
