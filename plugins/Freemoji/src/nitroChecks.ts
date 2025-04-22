import { findByProps } from "@vendetta/metro";
import { before } from "@vendetta/patcher";

// Find the emoji module with the required methods
const EmojiModule = findByProps("isCustomEmojiUnavailable", "isEmojiUsable");

// This is equivalent to patching isUsable and isAvailable in Aliucord
const patches = [
    // Patch isEmojiUsable to always return true (similar to isUsable in Aliucord)
    before("isEmojiUsable", EmojiModule, (args) => {
        return true; // Always make emojis usable
    }),

    // Patch isCustomEmojiUnavailable to always return false (similar to isAvailable in Aliucord)
    before("isCustomEmojiUnavailable", EmojiModule, (args) => {
        return false; // Return false to indicate emoji is available
    }),

    // Additional patches to ensure all emoji-related checks pass
    before("canUseAnimatedEmojis", EmojiModule, () => {
        return true;
    }),

    before("canUseExternalEmojis", EmojiModule, () => {
        return true;
    }),
];

export default patches;