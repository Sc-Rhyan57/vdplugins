import { React } from "@vendetta/metro/common";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms } from "@vendetta/ui/components";
import { storage } from "@vendetta/plugin";

const { FormSection, FormRow, FormSwitch, FormText, FormDivider } = Forms;

export default () => {
  if (!storage.method) storage.method = "new";
  if (!storage.imageSize) storage.imageSize = 48;

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
};
