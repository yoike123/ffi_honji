'use strict';
/* vim:set ts=2 sw=2 sts=2 tw=80 et: */
/**
 * @file ffi_honji_svr.js
 * @brief ffi_napi サーバー の メインjs
 * @author Y.Ishimaru
 * @date 2026.07.08
 *
 * @detail:
 * node v16 での使用を想定しています。
 *
 * 変数命名規則：
 *   グローバル変数は a で始まる英数字。
 *   ローカル変数は x で始まる英数字。
 *   メンバー変数は m で始まる英数字。
 *   関数名は f で始まる英数字。
 */

// Module dependencies.
// CommonJS
const ffi = require('ffi-napi');
const ref = require('ref-napi');
const StructType = require('ref-struct-napi');
const ArrayType = require("ref-array-napi");


// Global letiables.
class THONJI {
                                        // command01で呼び出されたdll情報退避
  mdllct;                               // dll エントリー数
  mdllnm;                               // dll ファイル名配列
  mlibry;                               // lib.Library戻り値の退避先
  mfuncs;                               // 関数定義オブジェクト配列(変換前)
  m_napi;                               // ffi-napiオブジェクト配列(変換後)

  constructor() {
    this.mdllct = 0;
    this.mdllnm = [];
    this.mlibry = [];
    this.mfuncs = [];
    this.m_napi = [];
  }


  /**
   * fmesag - エラー番号からエラーメッセージへの変換
   * @brief 
   * @param[in]   xerrno  エラー番号
   * @return エラーメッセージ
   */
  #fmesag( xerrno) {

    let xmesag = "Unkown error.";
    switch (xerrno) {
      case 1:
        xmesag = "JSON parse error.";
        break;
      case 2:
        xmesag = "Member variable not found.";
        break;
      case 3:
        xmesag = "DLL function define parse error.";
        break;
      case 4:
        xmesag = "ffi.Library call error.";
        break;
      case 5:
        xmesag = "xinarg(xcmdno=2) parse error.";
        break;
      case 6:
        xmesag = "xotarg(xcmdno=2) make error.";
        break;
      default:
        break;
    }
    return xmesag;
  };


  /**
   * fcmd01_arg_parse - １つの関数宣言の変換
   * @brief 
   * @detail (1)ref-napi, ref-array-napi, ref-struct-napi を使わない場合は、
   *           パススルーする。
   *         (2)ref-napi, ref-array-napi, ref-struct-napi を使う場合は、
   *           uint8配列ポインタとする。
   * @param[in]   xarray  - １つの関数宣言の表現(JSON配列)
   * @return 変換結果の配列表現(JSON)
   */
  #parse01( xarray) {

    let xconverted_array = [];
    for ( let xindex = 0; xindex < xarray[1].length; xindex++) {
      if ( typeof xarray[1][xindex] == "string") {
        xconverted_array.push( xarray[1][xindex]);
      } else if ( Array.isArray( xarray[1][xindex])) {
        const xelement0 = xarray[1][xindex][0];

        if ( typeof xelement0 == "string") {
                                          // 配列引数のとき
          const xpointer = ref.refType( ref.types.uint8);
                                          // uint8ポインタとして変換する
          xconverted_array.push( xpointer);
        } else if ( typeof xelement0 == "object") {
          const xpointer = ref.refType( ref.types.uint8);
                                          // uint8ポインタとして変換する
          xconverted_array.push( xpointer);
                                          // オブジェクト(構造体宣言)のとき
        } else {
          throw "DLL function define parse error.";
        }
      } else {
        throw "DLL function define parse error.";
      }
    }

    let xreturn = [xarray[0]];            // 戻り値の型
    xreturn.push(xconverted_array);       // 変換結果

    return xreturn;
  };


  /**
   * fcmd01 - command 01 の実装
   * @brief 
   * @param[in]   xijson  Electron側から受け取ったリクエスト文字列(JSON形式)
   * example1)
   * ```c
   * int func01(void) {
   *   return 3;
   * }
   * ```
   *
   *   {					
   *     xcmdno: 1,                       // コマンド番号
   *     xdllnm: "./dll/device1_32.dll”   // dll ファイル名
   *     xfuncs: {
   *       func01: [ "int32”, []]
   *     }
   *   }	
   *
   * example2)
   * ```c
   * int func02(int a, int b, int *sum) {
   *   *sum = a + b;
   *   return 0;
   * }
   * ```
   *
   *   {					
   *     xcmdno: 1,                       // コマンド番号
   *     xdllnm: "./dll/device2_32.dll”   // dll ファイル名
   *     xfuncs: {
   *       func02: [ "int32”, [ "int32", "int32", ["int32", 1]]]
   *                                      // No.1 Element value(in)
   *                                      // No.2 Element value(in)
   *                                      // No.3 Element Array(in/out)
   *                                      //   1st Element: member type
   *                                      //   2nd Element: array length
   *     }
   *   }	
   *
   * example3)
   * ```c
   * typedef struct { char a, short b, int c } TSTRUC;
   * int func03(TSTRUC *a, int *sum) {
   *   *sum = a->a + a->b + a->c;
   *   return 0;
   * }
   * ```
   *   {					
   *     xcmdno: 1,                       // コマンド番号
   *     xdllnm: "./dll/device3_32.dll”   // dll ファイル名
   *     xfuncs: {
   *     func03: [ "int32”, [[{ a:”char”, b:”short”, c:”int32”}, 1], [“int32”, 1]],
   *   }	
   *                                      // No.1 Element pointer of structure(io)
   *                                      //   Javascript Object
   *                                      // No.3 Element pointer of array(in/out)
   *                                      //   1st Element: member type
   *                                      //   2nd Element: array length
   *     }
   *   
   * @return Electron側に応答すべきJSON文字列
   */
  #fcmd01( xijson) {

    const xdllnm = xijson.xdllnm;         // dll file name
    const xfuncs = xijson.xfuncs;         // dll function's define

    let xfnobj = {};                     // converted dll function's define
    try {
      let func = this.#parse01;
      Object.keys( xfuncs || {}).forEach( function (key) {
        xfnobj[key] = func( xfuncs[key]);
                                          // ffi-napi流の関数定義を変換したもの
      });
    } catch (e) {

                                          // DLL関数宣言パースエラー時
      let xojson = {
        xcmdno: 1,
        xdllnm: xdllnm,
        xfuncs: xfuncs,

        xlibno: 9999,

        xstats: "NG",
        xerrno: 3,
        xmesag: e.stack
      };
      return JSON.stringify( xojson);
    }

                                        // テーブルをサーチして、
                                        //   同一DLL名があれば、そこを使う
    let x_find = false;
    let xindex = 0;
    for ( xindex = 0; xindex < this.mdllct; xindex++) {
      if ( this.mdllnm[xindex] === xdllnm) {
        x_find = true;
        break;
      }
    }
    if ( x_find) {                      // 同一DLLファイル名がある
      this.mfuncs[xindex] = xfuncs;   // 関数呼び出し変換前
      this.m_napi[xindex] = xfnobj;   // 関数呼び出し変換後
      this.mlibry[xindex] = undefined;
    } else {
      this.mdllnm[xindex] = xdllnm;    // dllファイル名退避
      this.mfuncs[xindex] = xfuncs;    // 関数呼び出し変換前
      this.m_napi[xindex] = xfnobj;    // 関数呼び出し変換後

    }

    try {
      console.log( xdllnm);
      console.log( xfnobj);
      this.mlibry[xindex] = ffi.Library( xdllnm, xfnobj);
    } catch (e) {
      let xojson = {
        xcmdno: 1,
        xdllnm: xdllnm,
        xfuncs: xfuncs,

        xlibno: 9999,

        xstats: "NG",
        xerrno: 4,
        xmesag: this.#fmesag(4) + e.message
      };
      return JSON.stringify( xojson);
    }

    if (!x_find) {
      this.mdllct++;                    // エントリー数加算
    }

    let xojson = {
      xcmdno: 1,
      xdllnm: xdllnm,
      xfuncs: xfuncs,

      xlibno: (1 + xindex),

      xstats: "OK",
      xerrno: 0,
      xmesag: ""
    };
    return JSON.stringify( xojson);
  }

  /**
   * fcmd02 - command 02 の実装
   * @brief DLL関数を個別に呼び出す
   * @param[in]   xijson  Electron側から受け取ったリクエスト文字列(JSON形式)
   * @return Electron側に応答すべきJSON文字列
   */
  #fcmd02( xijson) {

    const xlibno = xijson.xlibno;         // ライブラリ番号
    const xfuncn = xijson.xfuncn;         // DLL関数名
    const xfuncs = this.mfuncs[xlibno-1][xfuncn]; // 返還前のオリジナル関数定義
    const xinarg = xijson.xinarg;         // INPUT引数

                                          //------------------
                                          // INPUT引数のパース
                                          //------------------
    let xargv = [];                       // DLL関数引数を蓄積する
    try {
      for ( let xindex = 0; xindex < xfuncs[1].length; xindex++) {
        if ( typeof xfuncs[1][xindex] == "string") {
                                          // ffi-napiの引数宣言のとき
          xargv.push( xinarg[xindex]);      // INPUT引数をパススルーして蓄積する

        } else if ( Array.isArray( xfuncs[1][xindex])) {
                                          // 引数が配列の先頭ポインタのとき
          const xelement0 = xfuncs[1][xindex][0];
                                          // 先頭要素
          if ( typeof xelement0 == "string") {
                                          // "int32"等のとき
            const xletType = ref.types[xelement0];
                                          // 配列の１要素の型
            const xletArray = ArrayType(xletType);
                                          // 配列型の取得

            const arr = new Array(xfuncs[1][xindex][1]).fill(0);
                                          // 値が０で長さが指定長の配列を生成する
            for ( let xindx2 = 0;
                  xindx2 < arr.length && xindx2 < xinarg[xindex].length;
                  xindx2++) {
                                          // 先頭から値を埋めていく
              arr[xindx2] = xinarg[xindex][xindx2];
            }
            const xletInstance = new xletArray( arr);
                                          // 配列インスタンスの生成
            const xuint8Array = Buffer.alloc( xletInstance.buffer.length);
                                          // uint8配列を生成

                                          // 配列インスタンスからuint8配列にcopy
            for ( let xindx2 = 0; xindx2 < xletInstance.buffer.length; xindx2++) {
              xuint8Array[xindx2] = xletInstance.buffer[xindx2];
            }

            xargv.push( xuint8Array);       // INPUT引数に蓄積する

          } else if ( typeof xelement0 == "object") {
                                          // 関数引数が構造体配列宣言のとき
            let xstructType = {... xelement0};
                                          // 構造体宣言文を複写する
            Object.keys( xelement0 || {}).forEach( function (key) {
              xstructType[key] = ref.types[xelement0[key]];
                                          // メンバー変数の型を確定する
            });

            const xstruct0 = StructType( xstructType);
                                          // １要素の型
            const xstructArray = ArrayType( xstruct0);
            const xletInstance = new xstructArray( xfuncs[1][xindex][1]);
                                          // 指定長の構造体配列を取得

                                          // 構造体配列にINPUT値を転写していく
            for ( let xindx2 = 0; xindx2 < xfuncs[1][xindex][1]; xindx2++) {
              xletInstance[xindx2] = new xstruct0( xinarg[xindex][xindx2]);
            }

                                          // 構造体配列を uint8配列化する
            const xuint8Array = Buffer.alloc( xletInstance.buffer.length);
            for ( let xindx2 = 0; xindx2 < xletInstance.buffer.length; xindx2++) {
              xuint8Array[xindx2] = xletInstance.buffer[xindx2];
            }

            xargv.push( xuint8Array);
          } else {
            throw "xinarg(xcmdno=2) parse error.";
          }
        } else {
          throw "xinarg(xcmdno=2) parse error.";
        }
      }
    } catch (e) {
                                          // INPUT引数のパース時エラー
      let xojson = {
        xcmdno: 2,
        xlibno: xlibno,
        xfuncn: xfuncn,

        xinarg: xinarg,
        xreslt: 9999,
        xotarg: [],

        xstats: "NG",
        xerrno: 4,
        xmesag: e.message
      };
      return JSON.stringify( xojson);
    }

                                          //------------------
                                          // DLL関数のコール
                                          //------------------
    console.log( "call before", xargv);
    const xreslt = this.mlibry[xlibno-1][xfuncn](... xargv);
    console.log( "call after", xargv);

                                          //------------------
                                          // OUTPUT引数の生成
                                          //------------------
    let xotarg = [];                      // ひな型
    try {
      for ( let xindex = 0; xindex < xfuncs[1].length; xindex++) {
        if ( typeof xfuncs[1][xindex] == "string") {
                                          // INPUT引数が値引数のとき
          xotarg.push( xargv[xindex]);      // INPUT引数をOUTPUT引数にそのまま転写

        } else if ( Array.isArray( xfuncs[1][xindex])) {
                                          // OUTPUT引数が配列のとき
          const xelement0 = xfuncs[1][xindex][0];
                                          // 先頭要素
          if ( typeof xelement0 == "string") {
                                          // "int32"等のとき
            const xletType = ref.types[xelement0];
                                          // 配列の１要素の型
            const xletArray = ArrayType(xletType);
                                          // 配列型の取得

            const arr = new Array(xfuncs[1][xindex][1]).fill(0);
                                          // 値が０で長さが指定長の配列を生成する
            for ( let xindx2 = 0;
                  xindx2 < arr.length && xindx2 < xinarg[xindex].length;
                  xindx2++) {
                                          // 先頭から値を埋めていく
              arr[xindx2] = xinarg[xindx2];
            }
            const xletInstance = new xletArray( arr);
                                          // 配列インスタンスの生成
                                          // uint8配列から配列インスタンスに複写
            for ( let xindx2 = 0; xindx2 < xletInstance.buffer.length; xindx2++) {
              xletInstance.buffer[xindx2] = xargv[xindex][xindx2];
            }

            let arr2 = [];
            for ( let xindx2 = 0; xindx2 < xletInstance.length; xindx2++) {
              arr2.push( xletInstance[xindx2]);
            }
            xotarg.push( arr2);            // OUTPUT引数に蓄積する

          } else if ( typeof xelement0 == "object") {
                                          // OUTPUT引数が構造体配列のとき
            let xstructType = {... xelement0};
                                          // 構造体宣言文を複写する
            Object.keys( xelement0 || {}).forEach( function (key) {
              xstructType[key] = ref.types[xelement0[key]];
                                          // メンバー変数の型を確定する
            });

            const xstruct0 = StructType( xstructType);
                                          // １要素の型
            const xstructArray = ArrayType( xstruct0);
            const xletInstance = new xstructArray( xfuncs[1][xindex][1]);
                                          // 指定長の構造体配列を取得

                                          // 構造体配列にINPUT値を転写していく
            for ( let xindx2 = 0; xindx2 < xfuncs[1][xindex][1]; xindx2++) {
              xletInstance[xindx2] = new xstruct0( xinarg[xindex][xindx2]);
            }

                                          // uint8配列をインスタンスに転写
            console.log( xletInstance);
            for ( let xindx2 = 0; xindx2 < xletInstance.buffer.length; xindx2++) {
              xletInstance.buffer[xindx2] = xargv[xindex][xindx2];
            }
            console.log( xletInstance);

                                          // インスタンスから
                                          //   オブジェクト配列を得る
            const arr = [];
            for ( let xindx2 = 0; xindx2 < xletInstance.length; xindx2++) {
              let obj = {};
              Object.keys( xfuncs[1][xindex][0] || {}).forEach( function (key) {
                obj[key] = xletInstance[xindx2][key];
              });
              arr.push( obj);
            }

            xotarg.push( arr);            // OUTPUT引数に蓄積する
   
          } else {
            throw "xotarg(xcmdno=2) make error.";
          }
        } else {
          throw "xotarg(xcmdno=2) make error.";
        }
      }
    } catch (e) {
                                          // OUTPUT引数の生成時エラー
      let xojson = {
        xcmdno: 2,
        xlibno: xlibno,
        xfuncn: xfuncn,

        xinarg: xinarg,
        xreslt: xreslt,
        xotarg: xinarg,

        xstats: "NG",
        xerrno: 6,
        xmesag: e.message
      };
      return JSON.stringify( xojson);
    }

                                          //---------------------------
                                          // OUTPUT引数を返す(正常系)
                                          //---------------------------
      let xojson = {
        xcmdno: 2,
        xlibno: xlibno,
        xfuncn: xfuncn,

        xinarg: xinarg,
        xreslt: xreslt,
        xotarg: xotarg,

        xstats: "OK",
        xerrno: 0,
        xmesag: ""
    }
    return JSON.stringify( xojson);
  }


  /**
   * fentry - ffi_honji_svr のエントリーポイント
   * @brief 
   * @param[in]   xinbuf  Electron側から受け取ったリクエスト文字列(JSON形式)
   * @return Electron側に応答すべきJSON文字列
   */
  fentry( xinbuf) {

    let xijson;                           // 入力JSON
    let xojson;                           // 出力JSON
    try {
      xijson = JSON.parse( xinbuf);
    } catch (e) {
      xojson = {
        xcmdno: 9999,
        xstats: "NG",
        xerrno: 1,
        xmesag: this.#fmesag( 1),
        xlibno: 9999
      }
      return JSON.stringify( xojson);
    }

    // JSON member check
    try {
      if ( ! ("xcmdno" in xijson)) {
        xojson = {
          xcmdno: 9999,
          xstats: "NG",
          xerrno: 2,
          xmesag: "xcmdno not found.",
          xlibno: 9999
        }
        return JSON.stringify( xojson);
      }
      if ( xijson.xcmdno == 1) {
        if ( ! ("xdllnm" in xijson)) {
          throw "xdllnm not found.";
        }
        if ( ! ("xfuncs" in xijson)) {
          throw "xfuncs not found.";
        }
        const xojson = this.#fcmd01( xijson);
        console.log( xojson);
        return xojson;

      } else if ( xijson.xcmdno == 2) {
        if ( ! ("xlibno" in xijson)) {
          throw "xlibno not found.";
        }
        if ( ! ("xfuncn" in xijson)) {
          throw "xfuncn not found.";
        }
        if ( ! ("xinarg" in xijson)) {
          throw "xinarg not found.";
        }
        const xojson = this.#fcmd02( xijson);
        console.log( xojson);
        return xojson;
      } else {
        xojson = {
          xstats: "NG",
          xerrno: 9999,
          xmesag: "supported xcmdno = 1 or 2."
        }
        return JSON.stringify(xojson);
      }
    } catch (e) {
      xojson = {
        xcmdno: xijson.xcmdno,
        xstats: "NG",
        xerrno: 2,
        xmesag: e.message,
        xlibno: 9999
      }
      return JSON.stringify( xojson);
    }
  }
}

exports.THONJI = THONJI;
