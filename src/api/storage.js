import axios from "axios";

const api = axios.create({
    baseURL: `${process.env.VUE_APP_STORAGE}storage/`,
    withCredentials: true,
});

export default {
    downloadMaterial(id){
        return api({
            method: 'GET',
            url: `/download-material/${id}`,
            responseType: 'blob'
        });
    },
    downloadPresentation(id){
        return api({
            method: 'GET',
            url: `/download-presentation/${id}`,
            responseType: 'blob'
        });
    },
    downloadFile(id){
        return api({
            method: 'HEAD',
            url: `/file/${id}`,
        });
    },
    deleteMaterial(id){
        return api({
            method: 'GET',
            url: `/delete-material/${id}`,
        });
    },
    auth(token){
        return api({
            method: 'POST',
            url: `/auth`,
            data: {
                token: token,
            },
        });
    }
}