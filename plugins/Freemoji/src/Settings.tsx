import { ReactNative as RN } from "@vendetta/metro/common";
import { Forms } from "@vendetta/ui/components";
import { useProxy } from "@vendetta/storage";
import { storage } from "@vendetta/plugin";
import { EMOTE_SIZE_KEY, EMOTE_SIZE_DEFAULT } from "./index";

const { FormSection, FormRadioRow, FormInput } = Forms;

// Similar size options to match Aliucord's behavior
const sizeOptions = {
    "Default (Discord Default)": EMOTE_SIZE_DEFAULT,
    "Tiny": 16,
    "Small": 32,
    "Medium": 48,
    "Large": 64,
    "Huge": 96,
    "Jumbo": 128,
    "Maximum": 160
}

// Preview emoji similar to what's in the Aliucord plugin
const previewUri = "https://cdn.discordapp.com/emojis/926602689213767680";

export default () => {
    useProxy(storage);

    // Make sure we use the storage correctly
    const currentSize = storage[EMOTE_SIZE_KEY] || EMOTE_SIZE_DEFAULT;
    
    // Update both storage keys when changed
    const updateSize = (size) => {
        storage[EMOTE_SIZE_KEY] = size;
        storage.emojiSize = size;
    };

    return (
        <RN.ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 38 }}>
            <FormSection title="Emoji Size" titleStyleType="no_border">
                {Object.entries(sizeOptions).map(([name, size]) => <FormRadioRow
                    label={name}
                    subLabel={`${size}px`}
                    selected={currentSize === size}
                    onPress={() => {
                        updateSize(size);
                    }}
                />)}
            </FormSection>
            
            {/* Allow custom sizes like in Aliucord */}
            <FormSection title="Custom Size">
                <FormInput
                    title="Custom Size (in pixels)"
                    placeholder="Enter a custom size (leave empty for default)"
                    keyboardType="numeric"
                    value={currentSize !== EMOTE_SIZE_DEFAULT ? currentSize.toString() : ""}
                    onChange={(val) => {
                        const size = parseInt(val);
                        if (!isNaN(size) && size > 0) {
                            updateSize(size);
                        } else if (val === "") {
                            updateSize(EMOTE_SIZE_DEFAULT);
                        }
                    }}
                />
            </FormSection>
            
            <FormSection title="Preview">
                <RN.View style={{ padding: 16, alignItems: "center" }}>
                    <RN.Image
                        source={{ 
                            uri: `${previewUri}.png?size=${currentSize}`,
                            width: currentSize,
                            height: currentSize 
                        }}
                    />
                    <RN.Text style={{ marginTop: 8 }}>Normal Emoji (size: {currentSize}px)</RN.Text>
                </RN.View>
                <RN.View style={{ padding: 16, alignItems: "center" }}>
                    <RN.Image
                        source={{ 
                            uri: `${previewUri}.gif?size=${currentSize}`,
                            width: currentSize,
                            height: currentSize 
                        }}
                    />
                    <RN.Text style={{ marginTop: 8 }}>Animated Emoji (size: {currentSize}px)</RN.Text>
                </RN.View>
            </FormSection>
        </RN.ScrollView>
    )
}