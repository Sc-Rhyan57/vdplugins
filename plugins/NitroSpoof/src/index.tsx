import { registerPlugin } from "@vendetta/plugins";
import { findByProps } from "@vendetta/metro";
import { before } from "@vendetta/patcher";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { storage } from "@vendetta/plugin";
import Settings from "./Settings";

if (!storage.method) storage.method = "new";
if (!storage.imageSize) storage.imageSize = 48;

let MessageActions, EmojiStore, EmojiUtils;

try {
  MessageActions = findByProps("sendMessage", "receiveMessage");
  EmojiStore = findByProps("getCustomEmojiById");
  EmojiUtils = findByProps("getEmojiURL");
} catch (e) {
  console.error("Erro ao buscar módulos necessários:", e);
}

let messagePatch;
let emojiPatches = [];

const startPlugin = () => {
  if (!MessageActions) {
    console.error("MessageActions não encontrado, o plugin não funcionará corretamente");
    return;
  }

  if (!EmojiUtils) {
    console.error("EmojiUtils não encontrado, o plugin não funcionará corretamente");
    return;
  }

  messagePatch = before("sendMessage", MessageActions, (args) => {
    try {
      const [channelId, message] = args;
      
      if (message?.content) {
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
    } catch (e) {
      console.error("Erro ao processar mensagem:", e);
    }
    
    return args;
  });
};

const stopPlugin = () => {
  if (messagePatch) messagePatch();
};

const patchEmojiPermissions = () => {
  try {
    const EmojiPermissions = findByProps("hasEmojiPermission");
    
    if (EmojiPermissions) {
      emojiPatches.push(
        before("hasEmojiPermission", EmojiPermissions, () => {
          return true;
        })
      );
    } else {
      console.warn("EmojiPermissions não encontrado");
    }
    
    const UserSettings = findByProps("showEmojiReactions");
    
    if (UserSettings) {
      if (UserSettings.canUseAnimatedEmojis) {
        emojiPatches.push(
          before("canUseAnimatedEmojis", UserSettings, () => {
            return true;
          })
        );
      }
      
      if (UserSettings.canUseExternalEmojis) {
        emojiPatches.push(
          before("canUseExternalEmojis", UserSettings, () => {
            return true;
          })
        );
      }
    } else {
      console.warn("UserSettings não encontrado");
    }
  } catch (e) {
    console.error("Erro ao aplicar patches de permissões de emoji:", e);
  }
};

export default registerPlugin({
  name: "BetterSpoof",
  description: "Use emojis como se você tivesse Nitro! Emojis animados e de outros servidores funcionando.",
  authors: [{ name: "Rhyan57", id: "896604349311115304" }],
  version: "1.0.0",
  
  onLoad: () => {
    try {
      startPlugin();
      patchEmojiPermissions();
    } catch (e) {
      console.error("Erro ao carregar plugin:", e);
    }
  },
  
  onUnload: () => {
    try {
      stopPlugin();
      for (const unpatch of emojiPatches) {
        if (typeof unpatch === "function") {
          unpatch();
        }
      }
      emojiPatches = [];
    } catch (e) {
      console.error("Erro ao descarregar plugin:", e);
    }
  },
  
  settings: Settings
});
