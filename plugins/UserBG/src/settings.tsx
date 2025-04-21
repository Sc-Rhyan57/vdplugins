import { React, url } from "@vendetta/metro/common"
import { getAssetIDByName } from "@vendetta/ui/assets"
import { Forms, General } from "@vendetta/ui/components"
import { showToast } from "@vendetta/ui/toasts"
import { storage } from "@vendetta/plugin"

import { fetchData } from "./index"

const { ScrollView } = General
const { FormSection, FormRow, FormSwitch } = Forms

export default () => {
    storage.nitroBanner ??= true
    
    return (
        <ScrollView>
            <FormSection>
            <FormSection>
                <FormRow
                    label="Rhyan57"
                    leading={<FormRow.Icon source={getAssetIDByName("Discord")} />}
                    trailing={FormRow.Arrow}
                    onPress={() => url.openDeeplink("https://discord.gg/nqRYDf3tu8")}
                />
                <FormRow
                    label="Discord Server"
                    leading={<FormRow.Icon source={getAssetIDByName("Discord")} />}
                    trailing={FormRow.Arrow}
                    onPress={() => url.openDeeplink("https://discord.gg/TeRQEPb")}
                />
                <FormRow
                    label="Reload DB"
                    leading={<FormRow.Icon source={getAssetIDByName("ic_message_retry")} />}
                    onPress={async () => {
                        const fetch = await fetchData()
                        if (!fetch) return showToast("falha ao recarregar o banco de dados", getAssetIDByName("small"))
                        return showToast("Reloaded DB", getAssetIDByName("check"))
                    }}
                />
                <FormRow
                    label="Respeitar banners Nitro"
                    subLabel="Não substituir banners existentes"
                    leading={<FormRow.Icon source={getAssetIDByName("ic_nitro_badge_24px")} />}
                    trailing={
                        <FormSwitch
                            value={storage.nitroBanner}
                            onValueChange={(value) => {
                                storage.nitroBanner = value
                            }}
                        />
                    }
                />
            </FormSection>
        </ScrollView>
    )
}