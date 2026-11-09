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

jint JNI_OnLoad(JavaVM* vm, void*) {
    g_vm = vm;
    JNIEnv* env;
    if (vm->GetEnv(reinterpret_cast<void**>(&env), JNI_VERSION_1_6) != JNI_OK) return -1;
    jclass localCls = env->FindClass("com/custom/macroexecutor/MacroAccessibilityService");
    if (localCls) {
        g_serviceClass = reinterpret_cast<jclass>(env->NewGlobalRef(localCls));
        g_tapMethod = env->GetStaticMethodID(g_serviceClass, "tap", "(FFJ)V");
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

// QuickJS bindings: tap(x, y) & wait(ms)
static JSValue qjs_tap(JSContext* ctx, JSValueConst, int argc, JSValueConst* argv) {
    double x = 0, y = 0;
    if (argc >= 2) { JS_ToFloat64(ctx, &x, argv[0]); JS_ToFloat64(ctx, &y, argv[1]); }
    nativeTap((float)x, (float)y);
    return JS_UNDEFINED;
}
static JSValue qjs_wait(JSContext* ctx, JSValueConst, int argc, JSValueConst* argv) {
    int32_t ms = 0;
    if (argc >= 1) JS_ToInt32(ctx, &ms, argv[0]);
    if (ms > 0) usleep(ms * 1000);
    return JS_UNDEFINED;
}

// Luau bindings: tap(x, y) & wait(ms)
static int luau_tap(lua_State* L) {
    float x = (float)luaL_checknumber(L, 1);
    float y = (float)luaL_checknumber(L, 2);
    nativeTap(x, y);
    return 0;
}
static int luau_wait(lua_State* L) {
    int ms = (int)luaL_checkinteger(L, 1);
    if (ms > 0) usleep(ms * 1000);
    return 0;
}

extern "C" JNIEXPORT jstring JNICALL
Java_com_custom_macroexecutor_MacroBridgePlugin_runQuickJSNative(JNIEnv* env, jobject, jstring jcode) {
    const char* code = env->GetStringUTFChars(jcode, nullptr);
    JSRuntime* rt = JS_NewRuntime();
    JSContext* ctx = JS_NewContext(rt);
    JSValue global = JS_GetGlobalObject(ctx);
    JS_SetPropertyStr(ctx, global, "tap", JS_NewCFunction(ctx, qjs_tap, "tap", 2));
    JS_SetPropertyStr(ctx, global, "wait", JS_NewCFunction(ctx, qjs_wait, "wait", 1));
    JS_SetPropertyStr(ctx, global, "sleep", JS_NewCFunction(ctx, qjs_wait, "sleep", 1));

    JSValue val = JS_Eval(ctx, code, strlen(code), "<quickjs>", JS_EVAL_TYPE_GLOBAL);
    std::string out = JS_IsException(val) ? "QuickJS Runtime Error" : "QuickJS Execution Complete";
    JS_FreeValue(ctx, val);
    JS_FreeValue(ctx, global);
    JS_FreeContext(ctx);
    JS_FreeRuntime(rt);
    env->ReleaseStringUTFChars(jcode, code);
    return env->NewStringUTF(out.c_str());
}

extern "C" JNIEXPORT jstring JNICALL
Java_com_custom_macroexecutor_MacroBridgePlugin_runLuauNative(JNIEnv* env, jobject, jstring jcode) {
    const char* code = env->GetStringUTFChars(jcode, nullptr);
    lua_State* L = luaL_newstate();
    luaL_openlibs(L);
    lua_pushcfunction(L, luau_tap, "tap");
    lua_setglobal(L, "tap");
    lua_pushcfunction(L, luau_wait, "wait");
    lua_setglobal(L, "wait");

    size_t bcSize = 0;
    char* bc = luau_compile(code, strlen(code), nullptr, &bcSize);
    std::string out = "Luau Execution Complete";
    if (luau_load(L, "@luau", bc, bcSize, 0) == 0) {
        if (lua_pcall(L, 0, 0, 0) != 0) out = lua_tostring(L, -1);
    } else {
        out = "Luau Syntax Error";
    }
    free(bc);
    lua_close(L);
    env->ReleaseStringUTFChars(jcode, code);
    return env->NewStringUTF(out.c_str());
}

extern "C" JNIEXPORT jstring JNICALL
Java_com_custom_macroexecutor_MacroBridgePlugin_runCppRoutineNative(JNIEnv* env, jobject, jstring, jfloat x, jfloat y) {
    nativeTap(x, y, 30);
    return env->NewStringUTF("Native C++ NDK tap executed");
}
