import { DeviceEventEmitter, NativeModules, Platform } from "react-native";

export type GamepadConnection = "Bluetooth" | "USB" | "Desconhecido";

export type GamepadState = {
  connected: boolean;
  name: string;
  connection: GamepadConnection;
  battery?: number;
  lastInput?: string;
};

type Listener = (state: GamepadState) => void;

const EMPTY_STATE: GamepadState = {
  connected: false,
  name: "Nenhum controle conectado",
  connection: "Desconhecido",
};

const nativeGamepad = NativeModules.GamepadMapper as {
  startScan?: () => void;
  stopScan?: () => void;
} | undefined;

function normalizeNativeState(payload: Partial<GamepadState>): GamepadState {
  return {
    ...EMPTY_STATE,
    ...payload,
    connection: payload.connection ?? "Desconhecido",
    name: payload.name ?? "Controle detectado",
    connected: payload.connected ?? true,
  };
}

export const GamepadService = {
  subscribe(listener: Listener) {
    let timer: ReturnType<typeof setInterval> | undefined;
    const subscriptions = [
      DeviceEventEmitter.addListener("GamepadMapper.onConnected", (payload) => listener(normalizeNativeState(payload))),
      DeviceEventEmitter.addListener("GamepadMapper.onDisconnected", () => listener(EMPTY_STATE)),
      DeviceEventEmitter.addListener("GamepadMapper.onInput", (payload) => listener(normalizeNativeState(payload))),
    ];

    if (Platform.OS === "web") {
      const readBrowserGamepad = () => {
        const gamepads = typeof navigator !== "undefined" && navigator.getGamepads ? navigator.getGamepads() : [];
        const gamepad = Array.from(gamepads).find(Boolean);
        if (gamepad) {
          listener({
            connected: gamepad.connected,
            name: gamepad.id || "Gamepad",
            connection: "Desconhecido",
            lastInput: "Controle conectado",
          });
        } else {
          listener(EMPTY_STATE);
        }
      };
      readBrowserGamepad();
      timer = setInterval(readBrowserGamepad, 1200);
    } else {
      nativeGamepad?.startScan?.();
    }

    return () => {
      if (timer) clearInterval(timer);
      subscriptions.forEach((subscription) => subscription.remove());
      nativeGamepad?.stopScan?.();
    };
  },
};

export function getEmptyGamepadState() {
  return EMPTY_STATE;
}
