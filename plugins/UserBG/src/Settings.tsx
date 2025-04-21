import { React, url } from "@vendetta/metro/common"
import { getAssetIDByName } from "@vendetta/ui/assets"
import { Forms, General } from "@vendetta/ui/components"
import { showToast } from "@vendetta/ui/toasts"

import { fetchData } from "./index"

const { ScrollView } = General
const { FormSection, FormRow } = Forms

export default () => (<ScrollView>
    <FormSection>
        <FormRow
            label="Discord Server"
            leading={<FormRow.Icon source={getAssetIDByName("Discord")} />}
            trailing={FormRow.Arrow}
            onPress={() => url.openDeeplink("https://discord.gg/SPKDvU9ryW")}
        />
        <FormRow
            label="Reload Api"
            leading={<FormRow.Icon source={getAssetIDByName("ic_message_retry")} />}
            onPress={async () => {
                const fetch = await fetchData()
                if (!fetch) return showToast("Falha ao recarregar a api banner", getAssetIDByName("small"))
                return showToast("Banner Api recarregada!", getAssetIDByName("check"))
            }}
        />
        <FormRow
            label="Banner api"
            leading={<FormRow.Icon source={getAssetIDByName("ic_link")} />}
            subLabel="https://github.com/Sc-Rhyan57/USERBANNER"
        />
    </FormSection>
</ScrollView>)
