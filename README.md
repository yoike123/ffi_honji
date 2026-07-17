### Coexistence of Windows 64bit Electron and 32bit DLL coded by C on localhost
### Underlying Motivation
(1) AI advises coding with the latest 64bit Electron LTS version.
(2) But In operational environments, 32-bit DLLs written in C are running stably, making them difficult to discard.
### System Configuration Diagram
+-----------------------------------------------+  
|　Localhost　　　　　　　　　　　　　　　　　　|  
|　+----------------+　HTTP +----------------+　|  
|　| 64bit Electron |=======| ffi-napi server|　|  
|　|　　Node v24 LTS|　JSON |　Node v16 32bit|　|  
|　+----------------+　　　 +|------|-------|+　|  
|　　　　　　　　　　　　　　|　　　|　　　 |　 |  
|　　　　　　　　　　　　 +--|+　+-|-+　+-+-+　 |  
|　　　　　　　　　　　　 +---+　+---+　+---+　 |  
|　　　　　　　　　　　　　 32bit DLL's　　　　 |  
+-----------------------------------------------+  
  

