import { React, url } from "@vendetta/metro/common"
import { getAssetIDByName } from "@vendetta/ui/assets"
import { Forms, General } from "@vendetta/ui/components"
import { showToast } from "@vendetta/ui/toasts"

import { fetchData } from "./index"

const { ScrollView } = General
const { FormSection, FormRow } = Forms

export default () => (<ScrollView>
    <FormSection title="UserAvatar - Fotos de Perfil Personalizadas">
        <FormRow
            label="Discord Server"
            leading={<FormRow.Icon source={getAssetIDByName("Discord")} />}
            trailing={FormRow.Arrow}
            onPress={() => url.openDeeplink("https://discord.gg/SeuServidor")}
        />
        <FormRow
            label="Recarregar API"
            leading={<FormRow.Icon source={getAssetIDByName("ic_message_retry")} />}
            onPress={async () => {
                const fetch = await fetchData()
                if (!fetch) return showToast("Falha ao recarregar a API de avatares", getAssetIDByName("small"))
                return showToast("API de avatares recarregada!", getAssetIDByName("check"))
            }}
        />
        <FormRow
            label="Como usar"
            leading={<FormRow.Icon source={getAssetIDByName("ic_help")} />}
            trailing={FormRow.Arrow}
            onPress={() => url.openDeeplink("https://github.com/Seu-Usuario/UserAvatar")}
            subLabel="Saiba como adicionar sua própria foto de perfil personalizada"
        />
        <FormRow
            label="API de avatares"
            leading={<FormRow.Icon source={getAssetIDByName("ic_link")} />}
            subLabel="https://useravatar.vercel.app/v1"
        />
    </FormSection>
</ScrollView>)
