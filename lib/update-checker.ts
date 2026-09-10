import * as Linking from "expo-linking";
import Constants from "expo-constants";

export const UPDATE_REPOSITORY = "Igu2012/gamepad-mapper-android";
const RELEASES_API = `https://api.github.com/repos/${UPDATE_REPOSITORY}/releases/latest`;

export type UpdateInfo = {
  available: boolean;
  version?: string;
  notes?: string;
  downloadUrl?: string;
  releaseUrl?: string;
};

function versionParts(version: string) {
  return version.replace(/^v/i, "").split(".").map((part) => Number.parseInt(part, 10) || 0);
}

function isNewer(remote: string, local: string) {
  const a = versionParts(remote);
  const b = versionParts(local);
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    if ((a[index] ?? 0) !== (b[index] ?? 0)) return (a[index] ?? 0) > (b[index] ?? 0);
  }
  return false;
}

export async function checkForUpdate(): Promise<UpdateInfo> {
  const localVersion = Constants.expoConfig?.version ?? "1.0.0";
  try {
    const response = await fetch(RELEASES_API, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!response.ok) return { available: false };
    const release = await response.json() as {
      tag_name?: string;
      body?: string;
      html_url?: string;
      assets?: Array<{ name?: string; browser_download_url?: string }>;
    };
    const remoteVersion = release.tag_name ?? "";
    const apk = release.assets?.find((asset) => asset.name?.toLowerCase().endsWith(".apk"));
    return {
      available: Boolean(remoteVersion && isNewer(remoteVersion, localVersion)),
      version: remoteVersion.replace(/^v/i, ""),
      notes: release.body,
      downloadUrl: apk?.browser_download_url,
      releaseUrl: release.html_url,
    };
  } catch {
    return { available: false };
  }
}

export async function openUpdate(info: UpdateInfo) {
  const url = info.downloadUrl ?? info.releaseUrl ?? `https://github.com/${UPDATE_REPOSITORY}/releases`;
  await Linking.openURL(url);
}
