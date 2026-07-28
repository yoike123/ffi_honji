// dllmain.cpp : DLL アプリケーションのエントリ ポイントを定義します。
#include "pch.h"
#include <stdio.h>

BOOL APIENTRY DllMain( HMODULE hModule,
                       DWORD  ul_reason_for_call,
                       LPVOID lpReserved
                     )
{
    switch (ul_reason_for_call)
    {
    case DLL_PROCESS_ATTACH:
    case DLL_THREAD_ATTACH:
    case DLL_THREAD_DETACH:
    case DLL_PROCESS_DETACH:
        break;
    }
    return TRUE;
}

#ifdef __cplusplus
extern "C" {
#endif

/**
 * sm2cin - シンプルなDLL関数
 * @brief  単純に戻り値を返します。
 * @detail
 * @return 3 - OK
 *
 * @author Y.Ishimaru
 * @date 2026.06.26 作成着手
 */
__declspec(dllexport) int /* _stdcall */ sm2cin() {
    int	   xrtcd1;
    xrtcd1 = 2;
    xrtcd1 = xrtcd1 + 1;
    return xrtcd1;
}

#ifdef __cplusplus
}
#endif