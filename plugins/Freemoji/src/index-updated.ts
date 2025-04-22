import { storage } from "@vendetta/plugin";
import nitroChecks from "./patches/nitroChecks";
import sendMessage from "./patches/sendMessage";

// Constants similar to Aliucord's constants
export const EMOTE_SIZE_KEY = "emojiSize";
export const EMOTE_SIZE_DEFAULT = 48;

// Default settings
storage[EMOTE_SIZE_KEY] ??= EMOTE_SIZE_DEFAULT;

// Migration code, used to be string containing a number but is now just a number
if (typeof storage[EMOTE_SIZE_KEY] === "string") storage[EMOTE_SIZE_KEY] = parseInt(storage[EMOTE_SIZE_KEY]);

// Store as emojiSize for compatibility with existing code
storage.emojiSize = storage[EMOTE_SIZE_KEY];

// Combine all patches
const patches = [
    ...nitroChecks,
    ...sendMessage,
];

// Similar to Aliucord's stop method
export const onUnload = () => patches.forEach(p => p());

// Similar to Aliucord's settingsTab
export { default as settings } from "./Settings";