package com.custom.macroexecutor

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.GestureDescription
import android.graphics.Path
import android.view.accessibility.AccessibilityEvent

class MacroAccessibilityService : AccessibilityService() {
    companion object {
        var instance: MacroAccessibilityService? = null

        @JvmStatic
        fun tap(x: Float, y: Float, durationMs: Long = 50L) {
            val service = instance ?: return
            val path = Path().apply { moveTo(x, y) }
            val stroke = GestureDescription.StrokeDescription(path, 0L, durationMs)
            val gesture = GestureDescription.Builder().addStroke(stroke).build()
            service.dispatchGesture(gesture, null, null)
        }

        @JvmStatic
        fun swipe(x1: Float, y1: Float, x2: Float, y2: Float, durationMs: Long = 200L) {
            val service = instance ?: return
            val path = Path().apply {
                moveTo(x1, y1)
                lineTo(x2, y2)
            }
            val stroke = GestureDescription.StrokeDescription(path, 0L, durationMs)
            val gesture = GestureDescription.Builder().addStroke(stroke).build()
            service.dispatchGesture(gesture, null, null)
        }
    }

    override fun onServiceConnected() { instance = this }
    override fun onAccessibilityEvent(event: AccessibilityEvent?) {}
    override fun onInterrupt() { instance = null }
}

