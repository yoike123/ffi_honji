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
     * sm2cin - 整数の加算
     * @brief  ２つの整数引数の足し算を行います。。
     * @detail
     * @param [in]  int a;      パラメータ１
     * @param [in]  int b;      パラメータ２
     * @param [out] int *sum;   加算結果の格納先
     * @return 0-OK, 1-NG
     *
     * @author Y.Ishimaru
     * @date 2026.06.26 作成着手
     */
    __declspec(dllexport) int /* _stdcall */ sm2cin(int a, int b, int* sum) {

        if (sum != NULL) {
            *sum = a + b;
            return 0;
        }
        else {
            return 1;
        }
    }

#ifdef __cplusplus
}
#endif

