const { app, BrowserWindow, screen, Tray, Menu, nativeImage, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

const VITE_URL = "http://localhost:5188";
const WIDGET_WIDTH = 380;
const WIDGET_HEIGHT = 520;
const MARGIN = 20;

let mainWindow = null;
let tray = null;
let configPath = null;

function loadPosition() {
  try { return JSON.parse(fs.readFileSync(configPath, "utf-8")); } catch { return null; }
}

function savePosition(bounds) {
  fs.writeFileSync(configPath, JSON.stringify(bounds));
}

function createWidget() {
  // Use cursor position to find the active display (the one you're looking at)
  const cursorPoint = screen.getCursorScreenPoint();
  const activeDisplay = screen.getDisplayNearestPoint(cursorPoint);
  const { x: dx, y: dy } = activeDisplay.workArea;
  const { width: dw, height: dh } = activeDisplay.workAreaSize;

  // Center on the active display
  const x = dx + Math.round((dw - WIDGET_WIDTH) / 2);
  const y = dy + Math.round((dh - WIDGET_HEIGHT) / 2);

  mainWindow = new BrowserWindow({
    width: WIDGET_WIDTH, height: WIDGET_HEIGHT, x, y,
    frame: true,
    title: "lets goooooo",
    transparent: false,
    backgroundColor: "#F7F5F0",
    alwaysOnTop: true,
    resizable: true,
    minWidth: WIDGET_WIDTH,
    maxWidth: WIDGET_WIDTH,
    minHeight: 400,
    maxHeight: 1000,
    skipTaskbar: false,
    hasShadow: true,
    roundedCorners: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL(VITE_URL);
  mainWindow.on("moved", () => savePosition(mainWindow.getBounds()));
  mainWindow.on("resized", () => savePosition(mainWindow.getBounds()));
  mainWindow.on("closed", () => { mainWindow = null; });
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  mainWindow.setAlwaysOnTop(true, "screen-saver");

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    mainWindow.moveTop();
    mainWindow.focus();
  });
}

function createTray() {
  const icon = nativeImage.createFromBuffer(Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAARElEQVQ4T2NkYPj/nwEPYMQlSUgDA8OoAQyjIYDPBHRHI7qjkdSuGDUAORaQFAuMDAwM/xkYGBgZGBgYAGwUCBE8MpxHAAAAAElFTkSuQmCC",
    "base64"
  ));
  tray = new Tray(icon);
  tray.setToolTip("lets goooooo");
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: "Show", click: () => { if (mainWindow) { mainWindow.show(); mainWindow.focus(); } } },
    { label: "Compact (520)", click: () => { if (mainWindow) { const b = mainWindow.getBounds(); mainWindow.setSize(WIDGET_WIDTH, 520); mainWindow.setPosition(b.x, b.y); } } },
    { label: "Medium (700)", click: () => { if (mainWindow) { const b = mainWindow.getBounds(); mainWindow.setSize(WIDGET_WIDTH, 700); mainWindow.setPosition(b.x, b.y); } } },
    { label: "Tall (900)", click: () => { if (mainWindow) { const b = mainWindow.getBounds(); mainWindow.setSize(WIDGET_WIDTH, 900); mainWindow.setPosition(b.x, b.y); } } },
    { type: "separator" },
    { label: "Quit", click: () => app.quit() },
  ]));
  tray.on("click", () => { if (mainWindow) mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show(); });
}

ipcMain.on("widget:drag-start", () => { if (mainWindow) mainWindow.setMovable(true); });

ipcMain.on("widget:set-height", (_, height) => {
  if (mainWindow) {
    const b = mainWindow.getBounds();
    const h = Math.max(400, Math.min(1000, height));
    mainWindow.setSize(WIDGET_WIDTH, h);
    mainWindow.setPosition(b.x, b.y);
  }
});

ipcMain.handle("widget:get-bounds", () => {
  if (mainWindow) return mainWindow.getBounds();
  return null;
});

app.whenReady().then(() => {
  configPath = path.join(app.getPath("userData"), "widget-position.json");
  createWidget();
  createTray();
});

app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
app.on("activate", () => { if (!mainWindow) createWidget(); });
