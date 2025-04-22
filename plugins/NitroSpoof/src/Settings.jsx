import { React } from "@vendetta/metro/common";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms } from "@vendetta/ui/components";
import { storage } from "@vendetta/plugin";

const { FormSection, FormRow, FormInput, FormText } = Forms;

export default () => {
  if (!storage.emojiSize) storage.emojiSize = 48;
  if (typeof storage.emojiSize === "string") storage.emojiSize = parseInt(storage.emojiSize);

  return (
    <FormSection title="BetterSpoof">
      <FormRow
        label="Tamanho do emoji"
        subLabel={`Defina o tamanho dos emojis em pixels (atual: ${storage.emojiSize}px)`}
        leading={<FormRow.Icon source={getAssetIDByName("ic_image")} />}
      />
      
      <FormRow>
        <FormInput
          value={String(storage.emojiSize)}
          onChange={(val) => {
            const size = parseInt(val);
            if (!isNaN(size) && size > 0 && size <= 300) {
              storage.emojiSize = size;
            }
          }}
          placeholder="48"
          keyboardType="numeric"
        />
      </FormRow>
      
      <FormText style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
        Use emojis animados e de outros servidores sem precisar de Nitro! 
        O plugin irá substituí-los automaticamente ao enviar mensagens.
      </FormText>
    </FormSection>
  );
};
