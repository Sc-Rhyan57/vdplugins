import { logger } from "@vendetta";
import { findByProps, findByName } from "@vendetta/metro";
import { before, instead } from "@vendetta/patcher";
import { safeFetch } from "@vendetta/utils";
import { showToast } from "@vendetta/ui/toasts";
import { getAssetIDByName } from "@vendetta/ui/assets";

import Settings from "./Settings";

interface UserAvatarData {
    _id: string;
    uid: string;
    img: string;
    animated: boolean;
}

const UserStore = findByName("UserStore");
const getUserAvatarURL = findByProps("getUserAvatarURL");
const Avatar = findByName("Avatar") ?? findByProps("AvatarSize").Avatar;

let data: UserAvatarData[];
let unpatch: () => void;
let updateInterval: NodeJS.Timeout;
let avatarCache = new Map<string, string>();

export const fetchData = async (forceUpdate = false) => {
    try {
        const response = await safeFetch("https://raw.githubusercontent.com/Sc-Rhyan57/USERAVATAR/refs/heads/main/data.json", {
            cache: "no-store",
            headers: { "Cache-Control": "no-cache" }
        });
        
        const newData = await response.json();
        
        if (forceUpdate || JSON.stringify(data) !== JSON.stringify(newData)) {
            data = newData;
            avatarCache.clear();
            logger.log("[USERAVATAR] Dados atualizados!");
            showToast("UserAvatar atualizado!", getAssetIDByName("check"));
        }
        
        return data;
    } catch (e) {
        logger.error("[USERAVATAR] Erro na API!", e);
        showToast("Falha ao atualizar UserAvatar!", getAssetIDByName("small"));
        return null;
    }
};

const forceClearAvatarCache = (userId: string) => {
    const user = UserStore.getUser(userId);
    if (user) {
        delete user.avatar;
        delete user._avatar;
        UserStore.emitChange();
    }
};

export const onLoad = async () => {
    await fetchData(true);
    if (!data) return showToast("FALHA AO CARREGAR USERAVATAR", getAssetIDByName("small"));

    unpatch = before("getUserAvatarURL", getUserAvatarURL, (args) => {
        const [user, options] = args;
        if (!user?.id) return args;

        const customAvatar = data?.find(i => i.uid === user.id.toString());
        if (customAvatar) {
            const timestamp = Date.now();
            const avatarUrl = `${customAvatar.img}?t=${timestamp}`;
            avatarCache.set(user.id, avatarUrl);
            forceClearAvatarCache(user.id);
            
            return [{
                ...user,
                avatar: customAvatar._id,
                _avatar: avatarUrl
            }, {
                ...options,
                forcePNG: !customAvatar.animated,
                size: options?.size || 128
            }];
        }
        
        return args;
    });

    instead("render", Avatar, (args, orig) => {
        const [props] = args;
        if (!props?.user?.id) return orig(...args);

        const cachedUrl = avatarCache.get(props.user.id);
        if (cachedUrl) {
            return orig({
                ...props,
                source: { uri: cachedUrl },
                user: {
                    ...props.user,
                    avatar: undefined
                }
            });
        }

        return orig(...args);
    });

    if (updateInterval) clearInterval(updateInterval);
    updateInterval = setInterval(() => fetchData(), 60000);
};

export const onUnload = () => {
    unpatch?.();
    clearInterval(updateInterval);
    avatarCache.clear();
    UserStore.emitChange();
};

export const settings = Settings;
