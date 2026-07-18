<!-- /* vim:set ts=2 sw=2 sts=2 tw=80 et: */ -->
### Coexistence of Windows 64bit Electron and 32bit DLL coded by C on localhost
### Underlying Motivation
(1) AI advises coding with the latest 64bit Electron LTS version.  
(2) But In operational environments, 32-bit DLLs written in C are running stably, making them difficult to discard.  

### System Configuration Diagram
![sysDiagram](https://github.com/user-attachments/assets/88120a95-027f-46e5-8ff0-6a8eac1c2b39)  


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

