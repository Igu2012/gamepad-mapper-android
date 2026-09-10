import AsyncStorage from "@react-native-async-storage/async-storage";

export type MappingAction = "tap" | "swipe" | "key" | "none";
export type ButtonMapping = {
  label: string;
  action: MappingAction;
  key?: string;
  x?: number;
  y?: number;
};

export type GameProfile = {
  id: string;
  name: string;
  packageName?: string;
  updatedAt: string;
  mappings: Record<string, ButtonMapping>;
};

const STORAGE_KEY = "gamepad-mapper.profiles.v1";

export const defaultMappings: Record<string, ButtonMapping> = {
  A: { label: "A", action: "tap", x: 78, y: 68 },
  B: { label: "B", action: "tap", x: 88, y: 58 },
  X: { label: "X", action: "tap", x: 68, y: 58 },
  Y: { label: "Y", action: "tap", x: 78, y: 48 },
  L1: { label: "L1", action: "tap", x: 18, y: 22 },
  R1: { label: "R1", action: "tap", x: 82, y: 22 },
  "D-pad": { label: "D-pad", action: "swipe", x: 25, y: 60 },
  "L stick": { label: "L stick", action: "swipe", x: 28, y: 40 },
  "R stick": { label: "R stick", action: "swipe", x: 62, y: 72 },
};

export async function loadProfiles(): Promise<GameProfile[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [{ id: "default", name: "Perfil padrão", updatedAt: new Date().toISOString(), mappings: defaultMappings }];
  }
  try {
    return JSON.parse(raw) as GameProfile[];
  } catch {
    return [{ id: "default", name: "Perfil padrão", updatedAt: new Date().toISOString(), mappings: defaultMappings }];
  }
}

export async function saveProfiles(profiles: GameProfile[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
}
