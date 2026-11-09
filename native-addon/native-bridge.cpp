#include <jni.h>
#include <string>
#include <cstring>
#include <unistd.h>
#include "quickjs/quickjs.h"
#include "lua.h"
#include "lualib.h"
#include "luacode.h"

static JavaVM* g_vm = nullptr;
static jclass g_serviceClass = nullptr;
static jmethodID g_tapMethod = nullptr;
static jmethodID g_swipeMethod = nullptr;
static std::string g_execLog;

jint JNI_OnLoad(JavaVM* vm, void*) {
    g_vm = vm;
    JNIEnv* env;
    if (vm->GetEnv(reinterpret_cast<void**>(&env), JNI_VERSION_1_6) != JNI_OK) return -1;
    jclass localCls = env->FindClass("com/custom/macroexecutor/MacroAccessibilityService");
    if (localCls) {
        g_serviceClass = reinterpret_cast<jclass>(env->NewGlobalRef(localCls));
        g_tapMethod = env->GetStaticMethodID(g_serviceClass, "tap", "(FFJ)V");
        g_swipeMethod = env->GetStaticMethodID(g_serviceClass, "swipe", "(FFFFJ)V");
    }
    return JNI_VERSION_1_6;
}

void nativeTap(float x, float y, long durationMs = 50) {
    if (!g_vm || !g_serviceClass || !g_tapMethod) return;
    JNIEnv* env;
    bool attached = false;
    if (g_vm->GetEnv(reinterpret_cast<void**>(&env), JNI_VERSION_1_6) == JNI_EDETACHED) {
        g_vm->AttachCurrentThread(&env, nullptr);
        attached = true;
    }
    env->CallStaticVoidMethod(g_serviceClass, g_tapMethod, x, y, (jlong)durationMs);
    if (attached) g_vm->DetachCurrentThread();
}

void nativeSwipe(float x1, float y1, float x2, float y2, long durationMs = 200) {
    if (!g_vm || !g_serviceClass || !g_swipeMethod) return;
    JNIEnv* env;
    bool attached = false;
    if (g_vm->GetEnv(reinterpret_cast<void**>(&env), JNI_VERSION_1_6) == JNI_EDETACHED) {
        g_vm->AttachCurrentThread(&env, nullptr);
        attached = true;
    }
    env->CallStaticVoidMethod(g_serviceClass, g_swipeMethod, x1, y1, x2, y2, (jlong)durationMs);
    if (attached) g_vm->DetachCurrentThread();
}

static JSValue qjs_log(JSContext* ctx, JSValueConst, int argc, JSValueConst* argv) {
    for (int i = 0; i < argc; i++) {
        const char* str = JS_ToCString(ctx, *(argv + i));
        if (str) {
            if (!g_execLog.empty()) g_execLog += "\n";
            g_execLog += str;
            JS_FreeCString(ctx, str);
        }
    }
    return JS_UNDEFINED;
}

static JSValue qjs_tap(JSContext* ctx, JSValueConst, int argc, JSValueConst* argv) {
    double x = 0, y = 0;
    int64_t dur = 50;
    if (argc >= 2) {
        JS_ToFloat64(ctx, &x, *(argv + 0));
        JS_ToFloat64(ctx, &y, *(argv + 1));
    }
    if (argc >= 3) JS_ToInt64(ctx, &dur, *(argv + 2));
    nativeTap((float)x, (float)y, (long)dur);
    return JS_UNDEFINED;
}

static JSValue qjs_swipe(JSContext* ctx, JSValueConst, int argc, JSValueConst* argv) {
    double x1 = 0, y1 = 0, x2 = 0, y2 = 0;
    int64_t dur = 200;
    if (argc >= 4) {
        JS_ToFloat64(ctx, &x1, *(argv + 0));
        JS_ToFloat64(ctx, &y1, *(argv + 1));
        JS_ToFloat64(ctx, &x2, *(argv + 2));
        JS_ToFloat64(ctx, &y2, *(argv + 3));
    }
    if (argc >= 5) JS_ToInt64(ctx, &dur, *(argv + 4));
    nativeSwipe((float)x1, (float)y1, (float)x2, (float)y2, (long)dur);
    return JS_UNDEFINED;
}

static JSValue qjs_wait(JSContext* ctx, JSValueConst, int argc, JSValueConst* argv) {
    int32_t ms = 0;
    if (argc >= 1) JS_ToInt32(ctx, &ms, *(argv + 0));
    if (ms > 0) usleep(ms * 1000);
    return JS_UNDEFINED;
}

static std::string getQuickJSError(JSContext* ctx) {
    JSValue exc = JS_GetException(ctx);
    const char* msg = JS_ToCString(ctx, exc);
    std::string errStr = msg ? msg : "Unknown QuickJS Error";
    if (msg) JS_FreeCString(ctx, msg);

    JSValue stack = JS_GetPropertyStr(ctx, exc, "stack");
    if (!JS_IsUndefined(stack)) {
        const char* stackStr = JS_ToCString(ctx, stack);
        if (stackStr && strlen(stackStr) > 0) {
            errStr += " | ";
            errStr += stackStr;
        }
        if (stackStr) JS_FreeCString(ctx, stackStr);
    }
    JS_FreeValue(ctx, stack);
    JS_FreeValue(ctx, exc);
    return errStr;
}

static int luau_print(lua_State* L) {
    int n = lua_gettop(L);
    std::string line;
    for (int i = 1; i <= n; i++) {
        size_t len;
        const char* s = luaL_tolstring(L, i, &len);
        if (i > 1) line += "\t";
        if (s) line += s;
        lua_pop(L, 1);
    }
    if (!g_execLog.empty()) g_execLog += "\n";
    g_execLog += line;
    return 0;
}

static int luau_tap(lua_State* L) {
    float x = (float)luaL_checknumber(L, 1);
    float y = (float)luaL_checknumber(L, 2);
    long dur = lua_gettop(L) >= 3 ? (long)luaL_checkinteger(L, 3) : 50L;
    nativeTap(x, y, dur);
    return 0;
}

static int luau_swipe(lua_State* L) {
    float x1 = (float)luaL_checknumber(L, 1);
    float y1 = (float)luaL_checknumber(L, 2);
    float x2 = (float)luaL_checknumber(L, 3);
    float y2 = (float)luaL_checknumber(L, 4);
    long dur = lua_gettop(L) >= 5 ? (long)luaL_checkinteger(L, 5) : 200L;
    nativeSwipe(x1, y1, x2, y2, dur);
    return 0;
}

static int luau_wait(lua_State* L) {
    double val = luaL_checknumber(L, 1);
    int ms = (val < 30.0 && val > 0.0) ? (int)(val * 1000.0) : (int)val;
    if (ms > 0) usleep(ms * 1000);
    return 0;
}

extern "C" JNIEXPORT jstring JNICALL
Java_com_custom_macroexecutor_MacroBridgePlugin_runQuickJSNative(JNIEnv* env, jobject, jstring jcode) {
    g_execLog.clear();
    const char* code = env->GetStringUTFChars(jcode, nullptr);
    JSRuntime* rt = JS_NewRuntime();
    JSContext* ctx = JS_NewContext(rt);
    JSValue global = JS_GetGlobalObject(ctx);

    JSValue consoleObj = JS_NewObject(ctx);
    JS_SetPropertyStr(ctx, consoleObj, "log", JS_NewCFunction(ctx, qjs_log, "log", 1));
    JS_SetPropertyStr(ctx, consoleObj, "warn", JS_NewCFunction(ctx, qjs_log, "warn", 1));
    JS_SetPropertyStr(ctx, consoleObj, "error", JS_NewCFunction(ctx, qjs_log, "error", 1));
    JS_SetPropertyStr(ctx, global, "console", consoleObj);
    JS_SetPropertyStr(ctx, global, "print", JS_NewCFunction(ctx, qjs_log, "print", 1));
    JS_SetPropertyStr(ctx, global, "log", JS_NewCFunction(ctx, qjs_log, "log", 1));

    JS_SetPropertyStr(ctx, global, "tap", JS_NewCFunction(ctx, qjs_tap, "tap", 3));
    JS_SetPropertyStr(ctx, global, "click", JS_NewCFunction(ctx, qjs_tap, "click", 3));
    JS_SetPropertyStr(ctx, global, "hold", JS_NewCFunction(ctx, qjs_tap, "hold", 3));
    JS_SetPropertyStr(ctx, global, "swipe", JS_NewCFunction(ctx, qjs_swipe, "swipe", 5));
    JS_SetPropertyStr(ctx, global, "wait", JS_NewCFunction(ctx, qjs_wait, "wait", 1));
    JS_SetPropertyStr(ctx, global, "sleep", JS_NewCFunction(ctx, qjs_wait, "sleep", 1));

    JSValue val = JS_Eval(ctx, code, strlen(code), "<macro.js>", JS_EVAL_TYPE_GLOBAL);
    std::string out;
    if (JS_IsException(val)) {
        out = "JS Error: " + getQuickJSError(ctx);
    } else {
        out = g_execLog.empty() ? "QuickJS Execution Complete" : g_execLog + "\n[QuickJS Done]";
    }

    JS_FreeValue(ctx, val);
    JS_FreeValue(ctx, global);
    JS_FreeContext(ctx);
    JS_FreeRuntime(rt);
    env->ReleaseStringUTFChars(jcode, code);
    return env->NewStringUTF(out.c_str());
}

extern "C" JNIEXPORT jstring JNICALL
Java_com_custom_macroexecutor_MacroBridgePlugin_runLuauNative(JNIEnv* env, jobject, jstring jcode) {
    g_execLog.clear();
    const char* code = env->GetStringUTFChars(jcode, nullptr);
    lua_State* L = luaL_newstate();
    luaL_openlibs(L);

    lua_pushcfunction(L, luau_print, "print");
    lua_setglobal(L, "print");
    lua_pushcfunction(L, luau_tap, "tap");
    lua_setglobal(L, "tap");
    lua_pushcfunction(L, luau_tap, "click");
    lua_setglobal(L, "click");
    lua_pushcfunction(L, luau_tap, "hold");
    lua_setglobal(L, "hold");
    lua_pushcfunction(L, luau_swipe, "swipe");
    lua_setglobal(L, "swipe");
    lua_pushcfunction(L, luau_wait, "wait");
    lua_setglobal(L, "wait");

    lua_newtable(L);
    lua_pushcfunction(L, luau_wait, "wait");
    lua_setfield(L, -2, "wait");
    lua_setglobal(L, "task");

    size_t bcSize = 0;
    char* bc = luau_compile(code, strlen(code), nullptr, &bcSize);
    std::string out;
    if (luau_load(L, "@macro.luau", bc, bcSize, 0) == 0) {
        if (lua_pcall(L, 0, 0, 0) != 0) {
            out = std::string("Luau Runtime Error: ") + lua_tostring(L, -1);
        } else {
            out = g_execLog.empty() ? "Luau Execution Complete" : g_execLog + "\n[Luau Done]";
        }
    } else {
        out = std::string("Luau Compile Error: ") + lua_tostring(L, -1);
    }

    free(bc);
    lua_close(L);
    env->ReleaseStringUTFChars(jcode, code);
    return env->NewStringUTF(out.c_str());
}

extern "C" JNIEXPORT jstring JNICALL
Java_com_custom_macroexecutor_MacroBridgePlugin_runCppRoutineNative(JNIEnv* env, jobject, jstring jcode, jfloat defaultX, jfloat defaultY) {
    const char* code = env->GetStringUTFChars(jcode, nullptr);
    std::string script(code);
    env->ReleaseStringUTFChars(jcode, code);

    int actions = 0;
    size_t pos = 0;
    while ((pos = script.find("tap(", pos)) != std::string::npos) {
        float x = defaultX, y = defaultY;
        if (sscanf(script.c_str() + pos, "tap(%f, %f)", &x, &y) == 2 ||
            sscanf(script.c_str() + pos, "tap(%f,%f)", &x, &y) == 2) {
            nativeTap(x, y, 40);
            actions++;
        }
        pos += 4;
    }
    if (actions == 0) {
        nativeTap(defaultX, defaultY, 40);
        actions = 1;
    }
    std::string res = "Native C++ NDK executed (" + std::to_string(actions) + " tap action(s))";
    return env->NewStringUTF(res.c_str());
}
