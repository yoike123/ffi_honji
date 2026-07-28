<!-- /* vim:set ts=2 sw=2 sts=2 tw=80 et: */ -->
### Windows 64bit Electronと32bit C言語DLLの共存
### 目的
・最新のNodeJS-LTSでは、32ビット版は提供されなくなった。	32ビット版の NodeJSの最終バージョンは v22 で、2026年4月でサポート期限切れ。  
・近い将来、フロントエンドはAIが生成するようになる可能性があり、生成AIの実績豊富なのは、最新のLTSであると思われる。  
  
・このため、フロントエンド開発は最新の64bit NodeJS LTS環境にしておきたい。  
  
・一方で、業務の現場では、32bit-DLLは安定しており捨て難い。  
  
⇒フロントエンドとバックエンドを分けて、クライアント/サーバーモデルで連携する。  
  
(1)64bit Electron 最新LTSをフロントエンドとし、	バックエンドをffi-napi サーバー(port8033版)とする構成。  
  
(2)Chromeなどのブラウザーをフロントエンドとし、バックエンドをffi-napiサーバー(port80版）とする構成。  
(注)生成AIの実績は、Electronよりも一般ブラウザが先行すると予想されるため、	このタイプ２も想定に入れた。  
  
現時点で、これら２タイプのffi-napiバックエンドサーバーの開発を本プロジェクトの目的とする。  

また本プロジェクトの目的外ではあるが、将来、タイプ(1)、タイプ(2)のffi-napiサーバーをビジネス用途に通信プロトコルに互換性を持ったC言語で堅牢に実装することもかんがみ、本プロジェクトは機能仕様を洗い出すためのプロトタイプという位置づけとする。

### システム構成
![sys2](https://github.com/user-attachments/assets/c960dbf0-58f2-4a81-9a17-c20e628c2a81)  
  
![sys3](https://github.com/user-attachments/assets/83c21b37-2049-4781-9cea-d6431fb4fe5f)  

### Basic call example 1 from Electron(Client)  
in device1_32.dll, function "sm2cin" is defined as follkkow:
```C
__declspec(dllexport) int sm2cin() {
  return 3;
}
```

DLL call:
```javascript
let adll1 = await ffi_honji_cli(
              "./dll/device1_32.dll",
              {
	              "sm2cin": ["int",[]]
							});
const value = await adll1.ffi_call( "sm2cin");
console.log( "sm2cin()=", value);   // 3
```
This is simply ffi-napi style.

### Basic call example 2 from Electron(Client)  
in device2_32.dll, function "sm2cin" is defined as follow:
```C
__declspec(dllexport) int sm2cin(int a, int b, int* sum) {
  *sum = a + b;
  return 0;
}
```

DLL call:
```javascript
let adll2 = await ffi_honji_cli(
              "./dll/device2_32.dll",
              {
	              "sm2cin": ["int",["int", "int", ["int",1]]]
							});
const value = await adll2.ffi_call( "sm2cin", 1, 2, [0]);
console.log( "sm2cin()=", value);   // 0
console.log( "output arg[2]=", adll2.mojson.xotarg[2]);  // 3
```

### Basic call example 3 from Electron(Client)  
in device3_32.dll, function "sm2cin" is defined as follow:
```C
typedef struct { char a, short b, int c } TSTRUC;
__declspec(dllexport) int sm2cin( TSTRUC *s, int *sum) {
  *sum = s->a + s->b + s->c;
  return 0;
}
```

DLL call:
```javascript
let adll3 = await ffi_honji_cli(
              "./dll/device3_32.dll",
              {
                "sm2cin": ["int",[{a:"char", b:"short", c:"int"},1], ["int", 1]]
              });
const value = await adll3.ffi_call( "sm2cin", [{a:1, b:2, c:4}], [0]);
console.log( "sm2cin()=", value);
console.log( "output arg[1]=", adll3.mojson.xotarg[1]);  // 7
```

