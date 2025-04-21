import { logger } from "@vendetta"
import { findByProps } from "@vendetta/metro"
import { after } from "@vendetta/patcher"
import { safeFetch } from "@vendetta/utils"
import { showToast } from "@vendetta/ui/toasts"
import { getAssetIDByName } from "@vendetta/ui/assets"

import Settings from "./Settings"

const getUserBannerURL = findByProps("default", "getUserBannerURL")

let unpatch: () => void

// Modificando para usar a nova API
export const fetchBannerForUser = async (userId: string) => {
    try {
        const response = await safeFetch(`https://usrbg.is-hardly.online/usrbg/v2/${userId}`, { cache: "no-store" })
        if (response.status === 200) {
            const bannerData = await response.json()
            return bannerData.url
        }
        return null
    } catch (e) {
        logger.error(`Failed to fetch banner for user ${userId}`, e)
        return null
    }
}

// Mantenho essa função para compatibilidade com o botão Reload DB
export const fetchData = async () => {
    try {
        // Apenas retornamos true pois não precisamos mais carregar a database inteira
        return true
    } catch (e) {
        logger.error("Failed in fetchData", e)
        return false
    }
}

export const onLoad = async () => {
    await fetchData()

    unpatch = after("getUserBannerURL", getUserBannerURL, async ([user]) => {
        // Se o usuário não tem banner definido, tentamos buscar um personalizado
        if (user?.id && user?.banner === undefined) {
            try {
                const customBannerUrl = await fetchBannerForUser(user.id)
                if (customBannerUrl) return customBannerUrl
            } catch (e) {
                logger.error(`Error fetching banner for ${user.id}`, e)
            }
        }
    })
}

export const onUnload = () => unpatch?.()

export const settings = Settings
