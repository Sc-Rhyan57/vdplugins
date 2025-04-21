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
            onPress={() => url.openDeeplink("https://discord.gg/TeRQEPb")}
        />
        <FormRow
            label="Reload Banner System"
            leading={<FormRow.Icon source={getAssetIDByName("ic_message_retry")} />}
            onPress={async () => {
                const fetch = await fetchData()
                if (!fetch) return showToast("Failed to reload banner system", getAssetIDByName("small"))
                return showToast("Banner system reloaded", getAssetIDByName("check"))
            }}
        />
        <FormRow
            label="Banner API"
            leading={<FormRow.Icon source={getAssetIDByName("ic_link")} />}
            subLabel="usrbg.is-hardly.online"
        />
    </FormSection>
</ScrollView>)
