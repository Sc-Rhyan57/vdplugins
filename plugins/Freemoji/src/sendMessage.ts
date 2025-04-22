import { findByProps } from "@vendetta/metro";
import { before } from "@vendetta/patcher";
import modifyIfNeeded from "../msgProcessor";

// Get the message sending utilities
const MessageActions = findByProps("sendMessage", "receiveMessage");

const patches = [
    // Intercept message before it's sent
    before("sendMessage", MessageActions, ([channelId, message]) => {
        // Apply modifications to the message similar to Aliucord's getChatReplacement
        modifyIfNeeded(message);
    })
];

export default patches;