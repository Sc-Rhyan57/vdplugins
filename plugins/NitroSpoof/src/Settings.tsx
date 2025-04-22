import { React } from "@vendetta/metro/common";
import { useProxy } from "@vendetta/storage";
import { storage } from "@vendetta/plugin";
import { Forms } from "@vendetta/ui/components";
import { getAssetIDByName } from "@vendetta/ui/assets";

const { FormSection, FormRow, FormSwitch, FormDivider, FormInput, FormText } = Forms;

export default () => {
  useProxy(storage);

  return (
    <FormSection title="Configurações do BetterEmojis">
      <FormRow
        label="Método Antigo"
        subLabel="Envia o emoji no formato \<:NOME-DO-EMOJI:ID-DO-EMOJI>"
        leading={<FormRow.Icon source={getAssetIDByName("ic_message_edit")} />}
        trailing={
          <FormSwitch
            value={storage.method === "old"}
            onValueChange={() => {
              storage.method = "old";
            }}
          />
        }
      />

      <FormRow
        label="Método Novo"
        subLabel="Extrai e envia o link da imagem do emoji"
        leading={<FormRow.Icon source={getAssetIDByName("ic_image")} />}
        trailing={
          <FormSwitch
            value={storage.method === "new"}
            onValueChange={() => {
              storage.method = "new";
            }}
          />
        }
      />

      <FormDivider />

      <FormRow
        label="Tamanho da Imagem"
        subLabel="Define o tamanho dos emojis no método novo (16-128px)"
        leading={<FormRow.Icon source={getAssetIDByName("ic_settings_boost")} />}
        trailing={
          <FormInput
            value={String(storage.imageSize)}
            keyboardType="numeric"
            placeholder="48"
            onChange={(v) => {
              const size = parseInt(v.nativeEvent.text);
              if (!isNaN(size) && size >= 16 && size <= 128) {
                storage.imageSize = size;
              }
            }}
            style={{ textAlign: "right" }}
          />
        }
      />

      <FormText style={{ padding: 16, opacity: 0.5 }}>
        Este plugin permite usar emojis como se você tivesse Discord Nitro.
        Escolha o método que funciona melhor para você.
      </FormText>
    </FormSection>
  );
};
