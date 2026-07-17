/* vim:set ts=2 sw=2 sts=2 tw=80 et: */
/**
 * @file ffi_honji_cli.js
 * @brief ffi_napi クライアントの メインjs
 * @author Y.Ishimaru
 * @date 2026.07.08
 * 変数命名規則：
 *   グローバル変数は a で始まる英数字。
 *   ローカル変数は x で始まる英数字。
 *   メンバー変数は m で始まる英数字。
 *   関数名は f で始まる英数字。
 */
let  a_port = 8033;                     // honji_svr の待ち受けポート
let  ahnjNG = 9999;                     // NG時に返す値



/**
 * ffi_honji_reset - ffi_honji_svrにリセット要求を出す
 * @brief リセット指令を出します。
 * @return nothing
 */
const ffi_honji_reset = async function () {

  try {
    const xres = await fetch( "http://localhost:" + a_port + "/reset");
    const xokng = await xres.text();
  } catch (e) {
    console.log(e.message);
  }
}

class MyClass{
  #mlibno = false;
  mijson = "";
  mojson = "";

  constructor( xlibno) {
    this.#mlibno = xlibno;
  }

  /**
   * ffi_call
   * @brief DLL関数を呼び出します。
   * @return DLL関数の戻り値
   */
  ffi_call = async function( xfuncn, ... xargv) {

    let xijson = {
      xcmdno: 2,
      xlibno: this.#mlibno,
      xfuncn: xfuncn,
      xinarg: xargv,
      xreslt: 9999,
      xotarg: [],
    }

    this.mijson = xijson;
    this.mojson = {};
    const xres = await fetch( "http://localhost:"
                                  + a_port + "/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify( xijson)
      });
    if ( !xres.ok) {
      console.log( `HTTP error: ${xres.status}`);
      return ahnjNG;
    }

    const xresult = await xres.text();
    let xojson;
    try {
      xojson = JSON.parse( xresult);
    } catch (e) {
      console.log( "JSON.parse error: " + xresult);
      return ahnjNG;
    }
    if ( xojson.xstats != "OK") {
      console.log( "ffi_honji_svr error: " + xresult);
      return ahnjNG;
    }

    this.mojson = xojson;   // 退避

    return xojson.xreslt;   // 正常リターン
  };
};


/**
 * ffi_honji_cli - ffi.Library に相当するラッパー関数
 * @brief HTTP-POST でサーバー上の ffi.Libraryを呼び出します。
 * @param[in]   xdll - DLL名
 * @param[in]   xfuncs - 関数定義のJSONオブジェクト
 * @return OK-関数呼び出しオブジェクト, NG-null
 */
const ffi_honji_cli = async function( xdll, xfuncs) {

  let xijson = {
    xcmdno : 1,
    xdllnm : xdll,
    xfuncs : xfuncs
  };

  const xres = await fetch( "http://localhost:" + a_port + "/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify( xijson)
    });
  if ( !xres.ok) {
    console.log( `HTTP error: ${xres.status}`);
    return null;
  }
  const xresult = await xres.text();
  let xojson;
  try {
    xojson = JSON.parse( xresult);
  } catch (e) {
    console.log( "JSON.parse error: " + xresult);
    return null;
  }
  if ( xojson.xstats != "OK") {
    console.log( "ffi_honji_svr error: " + xresult);
  }


                                        // DLL関数のラッパー
  const xmyobj = new MyClass( xojson.xlibno);
  xmyobj.mijson = xijson;
  xmyobj.mojson = xojson;

  return xmyobj;                        // 正常リターン
}
