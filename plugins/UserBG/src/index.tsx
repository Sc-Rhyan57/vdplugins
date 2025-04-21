import { logger } from "@vendetta"
import { findByProps } from "@vendetta/metro"
import { after } from "@vendetta/patcher"
import { safeFetch } from "@vendetta/utils"
import { showToast } from "@vendetta/ui/toasts"

import Settings from "./Settings"

interface userBGData {
    _id: string
    uid: string
    img: string
    orientation: string
}

const getUserBannerURL = findByProps("default", "getUserBannerURL")

let data: userBGData[]
let unpatch: () => void
let updateInterval: NodeJS.Timeout

export const fetchData = async () => {
    try {
        const response = await safeFetch("https://raw.githubusercontent.com/Sc-Rhyan57/USERBANNER/refs/heads/main/data.json", { cache: "no-store" })
        const newData = await response.json()
        
        if (JSON.stringify(data) !== JSON.stringify(newData)) {
            data = newData
            logger.log("[ USERBANNER ] Dados atualizados com sucesso!")
            showToast("betterBanners atualizado!")
        }
        
        return data
    } catch (e) {
        logger.error("[ USERBANNER ] API NÃO RESPONDEU!", e)
    }
}

const startPeriodicUpdates = (intervalMs = 60000) => {
    if (updateInterval) clearInterval(updateInterval)
    
    updateInterval = setInterval(async () => {
        await fetchData()
    }, intervalMs)
}

export const onLoad = async () => {
    await fetchData()
    if (!data) return showToast("FALHA AO CARREGAR USERBANNER")

    unpatch = after("getUserBannerURL", getUserBannerURL, ([user]) => {
        const customBanner = data?.find((i: userBGData) => i.uid === user?.id)
        if (user?.banner === undefined && customBanner) return customBanner.img
    })
    
    startPeriodicUpdates()
}

export const onUnload = () => {
    unpatch?.()
    
    if (updateInterval) clearInterval(updateInterval)
}

export const settings = Settings
