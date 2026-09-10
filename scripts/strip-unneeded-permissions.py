from pathlib import Path
import re

manifest = Path(__file__).resolve().parents[1] / "android/app/src/main/AndroidManifest.xml"
text = manifest.read_text()
unnecessary = {
    "android.permission.RECORD_AUDIO",
    "android.permission.MODIFY_AUDIO_SETTINGS",
    "android.permission.POST_NOTIFICATIONS",
    "android.permission.READ_EXTERNAL_STORAGE",
    "android.permission.WRITE_EXTERNAL_STORAGE",
    "android.permission.USE_BIOMETRIC",
    "android.permission.USE_FINGERPRINT",
    "android.permission.FOREGROUND_SERVICE",
    "android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK",
}
for permission in unnecessary:
    text = re.sub(r'\s*<uses-permission\s+android:name="' + re.escape(permission) + r'"[^>]*/>', '', text)
manifest.write_text(text)
print("Cleaned Android permissions")
