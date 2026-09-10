import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { GamepadService, type GamepadState } from "@/lib/gamepad-service";
import { checkForUpdate, openUpdate, type UpdateInfo } from "@/lib/update-checker";
import { loadProfiles, type GameProfile } from "@/lib/profile-store";

const colors = {
  background: "#0B0F14",
  surface: "#121922",
  elevated: "#182331",
  border: "#263547",
  text: "#F5F7FA",
  muted: "#8D9AAC",
  primary: "#67E8B5",
  primarySoft: "#183B34",
  warning: "#F6C85F",
  danger: "#FF7A8A",
};

function Pill({ label, tone = "muted" }: { label: string; tone?: "muted" | "success" | "warning" }) {
  const toneStyle = tone === "success" ? styles.pillSuccess : tone === "warning" ? styles.pillWarning : styles.pillMuted;
  return <View style={[styles.pill, toneStyle]}><Text style={styles.pillText}>{label}</Text></View>;
}

export default function HomeScreen() {
  const router = useRouter();
  const [gamepad, setGamepad] = useState<GamepadState>({ connected: false, name: "Nenhum controle conectado", connection: "Desconhecido" });
  const [profiles, setProfiles] = useState<GameProfile[]>([]);
  const [selectedId, setSelectedId] = useState("default");
  const [update, setUpdate] = useState<UpdateInfo | null>(null);
  const [checkingUpdate, setCheckingUpdate] = useState(true);

  const refreshUpdate = useCallback(async () => {
    setCheckingUpdate(true);
    const result = await checkForUpdate();
    setUpdate(result);
    setCheckingUpdate(false);
  }, []);

  useEffect(() => {
    const unsubscribe = GamepadService.subscribe(setGamepad);
    loadProfiles().then(setProfiles);
    refreshUpdate();
    return unsubscribe;
  }, [refreshUpdate]);

  const vibrate = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  const startMapping = () => {
    vibrate();
    router.push("/mapping");
  };

  return (
    <ScreenContainer edges={["top", "left", "right", "bottom"]} style={styles.screen} containerClassName="bg-[#0B0F14]" className="px-5">
      <FlatList
        data={profiles}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <View>
                <Text style={styles.eyebrow}>GAMEPAD MAPPER</Text>
                <Text style={styles.title}>Jogue do seu jeito.</Text>
              </View>
              <Pressable onPress={() => router.push("/settings")} style={({ pressed }) => [styles.settingsButton, pressed && styles.pressed]} accessibilityLabel="Abrir settings">
                <Text style={styles.settingsIcon}>⚙</Text>
              </Pressable>
            </View>

            <View style={[styles.connectionCard, gamepad.connected && styles.connectionCardConnected]}>
              <View style={styles.connectionTop}>
                <View style={[styles.statusDot, gamepad.connected && styles.statusDotConnected]} />
                <Text style={styles.cardLabel}>{gamepad.connected ? "CONTROLE CONECTADO" : "AGUARDANDO CONTROLE"}</Text>
                <Pill label={gamepad.connected ? gamepad.connection : "Bluetooth / USB"} tone={gamepad.connected ? "success" : "muted"} />
              </View>
              <Text style={styles.controllerName}>{gamepad.connected ? gamepad.name : "Conecte seu gamepad para começar"}</Text>
              <Text style={styles.helper}>{gamepad.connected ? "Reconhecido automaticamente. Pronto para mapear." : "O app detecta controles Bluetooth e USB compatíveis."}</Text>
              {!gamepad.connected && <View style={styles.permissionLine}><Text style={styles.permissionIcon}>i</Text><Text style={styles.permissionText}>Na primeira vez, ative as permissões de sobreposição e acessibilidade.</Text></View>}
            </View>

            {update?.available && (
              <Pressable onPress={() => openUpdate(update)} style={({ pressed }) => [styles.updateBanner, pressed && styles.pressed]}>
                <View style={styles.updateCopy}><Text style={styles.updateTitle}>Nova versão disponível</Text><Text style={styles.updateText}>Baixe a versão {update.version} pelo GitHub Releases.</Text></View>
                <Text style={styles.updateArrow}>→</Text>
              </Pressable>
            )}

            <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Escolha um perfil</Text><Pressable onPress={() => router.push("/mapping")}><Text style={styles.link}>Editar</Text></Pressable></View>
          </>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => { vibrate(); setSelectedId(item.id); }} style={({ pressed }) => [styles.profileCard, selectedId === item.id && styles.profileCardSelected, pressed && styles.pressed]}>
            <View style={[styles.profileMark, selectedId === item.id && styles.profileMarkSelected]}><Text style={styles.profileMarkText}>{item.name.slice(0, 1).toUpperCase()}</Text></View>
            <View style={styles.profileCopy}><Text style={styles.profileName}>{item.name}</Text><Text style={styles.profileMeta}>{Object.values(item.mappings).filter((mapping) => mapping.action !== "none").length} ações configuradas</Text></View>
            <View style={[styles.radio, selectedId === item.id && styles.radioSelected]}>{selectedId === item.id && <View style={styles.radioInner} />}</View>
          </Pressable>
        )}
        ListFooterComponent={
          <>
            <Pressable onPress={startMapping} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}><Text style={styles.primaryButtonText}>Abrir mapeador</Text><Text style={styles.primaryArrow}>→</Text></Pressable>
            <View style={styles.quickRow}>
              <Pressable onPress={() => router.push("/settings")} style={({ pressed }) => [styles.quickButton, pressed && styles.pressed]}><Text style={styles.quickIcon}>⌁</Text><Text style={styles.quickText}>Abrir em segundo plano</Text></Pressable>
              <Pressable onPress={refreshUpdate} disabled={checkingUpdate} style={({ pressed }) => [styles.quickButton, pressed && styles.pressed]}>{checkingUpdate ? <ActivityIndicator size="small" color={colors.primary} /> : <Text style={styles.quickIcon}>↻</Text>}<Text style={styles.quickText}>Verificar update</Text></Pressable>
            </View>
            <Text style={styles.footerNote}>Sem root • sem app externo • permissões controladas por você</Text>
          </>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background },
  content: { paddingTop: 18, paddingBottom: 32, gap: 12 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 22 },
  eyebrow: { color: colors.primary, fontSize: 11, fontWeight: "800", letterSpacing: 1.8 },
  title: { color: colors.text, fontSize: 28, fontWeight: "800", marginTop: 6, letterSpacing: -0.5 },
  settingsButton: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 14, width: 46, height: 46, alignItems: "center", justifyContent: "center" },
  settingsIcon: { color: colors.text, fontSize: 22 },
  connectionCard: { borderRadius: 20, padding: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  connectionCardConnected: { borderColor: "#28674F", backgroundColor: "#10241E" },
  connectionTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 8, backgroundColor: colors.muted },
  statusDotConnected: { backgroundColor: colors.primary },
  cardLabel: { color: colors.muted, fontSize: 10, fontWeight: "800", letterSpacing: 1.2, flex: 1 },
  pill: { borderRadius: 20, paddingHorizontal: 9, paddingVertical: 5 },
  pillMuted: { backgroundColor: colors.elevated },
  pillSuccess: { backgroundColor: colors.primarySoft },
  pillWarning: { backgroundColor: "#3B3018" },
  pillText: { color: colors.muted, fontSize: 10, fontWeight: "700" },
  controllerName: { color: colors.text, fontSize: 20, fontWeight: "700", marginTop: 18 },
  helper: { color: colors.muted, lineHeight: 20, marginTop: 6 },
  permissionLine: { flexDirection: "row", gap: 8, marginTop: 16, paddingTop: 14, borderTopColor: colors.border, borderTopWidth: 1 },
  permissionIcon: { color: colors.primary, borderColor: colors.primary, borderWidth: 1, borderRadius: 8, width: 16, height: 16, textAlign: "center", fontSize: 11, lineHeight: 14, fontWeight: "800" },
  permissionText: { color: colors.muted, fontSize: 12, lineHeight: 17, flex: 1 },
  updateBanner: { backgroundColor: "#2A2517", borderColor: "#66521F", borderWidth: 1, borderRadius: 16, padding: 14, flexDirection: "row", alignItems: "center", marginTop: 4 },
  updateCopy: { flex: 1 },
  updateTitle: { color: colors.warning, fontWeight: "800", fontSize: 14 },
  updateText: { color: "#C9B978", marginTop: 4, fontSize: 12 },
  updateArrow: { color: colors.warning, fontSize: 24, marginLeft: 10 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 18, marginBottom: 2 },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: "800" },
  link: { color: colors.primary, fontWeight: "700", fontSize: 13 },
  profileCard: { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 13, flexDirection: "row", alignItems: "center", marginBottom: 8 },
  profileCardSelected: { borderColor: colors.primary, backgroundColor: "#10241E" },
  profileMark: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.elevated, alignItems: "center", justifyContent: "center" },
  profileMarkSelected: { backgroundColor: colors.primary },
  profileMarkText: { color: colors.text, fontWeight: "800" },
  profileCopy: { flex: 1, marginLeft: 12 },
  profileName: { color: colors.text, fontSize: 14, fontWeight: "700" },
  profileMeta: { color: colors.muted, marginTop: 4, fontSize: 12 },
  radio: { width: 20, height: 20, borderRadius: 20, borderWidth: 1.5, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  radioSelected: { borderColor: colors.primary },
  radioInner: { width: 10, height: 10, borderRadius: 10, backgroundColor: colors.primary },
  primaryButton: { backgroundColor: colors.primary, borderRadius: 15, paddingVertical: 16, paddingHorizontal: 18, flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 12 },
  primaryButtonText: { color: "#07130F", fontSize: 15, fontWeight: "900" },
  primaryArrow: { color: "#07130F", fontSize: 21, position: "absolute", right: 18 },
  quickRow: { flexDirection: "row", gap: 8, marginTop: 2 },
  quickButton: { backgroundColor: colors.surface, borderRadius: 14, borderColor: colors.border, borderWidth: 1, flex: 1, minHeight: 64, alignItems: "center", justifyContent: "center", padding: 8 },
  quickIcon: { color: colors.primary, fontSize: 20, lineHeight: 22 },
  quickText: { color: colors.muted, fontSize: 11, fontWeight: "700", textAlign: "center", marginTop: 4 },
  footerNote: { color: "#5B6877", textAlign: "center", fontSize: 11, marginTop: 12 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.985 }] },
});
