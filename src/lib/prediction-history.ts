/**
 * Prediction History Module (Step 24)
 * Tracks user identification history records.
 */

export interface PredictionHistoryRecord {
  id: string;
  user_id?: string;
  species_id: number;
  common_name: string;
  scientific_name: string;
  confidence: number;
  image_url?: string;
  created_at: string;
}

// In-memory / persistent history store
const PREDICTION_HISTORY_STORE: PredictionHistoryRecord[] = [
  {
    id: "hist_001",
    user_id: "user_demo",
    species_id: 17,
    common_name: "Indian Mackerel",
    scientific_name: "Rastrelliger kanagurta",
    confidence: 94.32,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: "hist_002",
    user_id: "user_demo",
    species_id: 460,
    common_name: "Yellowfin Tuna",
    scientific_name: "Thunnus albacares",
    confidence: 91.15,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: "hist_003",
    user_id: "user_demo",
    species_id: 409,
    common_name: "Goldstripe Sardinella",
    scientific_name: "Sardinella gibbosa",
    confidence: 88.70,
    created_at: new Date(Date.now() - 3600000 * 48).toISOString()
  }
];

export function savePredictionHistory(record: Omit<PredictionHistoryRecord, "id" | "created_at">): PredictionHistoryRecord {
  const newRecord: PredictionHistoryRecord = {
    ...record,
    id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    created_at: new Date().toISOString()
  };
  PREDICTION_HISTORY_STORE.unshift(newRecord);
  return newRecord;
}

export function getPredictionHistory(userId?: string): PredictionHistoryRecord[] {
  if (userId) {
    return PREDICTION_HISTORY_STORE.filter(r => r.user_id === userId);
  }
  return PREDICTION_HISTORY_STORE;
}
