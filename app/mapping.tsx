import { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { defaultMappings, loadProfiles, saveProfiles, type ButtonMapping, type GameProfile, type MappingAction } from "@/lib/profile-store";

const colors = { background: "#0B0F14", surface: "#121922", elevated: "#182331", border: "#263547", text: "#F5F7FA", muted: "#8D9AAC", primary: "#67E8B5", primarySoft: "#183B34", warning: "#F6C85F" };
const actionLabels: Record<MappingAction, string> = { tap: "Toque", swipe: "Arrastar", key: "Tecla", none: "Desativado" };
const actionOrder: MappingAction[] = ["tap", "swipe", "key", "none"];

export default function MappingScreen() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<GameProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<GameProfile>();
  const [selectedButton, setSelectedButton] = useState<string>();

  useEffect(() => {
    loadProfiles().then((loaded) => { setProfiles(loaded); setActiveProfile(loaded[0]); });
  }, []);

  const mappings = useMemo(() => Object.entries(activeProfile?.mappings ?? defaultMappings), [activeProfile]);

  const cycleMapping = (button: string) => {
    if (!activeProfile) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const current = activeProfile.mappings[button]?.action ?? "tap";
    const next = actionOrder[(actionOrder.indexOf(current) + 1) % actionOrder.length];
    const mapping: ButtonMapping = { ...(activeProfile.mappings[button] ?? { label: button }), action: next };
    const nextProfile = { ...activeProfile, updatedAt: new Date().toISOString(), mappings: { ...activeProfile.mappings, [button]: mapping } };
    setActiveProfile(nextProfile);
    setProfiles((currentProfiles) => currentProfiles.map((profile) => profile.id === nextProfile.id ? nextProfile : profile));
    saveProfiles(profiles.map((profile) => profile.id === nextProfile.id ? nextProfile : profile));
  };

  const saveAndExit = async () => {
    if (activeProfile) await saveProfiles(profiles.map((profile) => profile.id === activeProfile.id ? activeProfile : profile));
    router.back();
  };

  return (
    <ScreenContainer edges={["top", "left", "right", "bottom"]} style={styles.screen} containerClassName="bg-[#0B0F14]" className="px-5">
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}><Pressable onPress={() => router.back()}><Text style={styles.back}>‹</Text></Pressable><View style={styles.headerCopy}><Text style={styles.eyebrow}>MAPEADOR</Text><Text style={styles.title}>Configurar botões</Text></View><Pressable onPress={() => router.push("/settings")}><Text style={styles.settings}>⚙</Text></Pressable></View>
      <View style={styles.profilePicker}><Text style={styles.pickerLabel}>PERFIL ATIVO</Text><Pressable onPress={() => setSelectedButton("__profile__")} style={styles.pickerButton}><Text style={styles.pickerText}>{activeProfile?.name ?? "Carregando..."}</Text><Text style={styles.chevron}>⌄</Text></Pressable></View>
      <View style={styles.preview}><View style={styles.previewTop}><Text style={styles.previewTitle}>Toque em uma ação para alternar</Text><View style={styles.livePill}><View style={styles.liveDot} /><Text style={styles.liveText}>PRÉVIA</Text></View></View><View style={styles.phoneFrame}><View style={[styles.overlayButton, styles.btnDpad]}><Text style={styles.overlayText}>D-pad</Text></View><View style={[styles.overlayButton, styles.btnL1]}><Text style={styles.overlayText}>L1</Text></View><View style={[styles.overlayButton, styles.btnR1]}><Text style={styles.overlayText}>R1</Text></View><View style={[styles.overlayButton, styles.btnA]}><Text style={styles.overlayText}>A</Text></View><View style={[styles.overlayButton, styles.btnB]}><Text style={styles.overlayText}>B</Text></View><View style={[styles.overlayButton, styles.btnX]}><Text style={styles.overlayText}>X</Text></View><View style={[styles.overlayButton, styles.btnY]}><Text style={styles.overlayText}>Y</Text></View><Text style={styles.previewHint}>A sobreposição aparece sobre o jogo</Text></View></View>
      <FlatList data={mappings} keyExtractor={([key]) => key} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} renderItem={({ item: [button, mapping] }) => <Pressable onPress={() => cycleMapping(button)} style={({ pressed }) => [styles.mappingRow, pressed && styles.pressed]}><View style={styles.keyCap}><Text style={styles.keyText}>{button}</Text></View><View style={styles.mappingCopy}><Text style={styles.mappingName}>{button === "D-pad" || button.includes("stick") ? button : `Botão ${button}`}</Text><Text style={styles.mappingMeta}>Toque para alterar a ação</Text></View><View style={[styles.actionPill, mapping.action === "none" && styles.actionPillOff]}><Text style={[styles.actionText, mapping.action === "none" && styles.actionTextOff]}>{actionLabels[mapping.action]}</Text></View><Text style={styles.rowArrow}>›</Text></Pressable>} ListFooterComponent={<><Pressable onPress={() => Alert.alert("Perfil salvo", "As posições e ações foram salvas neste dispositivo.")} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Testar mapeamento</Text></Pressable><Pressable onPress={saveAndExit} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Salvar e sair</Text></Pressable></>} />
      <Modal transparent visible={selectedButton === "__profile__"} animationType="fade" onRequestClose={() => setSelectedButton(undefined)}><Pressable style={styles.modalBackdrop} onPress={() => setSelectedButton(undefined)}><View style={styles.profileModal}><Text style={styles.modalTitle}>Escolher perfil</Text>{profiles.map((profile) => <Pressable key={profile.id} onPress={() => { setActiveProfile(profile); setSelectedButton(undefined); }} style={styles.modalOption}><Text style={styles.modalOptionText}>{profile.name}</Text>{profile.id === activeProfile?.id && <Text style={styles.check}>✓</Text>}</Pressable>)}</View></Pressable></Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({ screen: { backgroundColor: colors.background }, content: { flex: 1 }, header: { flexDirection: "row", alignItems: "center", marginBottom: 20 }, back: { color: colors.text, fontSize: 36, lineHeight: 34, width: 30 }, headerCopy: { flex: 1, marginLeft: 8 }, eyebrow: { color: colors.primary, fontSize: 10, fontWeight: "800", letterSpacing: 1.7 }, title: { color: colors.text, fontSize: 23, fontWeight: "800", marginTop: 3 }, settings: { color: colors.text, fontSize: 22, padding: 8 }, profilePicker: { marginBottom: 14 }, pickerLabel: { color: colors.muted, fontSize: 10, fontWeight: "800", letterSpacing: 1.2, marginBottom: 7 }, pickerButton: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 13, padding: 13, flexDirection: "row", justifyContent: "space-between" }, pickerText: { color: colors.text, fontWeight: "700" }, chevron: { color: colors.muted, fontSize: 18, lineHeight: 15 }, preview: { borderRadius: 18, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, padding: 13, marginBottom: 14 }, previewTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }, previewTitle: { color: colors.muted, fontSize: 11 }, livePill: { flexDirection: "row", alignItems: "center", gap: 5 }, liveDot: { width: 6, height: 6, borderRadius: 6, backgroundColor: colors.primary }, liveText: { color: colors.primary, fontSize: 9, fontWeight: "800", letterSpacing: 1 }, phoneFrame: { height: 154, borderRadius: 15, backgroundColor: "#0D131A", borderColor: "#1E2C3A", borderWidth: 1, position: "relative", overflow: "hidden" }, overlayButton: { position: "absolute", width: 34, height: 26, borderRadius: 8, backgroundColor: colors.primarySoft, borderColor: colors.primary, borderWidth: 1, alignItems: "center", justifyContent: "center" }, overlayText: { color: colors.primary, fontSize: 10, fontWeight: "800" }, btnDpad: { left: 15, top: 60 }, btnL1: { left: 28, top: 15 }, btnR1: { right: 28, top: 15 }, btnA: { right: 40, top: 72 }, btnB: { right: 8, top: 48 }, btnX: { right: 72, top: 48 }, btnY: { right: 40, top: 25 }, previewHint: { color: "#475668", position: "absolute", bottom: 9, left: 0, right: 0, textAlign: "center", fontSize: 10 }, list: { paddingBottom: 24 }, mappingRow: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: 14, borderColor: colors.border, borderWidth: 1, padding: 10, marginBottom: 8 }, keyCap: { width: 40, height: 36, borderRadius: 10, backgroundColor: colors.elevated, alignItems: "center", justifyContent: "center" }, keyText: { color: colors.text, fontWeight: "800", fontSize: 11 }, mappingCopy: { flex: 1, marginLeft: 10 }, mappingName: { color: colors.text, fontSize: 13, fontWeight: "700" }, mappingMeta: { color: colors.muted, fontSize: 10, marginTop: 3 }, actionPill: { backgroundColor: colors.primarySoft, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8 }, actionPillOff: { backgroundColor: colors.elevated }, actionText: { color: colors.primary, fontSize: 10, fontWeight: "800" }, actionTextOff: { color: colors.muted }, rowArrow: { color: colors.muted, fontSize: 22, marginLeft: 7 }, secondaryButton: { borderColor: colors.border, borderWidth: 1, borderRadius: 14, alignItems: "center", paddingVertical: 14, marginTop: 6 }, secondaryButtonText: { color: colors.text, fontWeight: "700" }, primaryButton: { backgroundColor: colors.primary, borderRadius: 14, alignItems: "center", paddingVertical: 15, marginTop: 9 }, primaryButtonText: { color: "#07130F", fontWeight: "900" }, pressed: { opacity: 0.72 }, modalBackdrop: { flex: 1, backgroundColor: "#00000099", justifyContent: "center", padding: 25 }, profileModal: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 18, padding: 18 }, modalTitle: { color: colors.text, fontSize: 17, fontWeight: "800", marginBottom: 10 }, modalOption: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 14, borderBottomColor: colors.border, borderBottomWidth: 1 }, modalOptionText: { color: colors.text, fontWeight: "600" }, check: { color: colors.primary, fontWeight: "900" }, });
