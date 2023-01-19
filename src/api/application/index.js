import api from "@/api"
import Config from "@/abstract/ConfigurationBuilder"
import configMap from "@/api/application/configMap";
import DrawActionsReducer from "@/api/application/reducers/DrawActionsReducer";
import config from "@/api/application/config";
import storageApi from '@/api/storage';

/**
 * Configure object by definition
 * @param {Object} source
 * @param {Object} destination
 * @return {*}
 */
const configure = function (destination, source) {
    const configured = (new Config(destination, source, configMap)).build()
    DrawActionsReducer.reduce(configured, "drawActions")
    return configured
}

export default {
    entryPoint: () => {
        return api.get("data/entry").then(({data: {room}}) => ({
            statusId: room['status_id'],
            recordStatusId: room['record_status_id']
        }))
    },
    initRoom: () => {
        let config = {}
        return api.get('data/ui').then(response => {
            return configure(config, response.data)
        }).catch(reason => {
            return Promise.reject(reason)
        })
    },
    initPlayback: () => {
        return api.get('data/playback')
        .then(responsePlayback => {
            return storageApi.auth(responsePlayback.data.token).then(() => {
                return Promise.resolve(responsePlayback);
            })
        })
        .then(response => {
            let settings = response.data.settings.playback;
            if (!sessionStorage.getItem('enableSwitchEventPlace')) {
                sessionStorage.setItem('enableSwitchEventPlace', true);
            } 
            
            let obj = Object.assign(response.data, {
                "settings": {
                    "room": config.defaultRoomSettings()
                },
                "playbackStore": config.idbSettings()
            });
            obj.settings.playback = settings;
            return configure({}, obj)
        })
    },
}