const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  openFileDialog: () => ipcRenderer.send("open-file-dialog"),
  onFileDialogResult: (callback) =>
    ipcRenderer.on("file-dialog-result", callback),
  editVideo: (videoList) => {
    console.log(videoList, "要剪辑的视频列表");
    ipcRenderer.send("edit-video", videoList);
  },
  onSetLoading: (callback) => ipcRenderer.on("setLoading", callback),
});

window.addEventListener("DOMContentLoaded", () => {
  console.log("preload");
});
