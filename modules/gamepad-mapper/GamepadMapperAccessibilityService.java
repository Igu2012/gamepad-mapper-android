package com.igu2012.gamepadmapper;

import android.accessibilityservice.AccessibilityService;
import android.accessibilityservice.AccessibilityServiceInfo;
import android.accessibilityservice.GestureDescription;
import android.view.accessibility.AccessibilityEvent;
import android.graphics.Path;
import android.graphics.PixelFormat;
import android.os.Build;
import android.view.Gravity;
import android.view.KeyEvent;
import android.view.View;
import android.view.WindowManager;
import android.widget.TextView;
import java.util.HashMap;
import java.util.Map;

/**
 * Native bridge for the no-root MVP. Android delivers compatible Bluetooth/USB
 * HID controller key events here after the user enables the accessibility service.
 * Tap coordinates are intentionally simple defaults and can be replaced by the
 * React Native profile editor in a later native-module iteration.
 */
public class GamepadMapperAccessibilityService extends AccessibilityService {
  private WindowManager windowManager;
  private final Map<Integer, float[]> buttonPositions = new HashMap<>();
  private final Map<Integer, View> overlayViews = new HashMap<>();

  @Override public void onServiceConnected() {
    super.onServiceConnected();
    AccessibilityServiceInfo info = new AccessibilityServiceInfo();
    info.eventTypes = AccessibilityEvent.TYPES_ALL_MASK;
    info.feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC;
    info.flags = AccessibilityServiceInfo.FLAG_REQUEST_FILTER_KEY_EVENTS;
    setServiceInfo(info);
    buttonPositions.put(KeyEvent.KEYCODE_BUTTON_A, new float[]{0.78f, 0.68f});
    buttonPositions.put(KeyEvent.KEYCODE_BUTTON_B, new float[]{0.88f, 0.58f});
    buttonPositions.put(KeyEvent.KEYCODE_BUTTON_X, new float[]{0.68f, 0.58f});
    buttonPositions.put(KeyEvent.KEYCODE_BUTTON_Y, new float[]{0.78f, 0.48f});
    buttonPositions.put(KeyEvent.KEYCODE_BUTTON_L1, new float[]{0.18f, 0.22f});
    buttonPositions.put(KeyEvent.KEYCODE_BUTTON_R1, new float[]{0.82f, 0.22f});
  }

  public void setOverlayVisible(boolean visible) {
    if (visible) showOverlay(); else hideOverlay();
  }

  private void showOverlay() {
    if (windowManager == null) windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);
    if (!overlayViews.isEmpty()) return;
    for (Map.Entry<Integer, float[]> entry : buttonPositions.entrySet()) {
      TextView button = new TextView(this);
      button.setText(keyLabel(entry.getKey()));
      button.setTextColor(0xff67e8b5);
      button.setTextSize(11);
      button.setGravity(Gravity.CENTER);
      button.setBackgroundColor(0xaa183b34);
      WindowManager.LayoutParams params = new WindowManager.LayoutParams(86, 64,
          Build.VERSION.SDK_INT >= Build.VERSION_CODES.O ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY : WindowManager.LayoutParams.TYPE_PHONE,
          WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE | WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
          PixelFormat.TRANSLUCENT);
      params.gravity = Gravity.TOP | Gravity.START;
      params.x = Math.round(entry.getValue()[0] * getResources().getDisplayMetrics().widthPixels) - 43;
      params.y = Math.round(entry.getValue()[1] * getResources().getDisplayMetrics().heightPixels) - 32;
      try { windowManager.addView(button, params); overlayViews.put(entry.getKey(), button); } catch (Exception ignored) { }
    }
  }

  private void hideOverlay() {
    if (windowManager == null) return;
    for (View view : overlayViews.values()) { try { windowManager.removeView(view); } catch (Exception ignored) { } }
    overlayViews.clear();
  }

  @Override public boolean onKeyEvent(KeyEvent event) {
    if (event.getAction() != KeyEvent.ACTION_DOWN) return false;
    float[] position = buttonPositions.get(event.getKeyCode());
    if (position != null) dispatchTap(position[0], position[1]);
    return position != null;
  }

  private void dispatchTap(float relativeX, float relativeY) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.N) return;
    float x = relativeX * getResources().getDisplayMetrics().widthPixels;
    float y = relativeY * getResources().getDisplayMetrics().heightPixels;
    Path path = new Path(); path.moveTo(x, y);
    GestureDescription.StrokeDescription stroke = new GestureDescription.StrokeDescription(path, 0, 45);
    dispatchGesture(new GestureDescription.Builder().addStroke(stroke).build(), null, null);
  }

  private String keyLabel(int keyCode) {
    if (keyCode == KeyEvent.KEYCODE_BUTTON_A) return "A";
    if (keyCode == KeyEvent.KEYCODE_BUTTON_B) return "B";
    if (keyCode == KeyEvent.KEYCODE_BUTTON_X) return "X";
    if (keyCode == KeyEvent.KEYCODE_BUTTON_Y) return "Y";
    if (keyCode == KeyEvent.KEYCODE_BUTTON_L1) return "L1";
    if (keyCode == KeyEvent.KEYCODE_BUTTON_R1) return "R1";
    return "•";
  }

  @Override public void onInterrupt() { }
  @Override public void onAccessibilityEvent(AccessibilityEvent event) { }
  @Override public void onDestroy() { hideOverlay(); super.onDestroy(); }
}
