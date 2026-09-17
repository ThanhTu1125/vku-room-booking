const fs = require('fs');
const path = require('path');

// Đường dẫn các file cần patch trong node_modules/expo-notifications
const warnFile = path.join(
  __dirname,
  '..',
  'node_modules',
  'expo-notifications',
  'build',
  'warnOfExpoGoPushUsage.js'
);

const autoRegFile = path.join(
  __dirname,
  '..',
  'node_modules',
  'expo-notifications',
  'build',
  'DevicePushTokenAutoRegistration.fx.js'
);

const topicSubFile = path.join(
  __dirname,
  '..',
  'node_modules',
  'expo-notifications',
  'build',
  'TopicSubscriptionModule.android.js'
);

// 1. Patch warnOfExpoGoPushUsage.js: thay đổi throw Error thành console.warn
if (fs.existsSync(warnFile)) {
  let content = fs.readFileSync(warnFile, 'utf8');
  if (content.includes('throw new Error(message);')) {
    content = content.replace(
      'throw new Error(message);',
      'didWarn = true;\n            console.warn(message);'
    );
    fs.writeFileSync(warnFile, content, 'utf8');
    console.log('[Patch] Đã patch warnOfExpoGoPushUsage.js chống crash Expo Go.');
  }
}

// 2. Patch DevicePushTokenAutoRegistration.fx.js: không tự động đăng ký token khi chạy trong Expo Go
if (fs.existsSync(autoRegFile)) {
  let content = fs.readFileSync(autoRegFile, 'utf8');
  if (
    content.includes('if (ServerRegistrationModule.getRegistrationInfoAsync) {') &&
    !content.includes('!isRunningInExpoGo()')
  ) {
    if (!content.includes("from 'expo';")) {
      content = "import { isRunningInExpoGo } from 'expo';\n" + content;
    }
    content = content.replace(
      'if (ServerRegistrationModule.getRegistrationInfoAsync) {',
      'if (ServerRegistrationModule.getRegistrationInfoAsync && !isRunningInExpoGo()) {'
    );
    fs.writeFileSync(autoRegFile, content, 'utf8');
    console.log(
      '[Patch] Đã patch DevicePushTokenAutoRegistration.fx.js chống crash Expo Go.'
    );
  }
}

// 3. Patch TopicSubscriptionModule.android.js: chống crash ExpoTopicSubscriptionModule trên Expo Go / Snack Android
if (fs.existsSync(topicSubFile)) {
  let content = fs.readFileSync(topicSubFile, 'utf8');
  if (content.includes("requireNativeModule('ExpoTopicSubscriptionModule')")) {
    content = `import { requireNativeModule } from 'expo-modules-core';

let mod = {
  addListener: () => {},
  removeListeners: () => {},
  subscribeToTopicAsync: () => Promise.resolve(null),
  unsubscribeFromTopicAsync: () => Promise.resolve(null),
};

try {
  mod = requireNativeModule('ExpoTopicSubscriptionModule');
} catch (e) {
  // ExpoTopicSubscriptionModule không tồn tại trong Expo Go SDK 53+ / Snack
}

export default mod;
`;
    fs.writeFileSync(topicSubFile, content, 'utf8');
    console.log(
      '[Patch] Đã patch TopicSubscriptionModule.android.js chống crash Expo Go / Snack.'
    );
  }
}
