const { withAndroidManifest, withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const SERVICE_CLASS = ".GamepadMapperAccessibilityService";

module.exports = function withGamepadMapper(config) {
  config = withAndroidManifest(config, (mod) => {
    const manifest = mod.modResults.manifest;
    manifest["uses-permission"] = manifest["uses-permission"] || [];
    for (const name of ["android.permission.SYSTEM_ALERT_WINDOW", "android.permission.BLUETOOTH_CONNECT", "android.permission.BLUETOOTH_SCAN", "android.permission.FOREGROUND_SERVICE"]) {
      if (!manifest["uses-permission"].some((item) => item.$?.["android:name"] === name)) {
        manifest["uses-permission"].push({ $: { "android:name": name } });
      }
    }
    manifest.application = manifest.application || [{}];
    const application = manifest.application[0];
    application.service = application.service || [];
    if (!application.service.some((item) => item.$?.["android:name"] === SERVICE_CLASS)) {
      application.service.push({
        $: {
          "android:name": SERVICE_CLASS,
          "android:permission": "android.permission.BIND_ACCESSIBILITY_SERVICE",
          "android:exported": "true",
          "android:label": "Gamepad Mapper",
        },
        "intent-filter": [{ action: [{ $: { "android:name": "android.accessibilityservice.AccessibilityService" } }] }],
        "meta-data": [{ $: { "android:name": "android.accessibilityservice", "android:resource": "@xml/gamepad_mapper_accessibility_service" } }],
      });
    }
    return mod;
  });

  config = withDangerousMod(config, ["android", async (mod) => {
    const androidRoot = mod.modRequest.platformProjectRoot;
    const packagePath = path.join(androidRoot, "app", "src", "main", "java", "com", "igu2012", "gamepadmapper");
    const resourcePath = path.join(androidRoot, "app", "src", "main", "res", "xml");
    fs.mkdirSync(packagePath, { recursive: true });
    fs.mkdirSync(resourcePath, { recursive: true });
    fs.copyFileSync(path.join(config._internal.projectRoot, "modules", "gamepad-mapper", "GamepadMapperAccessibilityService.java"), path.join(packagePath, "GamepadMapperAccessibilityService.java"));
    fs.copyFileSync(path.join(config._internal.projectRoot, "modules", "gamepad-mapper", "gamepad_mapper_accessibility_service.xml"), path.join(resourcePath, "gamepad_mapper_accessibility_service.xml"));
    return mod;
  }]);
  return config;
};
