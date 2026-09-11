export interface CategoryDTO {
  id: string;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
}

export interface HabitLogDTO {
  id: string;
  habitId: string;
  date: string;
  value: number;
  isCompleted: boolean;
}

export type FrequencyTypeDTO = "DAILY" | "WEEKLY" | "CUSTOM_DAYS";

export interface HabitDTO {
  id: string;
  categoryId: string;
  name: string;
  icon: string;
  color: string;
  frequencyType: FrequencyTypeDTO;
  customDays: number[] | null;
  targetValue: number;
  unit: string;
  reminderTime: string | null;
  monthlyMissesAllowed: number;
  isArchived: boolean;
  createdAt: string;
  category: CategoryDTO;
  logs: HabitLogDTO[];
}

export interface TogglePayload {
  habitId: string;
  date: string;
  value?: number;
  isCompleted?: boolean;
}

export interface UpsertResult {
  log: HabitLogDTO | null;
  removed?: boolean;
}