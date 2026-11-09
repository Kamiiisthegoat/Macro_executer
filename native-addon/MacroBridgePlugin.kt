package com.custom.macroexecutor

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.text.TextUtils
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
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
                val result = runSingleEngine(language, code)
                val ret = JSObject().apply { put("output", result) }
                call.resolve(ret)
            } catch (e: Exception) {
                call.reject("Execution error: ${e.message}")
            }
        }
    }

    @PluginMethod
    fun executePipeline(call: PluginCall) {
        val blocks = call.getArray("blocks") ?: return call.reject("No pipeline blocks provided")

        activeJob?.cancel()
        activeJob = CoroutineScope(Dispatchers.IO).launch {
            try {
                val logs = mutableListOf<String>()
                for (i in 0 until blocks.length()) {
                    val block = blocks.getJSONObject(i)
                    val lang = block.optString("language", "javascript")
                    val code = block.optString("code", "")
                    val stepOut = runSingleEngine(lang, code)
                    logs.add("[Block ${i + 1} | ${lang.uppercase()}] $stepOut")
                }
                val ret = JSObject().apply { put("output", logs.joinToString("\n")) }
                call.resolve(ret)
            } catch (e: Exception) {
                call.reject("Pipeline error: ${e.message}")
            }
        }
    }

    private suspend fun runSingleEngine(language: String, code: String): String {
        return when (language.lowercase()) {
            "quickjs", "javascript", "js" -> runQuickJSNative(code)
            "luau" -> runLuauNative(code)
            "cpp", "c++" -> runCppRoutineNative(code, 540f, 1120f)
            "kotlin" -> runKotlinScript(code)
            else -> "Unsupported engine: $language"
        }
    }

    private suspend fun runKotlinScript(code: String): String {
        var count = 0
        val tapRegex = Regex("""tap\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*\)""")
        val waitRegex = Regex("""(?:wait|delay|sleep)\(\s*(\d+)\s*\)""")

        for (line in code.lines()) {
            val tapMatch = tapRegex.find(line)
            val waitMatch = waitRegex.find(line)
            if (tapMatch != null) {
                val x = tapMatch.groupValues.get(1).toFloat()
                val y = tapMatch.groupValues.get(2).toFloat()
                MacroAccessibilityService.tap(x, y, 50L)
                count++
            } else if (waitMatch != null) {
                val ms: Long = waitMatch.groupValues.get(1).toLong()
                delay(ms)
            }
        }
        if (count == 0) {
            MacroAccessibilityService.tap(540f, 1120f, 50L)
            count = 1
        }
        return "Kotlin native executed ($count tap(s))"
    }

    @PluginMethod
    fun stopMacro(call: PluginCall) {
        activeJob?.cancel()
        call.resolve()
    }

    @PluginMethod
    fun checkAndRequestAllPermissions(call: PluginCall) {
        val hasAccessibility = isAccessibilityEnabled(context)
        val hasOverlay = Settings.canDrawOverlays(context)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                activity?.let {
                    ActivityCompat.requestPermissions(it, arrayOf(Manifest.permission.POST_NOTIFICATIONS), 1001)
                }
            }
        }

        if (!hasOverlay) {
            val overlayIntent = Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:${context.packageName}")
            ).apply { flags = Intent.FLAG_ACTIVITY_NEW_TASK }
            context.startActivity(overlayIntent)
        } else if (!hasAccessibility) {
            val accIntent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(accIntent)
        }

        val ret = JSObject().apply {
            put("accessibility", hasAccessibility)
            put("overlay", hasOverlay)
        }
        call.resolve(ret)
    }

    @PluginMethod
    fun openAccessibilitySettings(call: PluginCall) {
        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        context.startActivity(intent)
        call.resolve()
    }

    private fun isAccessibilityEnabled(ctx: Context): Boolean {
        val expectedService = "${ctx.packageName}/${MacroAccessibilityService::class.java.canonicalName}"
        val enabledServices = Settings.Secure.getString(
            ctx.contentResolver,
            Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
        ) ?: return false
        val splitter = TextUtils.SimpleStringSplitter(':')
        splitter.setString(enabledServices)
        while (splitter.hasNext()) {
            if (splitter.next().equals(expectedService, ignoreCase = true)) return true
        }
        return false
    }
}
