import { logger } from "@vendetta"
import { findByProps } from "@vendetta/metro"
import { before } from "@vendetta/patcher"
import { safeFetch } from "@vendetta/utils"
import { showToast } from "@vendetta/ui/toasts"
import { getAssetIDByName } from "@vendetta/ui/assets"

import Settings from "./Settings"

interface userAvatarData {
    _id: string
    uid: string
    img: string
    animated: boolean
}

const getUserAvatarURL = findByProps("default", "getUserAvatarURL")

let data: userAvatarData[]
let unpatch: () => void
let updateInterval: NodeJS.Timeout

export const fetchData = async () => {
    try {
        const response = await safeFetch("https://raw.githubusercontent.com/Sc-Rhyan57/USERAVATAR/refs/heads/main/data.json", { cache: "no-store" })
        const newData = await response.json()
        
        if (JSON.stringify(data) !== JSON.stringify(newData)) {
            data = newData
            logger.log("[ USERAVATAR ] Dados atualizados com sucesso!")
            showToast("UserAvatar atualizado!", getAssetIDByName("check"))
        }
        
        return data
    } catch (e) {
        logger.error("[ USERAVATAR ] API NÃO RESPONDEU!", e)
        return null
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
    if (!data) return showToast("FALHA AO CARREGAR USERAVATAR", getAssetIDByName("small"))

    unpatch = before("getUserAvatarURL", getUserAvatarURL, (args) => {
        const user = args[0]
        if (!user || !user.id) return args
        
        const customAvatar = data?.find((i: userAvatarData) => i.uid === user.id)
        if (customAvatar) {
            args[1] = {
                ...args[1],
                forcePNG: !customAvatar.animated,
                size: args[1]?.size || 128
            }
            
            user.avatar = customAvatar._id
        }
        
        return args
    })
    
    startPeriodicUpdates()
}

export const onUnload = () => {
    unpatch?.()
    
    if (updateInterval) clearInterval(updateInterval)
}

export const settings = Settings
