package com.custom.macroexecutor

import android.content.Intent
import android.provider.Settings
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch

@CapacitorPlugin(name = "MacroBridge")
class MacroBridgePlugin : Plugin() {
    private var activeJob: Job? = null

    companion object {
        init {
            System.loadLibrary("macro_engine")
        }
    }

    external fun runQuickJSNative(code: String): String
    external fun runLuauNative(code: String): String
    external fun runCppRoutineNative(routineId: String, x: Float, y: Float): String

    @PluginMethod
    fun executeMacro(call: PluginCall) {
        val language = call.getString("language") ?: "javascript"
        val code = call.getString("code") ?: ""

        activeJob?.cancel()
        activeJob = CoroutineScope(Dispatchers.IO).launch {
            try {
                val result = when (language.lowercase()) {
                    "quickjs", "javascript" -> runQuickJSNative(code)
                    "luau" -> runLuauNative(code)
                    "cpp", "c++" -> runCppRoutineNative(code, 540f, 1120f)
                    "kotlin" -> {
                        MacroAccessibilityService.tap(540f, 1120f, 50L)
                        "Kotlin native tap dispatched"
                    }
                    else -> "Unsupported engine: $language"
                }
                val ret = JSObject().apply { put("output", result) }
                call.resolve(ret)
            } catch (e: Exception) {
                call.reject("Execution error: ${e.message}")
            }
        }
    }

    @PluginMethod
    fun stopMacro(call: PluginCall) {
        activeJob?.cancel()
        call.resolve()
    }

    @PluginMethod
    fun openAccessibilitySettings(call: PluginCall) {
        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        context.startActivity(intent)
        call.resolve()
    }
}

