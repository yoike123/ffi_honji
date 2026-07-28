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
     * sm2cin - 構造体渡しのテスト関数
     * @brief 構造体メンバの加算結果を返します。
     * @detail
     * @param [in]      struct  a;      引数構造体
     * @param [out]     int     *sum;    加算結果
     * @return 0-O<, 1-NG
     *
     * @author Y.Ishimaru
     * @date 2026.06.26 作成着手
     */
    typedef struct {
        char        a;
        short int   b;
        int         c;
    } TSTRUC;

    __declspec(dllexport) int /*_stdcall*/ sm2cin(TSTRUC* a, int* sum) {

        if (a != NULL && sum != NULL) {
            *sum = (int)a->a + (int)a->b + a->c;
            return 0;
        }
        else {
            return 1;
        }
    }

#ifdef __cplusplus
}
#endif

