const fs = require("fs");
const path = require("path");

// Đường dẫn các file cần patch trong node_modules/expo-notifications
const warnFile = path.join(
  __dirname,
  "..",
  "node_modules",
  "expo-notifications",
  "build",
  "warnOfExpoGoPushUsage.js",
);

const autoRegFile = path.join(
  __dirname,
  "..",
  "node_modules",
  "expo-notifications",
  "build",
  "DevicePushTokenAutoRegistration.fx.js",
);

// 1. Patch warnOfExpoGoPushUsage.js: thay đổi throw Error thành console.warn
if (fs.existsSync(warnFile)) {
  let content = fs.readFileSync(warnFile, "utf8");
  if (content.includes("throw new Error(message);")) {
    content = content.replace(
      "throw new Error(message);",
      "didWarn = true;\n            console.warn(message);",
    );
    fs.writeFileSync(warnFile, content, "utf8");
    console.log(
      "[Patch] Đã patch warnOfExpoGoPushUsage.js chống crash Expo Go.",
    );
  }
}

// 2. Patch DevicePushTokenAutoRegistration.fx.js: không tự động đăng ký token khi chạy trong Expo Go
if (fs.existsSync(autoRegFile)) {
  let content = fs.readFileSync(autoRegFile, "utf8");
  if (
    content.includes(
      "if (ServerRegistrationModule.getRegistrationInfoAsync) {",
    ) &&
    !content.includes("!isRunningInExpoGo()")
  ) {
    if (!content.includes("from 'expo';")) {
      content = "import { isRunningInExpoGo } from 'expo';\n" + content;
    }
    content = content.replace(
      "if (ServerRegistrationModule.getRegistrationInfoAsync) {",
      "if (ServerRegistrationModule.getRegistrationInfoAsync && !isRunningInExpoGo()) {",
    );
    fs.writeFileSync(autoRegFile, content, "utf8");
    console.log(
      "[Patch] Đã patch DevicePushTokenAutoRegistration.fx.js chống crash Expo Go.",
    );
  }
}
