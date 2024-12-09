// src-electron/main.js
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const { join } = require("path");
const ffmpeg = require("fluent-ffmpeg");

// 屏蔽安全警告
// ectron Security Warning (Insecure Content-Security-Policy)
process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";

// 创建浏览器窗口时，调用这个函数。
const createWindow = () => {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: join(__dirname, "/preload.js"),
      contextIsolation: true,
      enableRemoteModule: true,
      nodeIntegration: true,
      contextIntegration: true,
    },
  });

  // development模式
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
    // 开启调试台
    win.webContents.openDevTools();
  } else {
    win.loadFile(join(__dirname, "../dist/index.html"));
  }
};

// Electron 会在初始化后并准备
app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.on("open-file-dialog", (event) => {
  const result = dialog.showOpenDialogSync({
    properties: ["openDirectory"],
  });
  event.reply("file-dialog-result", result);
});

ipcMain.on("edit-video", async (event, videoList) => {
  videoList.forEach((video) => {
    const { fragmentList, outputPath, inputPath } = video;

    fragmentList.map((item) => {
      console.log(item, " fragment");

      const { startSeconds, endSeconds } = item;
      const outputVideoPath = join(
        outputPath,
        `${startSeconds}-${endSeconds}.mp4`
      );
      event.reply("setLoading", true);
      // 使用FFmpeg裁剪视频
      ffmpeg(inputPath)
        .setStartTime(startSeconds)
        .setDuration(endSeconds - startSeconds)
        .save(outputVideoPath)
        .on("end", () => {
          console.log("Video successfully cut!");
          event.reply("setLoading", false);
        })
        .on("error", (err, stdout, stderr) => {
          console.error("Error:", err.message);
          console.error("ffmpeg stdout:", stdout);
          console.error("ffmpeg stderr:", stderr);
          console.log("Failed to cut video");
        });
    });
  });
});
