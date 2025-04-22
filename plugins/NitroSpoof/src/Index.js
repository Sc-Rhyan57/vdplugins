import { findByName, findByProps, findByStoreName } from "@vendetta/metro";
import { after, before } from "@vendetta/patcher";
import { storage } from "@vendetta/plugin";
import Settings from "./Settings";

if (!storage.emojiSize) storage.emojiSize = 48;
if (typeof storage.emojiSize === "string") storage.emojiSize = parseInt(storage.emojiSize);

const patches = [];

const EmojiStore = findByStoreName("EmojiStore");
const SelectedGuildStore = findByStoreName("SelectedGuildStore");
const MessageActions = findByProps("sendMessage", "receiveMessage");
const RowManager = findByName("RowManager");

const emojiRegex = /<(a)?:([^:]+):(\d+)>/g;
const emojiUrlRegex = /https:\/\/cdn\.discordapp\.com\/emojis\/(\d+)\.\w+/;

function extractUnusableEmojis(messageString) {
    const emojiMatches = [...messageString.matchAll(emojiRegex)];
    const emojiUrls = [];
    
    for (const match of emojiMatches) {
        const [fullMatch, animated, emojiName, emojiId] = match;
        
        const emoji = EmojiStore?.getCustomEmojiById?.(emojiId);
        
        if (!emoji || emoji.guildId !== SelectedGuildStore?.getGuildId?.() || emoji.animated) {
            messageString = messageString.replace(fullMatch, "");
            
            const isAnimated = Boolean(animated);
            const extension = isAnimated ? "gif" : "webp";
            emojiUrls.push(`https://cdn.discordapp.com/emojis/${emojiId}.${extension}?size=${storage.emojiSize}`);
        }
    }
    
    return {
        newContent: messageString.trim(),
        extractedEmojis: emojiUrls,
    };
}

if (MessageActions) {
    patches.push(before("sendMessage", MessageActions, (args) => {
        const [channelId, message] = args;
        
        if (message?.content) {
            const { newContent, extractedEmojis } = extractUnusableEmojis(message.content);
            
            message.content = newContent;
            
            if (extractedEmojis.length > 0) {
                message.content += "\n" + extractedEmojis.join("\n");
            }
            
            message.invalidEmojis = [];
        }
        
        return args;
    }));
}

if (RowManager?.prototype) {
    patches.push(before("generate", RowManager.prototype, ([data]) => {
        if (data.rowType !== 1) return;
        
        let content = data.message.content;
        if (!content?.length) return;
        
        const matchIndex = content.match(emojiUrlRegex)?.index;
        if (matchIndex === undefined) return;
        
        const emojis = content.slice(matchIndex).trim().split("\n");
        if (!emojis.every((s) => s.match(emojiUrlRegex))) return;
        
        content = content.slice(0, matchIndex);
        
        while (content.indexOf("  ") !== -1)
            content = content.replace("  ", ` ${emojis.shift()} `);
        
        content = content.trim();
        if (emojis.length) content += ` ${emojis.join(" ")}`;
        
        const embeds = data.message.embeds;
        if (Array.isArray(embeds)) {
            for (let i = 0; i < embeds.length; i++) {
                const embed = embeds[i];
                if (embed.type === "image" && embed.url.match(emojiUrlRegex))
                    embeds.splice(i--, 1);
            }
        }
        
        data.message.content = content;
        data.__realmoji = true;
    }));
    
    patches.push(after("generate", RowManager.prototype, ([data], row) => {
        if (data.rowType !== 1 || data.__realmoji !== true) return;
        
        const content = row.message?.content;
        if (!Array.isArray(content)) return;
        
        const jumbo = content.every((c) => 
            (c.type === "link" && c.target.match(emojiUrlRegex)) || 
            (c.type === "text" && c.content === " ")
        );
        
        for (let i = 0; i < content.length; i++) {
            const el = content[i];
            if (el.type !== "link") continue;
            
            const match = el.target.match(emojiUrlRegex);
            if (!match) continue;
            
            const url = `${match[0]}?size=${storage.emojiSize}`;
            const emoji = EmojiStore?.getCustomEmojiById?.(match[1]);
            
            content[i] = {
                type: "customEmoji",
                id: match[1],
                alt: emoji?.name ?? "",
                src: url,
                frozenSrc: url.replace("gif", "webp"),
                jumboable: jumbo ? true : undefined,
            };
        }
    }));
}

const EmojiPermissions = findByProps("hasEmojiPermission");
if (EmojiPermissions) {
    const methods = [
        "hasEmojiPermission", 
        "canUseEmojisEverywhere", 
        "canUseAnimatedEmojis", 
        "canUseExternalEmojis"
    ];
    
    for (const method of methods) {
        if (typeof EmojiPermissions[method] === "function") {
            patches.push(before(method, EmojiPermissions, () => true));
        }
    }
}

const UserSettings = findByProps("showEmojiReactions");
if (UserSettings) {
    const methods = [
        "canUseAnimatedEmojis", 
        "canUseExternalEmojis", 
        "canUseCustomEmojis"
    ];
    
    for (const method of methods) {
        if (typeof UserSettings[method] === "function") {
            patches.push(before(method, UserSettings, () => true));
        }
    }
}

export default {
    name: "BetterSpoof",
    description: "Use emojis como se você tivesse Nitro! Emojis animados e de outros servidores funcionando.",
    authors: [{ name: "Rhyan57", id: "896604349311115304" }],
    version: "1.0.0",
    
    onLoad: () => {},
    onUnload: () => patches.forEach(unpatch => unpatch()),
    
    settings: Settings
};
