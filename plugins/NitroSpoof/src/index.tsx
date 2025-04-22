import { registerPlugin } from "@vendetta/plugins";
import { before } from "@vendetta/patcher";
import { findByProps } from "@vendetta/metro";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { storage } from "@vendetta/plugin";
import { React } from "@vendetta/metro/common";
import { Forms } from "@vendetta/ui/components";

const { FormSection, FormRow, FormSwitch, FormDivider } = Forms;

if (!storage.method) storage.method = "new";
if (!storage.imageSize) storage.imageSize = 48;

const patches = [];

const MessageActions = findByProps("sendMessage", "receiveMessage") || findByProps("sendBotMessage", "sendMessage");
const EmojiUtils = findByProps("getEmojiURL") || findByProps("translateEmojis");
const EmojiPermissions = findByProps("hasEmojiPermission");
const UserSettings = findByProps("showEmojiReactions");

function Settings() {
  return (
    <FormSection title="BetterSpoof">
      <FormRow
        label="Método de substituição"
        subLabel={`Atual: ${storage.method === "new" ? "Novo (URLs)" : "Antigo (Original)"}`}
        leading={<FormRow.Icon source={getAssetIDByName("ic_message_edit")} />}
        trailing={
          <FormSwitch
            value={storage.method === "new"}
            onValueChange={() => {
              storage.method = storage.method === "new" ? "old" : "new";
            }}
          />
        }
      />

      <FormDivider />

      <FormRow
        label="Tamanho do emoji (px)"
        subLabel={`Atual: ${storage.imageSize}px`}
        leading={<FormRow.Icon source={getAssetIDByName("ic_image")} />}
      />

      <FormRow>
        <Forms.FormInput
          title="Tamanho do emoji"
          placeholder="Tamanho (16-300)"
          value={String(storage.imageSize)}
          onChange={(val) => {
            const size = parseInt(val);
            if (!isNaN(size) && size > 0 && size <= 300) {
              storage.imageSize = size;
            }
          }}
          keyboardType="numeric"
        />
      </FormRow>
    </FormSection>
  );
}

export default registerPlugin({
  name: "BetterSpoof",
  description: "Use emojis como se você tivesse Nitro! Emojis animados e de outros servidores funcionando.",
  authors: [{ name: "Rhyan57", id: "896604349311115304" }],
  version: "1.0.0",
  
  onLoad: () => {
    if (MessageActions && EmojiUtils) {
      const messagePatch = before("sendMessage", MessageActions, (args) => {
        const [channelId, message] = args;
        
        if (message?.content) {
          const emojiRegex = /<(a)?:([^:]+):(\d+)>/g;
          let match;
          
          while ((match = emojiRegex.exec(message.content)) !== null) {
            const [fullMatch, animated, emojiName, emojiId] = match;
            
            if (storage.method === "old") continue;
            
            const isAnimated = Boolean(animated);
            const emojiURL = EmojiUtils.getEmojiURL({
              id: emojiId,
              animated: isAnimated
            });
            
            const sizedURL = `${emojiURL}?size=${storage.imageSize}`;
            message.content = message.content.replace(fullMatch, sizedURL);
          }
        }
        
        return args;
      });
      
      patches.push(messagePatch);
    }
    
    if (EmojiPermissions) {
      patches.push(before("hasEmojiPermission", EmojiPermissions, () => true));
    }
    
    if (UserSettings) {
      if (typeof UserSettings.canUseAnimatedEmojis === "function") {
        patches.push(before("canUseAnimatedEmojis", UserSettings, () => true));
      }
      
      if (typeof UserSettings.canUseExternalEmojis === "function") {
        patches.push(before("canUseExternalEmojis", UserSettings, () => true));
      }
    }
  },
  
  onUnload: () => {
    for (const unpatch of patches) {
      unpatch();
    }
  },
  
  settings: Settings
});
