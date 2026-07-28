/* vim:set ts=2 sw=2 sts=2 tw=80 et: */
const http = require("node:http");
const url = require("node:url");
const path = require("node:path");
const fs = require("node:fs");
const util = require("node:util");

const AdmZip = require("adm-zip");

const ffi_honji_svr = require("./ffi_honji_svr");

                                        //-------------------------
                                        // コンソールリダイレクト
                                        //-------------------------
const a_date = new Date();
const fdtstr = (x_date) => {
  const yyyy = a_date.getFullYear();
  const MM = String(a_date.getMonth() + 1).padStart(2, '0');
  const dd = String(a_date.getDate()).padStart(2, '0');
  const HH = String(a_date.getHours()).padStart(2, '0');
  const mm = String(a_date.getMinutes()).padStart(2, '0');
  const ss = String(a_date.getSeconds()).padStart(2, '0');

  const formattedDate = `${yyyy}${MM}${dd}_${HH}${mm}${ss}`;

  return formattedDate;
};

const xdtstr = fdtstr( a_date);
const logFileName = process.cwd() + `/logs/log_${xdtstr}.txt`;
const logFile = fs.createWriteStream( logFileName, {flags:'w'});
const logStdout = process.stdout;

console.log = function () {
  const xdtstr = fdtstr( new Date());
  logFile.write( xdtstr + ":" + util.format.apply(null, arguments) + '\n');
  logStdout.write(util.format.apply(null, arguments) + '\n');
};
console.error = console.log; // 必要に応じてエラー出力も同様にする

console.log("ログ開始");


                                        //-------------
                                        // 変数初期化
                                        //-------------
let port = 80;
let ahonji = new ffi_honji_svr.THONJI();
const PIDFILE = "./logs/pid.txt";
const RESETFILE = "./share/restart_req.csv";

// Array of Mime Types
const mimeTypes = {
  // Text Types
  "html" : "text/html",
  "css" : "text/css",
  "js" : "text/javascript",
  // Image Types
  "jpeg" : "image/jpeg",
  "jpg" : "image/jpeg",
  "png" : "image/png",
  "gif" : "image/gif",
  "webp" : "image/webp",
  "svg" : "image/svg+xml",
  "icon" : "image/x-icon",
  "ico" : "image/x-icon",
  // Audio and Video Types
  "webm" : "video/webm",
  "ogg" : "video/ogg",
  "mp4" : "video/mp4",
  "mp3" : "audio/mpeg",
  // Font Types
  "ttf" : "font/ttf",
  "otf" : "font/otf",
  "woff" : "font/woff",
  "woff2" : "font/woff2",
  // Application Types
  "pdf" : "application/pdf"
};

                                        //-------------------------------
                                        // サーバー２重起動防止チェック
                                        //-------------------------------
if ( fs.existsSync(PIDFILE)) {
  let pid = fs.readFileSync(PIDFILE);
  try {
    console.log("polling pid " + pid);
    process.kill( pid, 0);
    console.log("Server Already Exist!!");
    process.exit(0);
  } catch (e) {
  }
}

                                        //-----------------
                                        // プロセスID退避
                                        //-----------------
console.log( "Server Start.");
fs.writeFileSync( PIDFILE, "" + process.pid);
fs.writeFileSync( "./logs/kill_svr.bat", "\r\n@echo off\r\nset CWD=%~dp0\r\ncd %CWD%\r\ntaskkill /f /pid " + process.pid + "\r\ndel pid.txt\r\n");
fs.writeFileSync( "./logs/latest_log.txt", logFileName);

                                        //-----------------------
                                        // イベントハンドラ設定
                                        //-----------------------
process.on("SIGTERM", () => {
  console.log("SIGTERMシグナルを受信しました。");
  process.exit(1);
});
process.on("SIGINT", () => {
  console.log("SIGINTシグナルを受信しました。");
  process.exit(2);
});
process.on("exit", (code /*終了コード*/ ) => {

  // 終了処理があれば、ここに書く


  console.log( "プロセス終了");
});

                                        //----------------------------------
                                        // リセット要請ファイル監視タイマー
                                        //   ./share/restart_req.csv  
                                        //----------------------------------
const frstim = () => {
  if ( fs.existsSync(RESETFILE)) {
    let str = fs.readFileSync(RESETFILE).toString();
    str = str.trim();
    try {
      const xlimit = new Date(str);
      const xnowdt = new Date();
      if ( a_date < xlimit && xlimit <= xnowdt) {
                                        // リセット要請時刻を過ぎているとき
        process.exit(3);                // 終了
      }
    } catch (e) {
    }
  }
};

let arstim = setTimeout( frstim, 3000);

                                        //------------------------
                                        // ./share/htdocs.zip を
                                        // ./htdocs.zip へコピー
                                        //------------------------
if ( fs.existsSync("./share/htdocs.zip")) {
  try {
    fs.copyFileSync( "./share/htdocs.zip", "./htdocs.zip");
    console.log("htdocs.zipを更新しました。");
  } catch (err) {
    console.error("htdocs.zip 更新中にエラーが発生しました:", err);
  }
}

                                        //------------------------
                                        // htdocs.zip の抽出処理
                                        //------------------------
const fhtdoc = (res, uri, fileName) => {

  const zip = new AdmZip("./htdocs.zip");
  const fileContent = zip.readFile( unescape(uri).slice(1));
  if (fileContent) {
    console.log( "find " + unescape(uri).slice(1) + " in htdocs.zip");

    let mimeType = mimeTypes[path.extname(fileName).split('.').reverse()[0]];
    if ( mimeType == undefined) {
      res.writeHead(404, {'Content-Type' : 'text/plain'});
      res.write('404 not Found\n');
      res.end();
      return 1;
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', mimeType);
    let str = fileContent.toString();
    res.write( str);
    res.end();
    return 0; 
  }
  return 2;
};
                                        //---------------------
                                        // サーバー処理の記述
                                        //---------------------
const server = http.createServer((req, res) => {

  // 1. CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // GET Method
  if (req.method === "GET") {
    if ( req.url === "/reset") {
      console.log( "GET /reset");
      let xbody = "OK";
      res.writeHead(200, {"Content-Type":"text/plain"});
      res.end( xbody);
      ahonji = new ffi_honji_svr.THONJI();
    } else if ( req.url === "/stop") {
      console.log( "GET /stop");
      let xbody = "OK";
      res.writeHead(200, {"Content-Type":"text/plain"});
      res.end( xbody);
      process.exit(0);
    } else {
      let uri = url.parse(req.url).pathname;
      let fileName = path.join( process.cwd()+"\\htdocs", unescape(uri));
      let status;


      try {
        status = fs.lstatSync(fileName);
      } catch(e) {
        // If file not found
        if ( fhtdoc( res, uri, fileName) == 2) {
          res.writeHead(404, {'Content-Type' : 'text/plain'});
          res.write('404 not Found\n');
          res.end();
          return; 
        } else {
          return;
        }
      }

      // Check if file or directory
      if (status.isFile()) {
        let mimeType = mimeTypes[path.extname(fileName).split('.').reverse()[0]];
        if ( mimeType == undefined) {
          res.writeHead(404, {'Content-Type' : 'text/plain'});
          res.write('404 not Found\n');
          res.end();
          return;
        }
        res.statusCode = 200;
        res.setHeader('Content-Type', mimeType);
        let fileStream = fs.createReadStream(fileName);
        fileStream.pipe(res);
        return; 
      } else if(status.isDirectory()) {
        res.statusCode = 302;
        res.setHeader('Location', 'index.html');
        res.end();
        return; 
      } else {
        if ( fhtdoc( res, uri, fileName) == 2) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'text/plain');
          res.end('500 Internal Error\n');
          return;
        } else {
          return;
        }
      }
    }
    return;
  }
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end( "");
    return;
  }


  // POST Method
  if (req.method === "POST") {
    let body = "";

    req.on("data", chunk => {
      body += chunk.toString();
    });

    req.on("end", () => {
      console.log( "Recieve:" + body);

      let xotbuf = ahonji.fentry( body);

      console.log( "Send:" + xotbuf);

      res.writeHead(200, {"Content-Type":"application/json"});
      res.end( xotbuf);
    });
    return;
  }

  // Get etc
  res.writeHead(405, {"Content-Type":"text/plain"});
  res.end("Method Not Allowed");
});

server.listen( port, "localhost", () => {
});


