const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  dragStart: () => ipcRenderer.send("widget:drag-start"),
  setHeight: (h) => ipcRenderer.send("widget:set-height", h),
  getBounds: () => ipcRenderer.invoke("widget:get-bounds"),
  isElectron: true,
});
