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

export const fetchData = async () => {
    try {
        data = await (await safeFetch("https://usrbg.is-hardly.online/users", { cache: "no-store" })).json()
        return data
    } catch (e) {
        logger.error("Falha ao buscar dados userBG", e)
    }
}

export const onLoad = async () => {
    await fetchData()
    if (!data) return showToast("Falha ao carregar o banco de dados")

    unpatch = after("getUserBannerURL", getUserBannerURL, ([user]) => {
        if (user?.banner !== undefined) return
        
        const userID = user?.id
        if (!userID) return
        
        const customBanner = data?.find((i: userBGData) => i.uid === userID)
        if (customBanner) return `https://usrbg.is-hardly.online/usrbg/v2/${userID}`
    })
}

export const onUnload = () => unpatch?.()

export const settings = Settings