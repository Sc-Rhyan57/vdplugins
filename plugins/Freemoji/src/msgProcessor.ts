import { findByStoreName } from "@vendetta/metro";
import { storage } from "@vendetta/plugin";
import { Message } from "./def";
const { getCustomEmojiById } = findByStoreName("EmojiStore");
const { getGuildId } = findByStoreName("SelectedGuildStore");

// https://github.com/luimu64/nitro-spoof/blob/1bb75a2471c39669d590bfbabeb7b922672929f5/index.js#L25
const hasEmotesRegex = /<a?:(\w+):(\d+)>/i;

function extractUnusableEmojis(messageString: string, size: number) {
	const emojiStrings = messageString.matchAll(/<a?:(\w+):(\d+)>/gi);
	const emojiUrls = [];

	for (const emojiString of emojiStrings) {
		// Fetch required info about the emoji
		const emoji = getCustomEmojiById(emojiString[2]);
		
		if (!emoji) continue;

		// Check emoji usability - similar to Aliucord's isUsable & available check
		// The key change here: allow ALL emojis to be used regardless of guild or animation
		// This matches the functionality of the Aliucord NitroSpoof plugin
		if (emoji) {
			// Only replace and extract emojis if they're from another guild or animated
			// This mimics Aliucord's behavior
			if (emoji.guildId != getGuildId() || emoji.animated) {
				// Remove emote from original msg
				messageString = messageString.replace(emojiString[0], "");
				
				// Build URL similar to Aliucord's getChatReplacement
				let finalUrl = "https://cdn.discordapp.com/emojis/";
				finalUrl += emoji.id;
				finalUrl += (emoji.animated ? ".gif" : ".png") + "?quality=lossless&name=" + emoji.name;
				
				// Add size parameter if specified
				if (size) {
					finalUrl += "&size=" + size;
				}
				
				// Add to emotes to send
				emojiUrls.push(finalUrl);
			}
		}
	}

	return { 
        newContent: messageString.trim(),
        extractedEmojis: emojiUrls,
    };
}

export default function modifyIfNeeded(msg: Message) {
	if (!msg.content.match(hasEmotesRegex)) return;

	// Find all emojis from the captured message string and return object with emojiURLS and content
	const { newContent, extractedEmojis } = extractUnusableEmojis(msg.content, storage.emojiSize);

	msg.content = newContent;

	if (extractedEmojis.length > 0) msg.content += "\n" + extractedEmojis.join("\n");

	// Set invalidEmojis to empty to prevent Discord yelling to you about you not having nitro
	msg.invalidEmojis = [];
};