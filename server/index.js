/* vim:set ts=2 sw=2 sts=2 tw=80 et: */
const fs = require("node:fs");
const http = require("http");
const ffi_honji_svr = require("./ffi_honji_svr");

let port = 8033;
let ahonji = new ffi_honji_svr.THONJI();
const PIDFILE = "./logs/pid.txt";

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

console.log( "Server Start.");
fs.writeFileSync( "./logs/pid.txt", "" + process.pid);

const server = http.createServer((req, res) => {

  // 1. CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', '*');

  // GET Method
  if (req.method === "GET") {
    let xbody = "OK";
    res.writeHead(200, {"Content-Type":"text/plain"});
    res.end( xbody);
    if ( req.url === "/reset") {
      console.log( "GET /reset");
      ahonji = new ffi_honji_svr.THONJI();
    } else if ( req.url === "/stop") {
      console.log( "GET /stop");
      process.exit(0);
    }
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

      var xotbuf = ahonji.fentry( body);

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


