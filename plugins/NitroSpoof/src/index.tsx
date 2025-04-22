import { registerPlugin } from "@vendetta/plugins";
import { findByProps } from "@vendetta/metro";
import { before } from "@vendetta/patcher";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { storage } from "@vendetta/plugin";
import Settings from "./Settings";

if (!storage.method) storage.method = "new";
if (!storage.imageSize) storage.imageSize = 48;

const MessageActions = findByProps("sendMessage", "receiveMessage");
const EmojiStore = findByProps("getCustomEmojiById");
const EmojiUtils = findByProps("getEmojiURL");

let messagePatch;

const startPlugin = () => {
  messagePatch = before("sendMessage", MessageActions, (args) => {
    const [channelId, message] = args;
    
    if (message.content) {
      const emojiRegex = /<(a)?:([^:]+):(\d+)>/g;
      let match;
      
      while ((match = emojiRegex.exec(message.content)) !== null) {
        const [fullMatch, animated, emojiName, emojiId] = match;
        
        if (storage.method === "old") {
          continue;
        } else if (storage.method === "new") {
          const isAnimated = animated ? true : false;
          const emojiURL = EmojiUtils.getEmojiURL({
            id: emojiId,
            animated: isAnimated
          });
          
          const sizedURL = `${emojiURL}?size=${storage.imageSize}`;
          
          message.content = message.content.replace(fullMatch, sizedURL);
        }
      }
    }
    
    return args;
  });
};

const stopPlugin = () => {
  if (messagePatch) messagePatch();
};

let emojiPatches = [];

const patchEmojiPermissions = () => {
  const EmojiPermissions = findByProps("hasEmojiPermission");
  
  if (EmojiPermissions) {
    emojiPatches.push(
      before("hasEmojiPermission", EmojiPermissions, () => {
        return true;
      })
    );
  }
  
  const UserSettings = findByProps("showEmojiReactions");
  
  if (UserSettings) {
    emojiPatches.push(
      before("canUseAnimatedEmojis", UserSettings, () => {
        return true;
      })
    );
    
    emojiPatches.push(
      before("canUseExternalEmojis", UserSettings, () => {
        return true;
      })
    );
  }
};

export default registerPlugin({
  name: "BetterSpoof",
  description: "Use emojis como se você tivesse Nitro! Emojis animados e de outros servidores funcionando.",
  authors: [{ name: "Rhyan57", id: "896604349311115304" }],
  version: "1.0.0",
  
  onLoad: () => {
    startPlugin();
    patchEmojiPermissions();
  },
  
  onUnload: () => {
    stopPlugin();
    for (const unpatch of emojiPatches) {
      unpatch();
    }
    emojiPatches = [];
  },
  
  settings: Settings
});
