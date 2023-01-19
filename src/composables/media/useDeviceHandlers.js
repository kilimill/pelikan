var cameraCheckList = [
  {
    "label": "1080p(FHD)",
    "width": 1920,
    "height": 1080,
    "ratio": "16:9",
    "bitrate": 2048000
  },
  {
    "label": "UXGA",
    "width": 1600,
    "height": 1200,
    "ratio": "4:3",
    "bitrate": 1536000
  },
  {
    "label": "720p(HD)",
    "width": 1280,
    "height": 720,
    "ratio": "16:9",
    "bitrate": 1024000
  },
  {
    "label": "SVGA",
    "width": 800,
    "height": 600,
    "ratio": "4:3",
    "bitrate": 768000
  },
  {
    "label": "VGA",
    "width": 640,
    "height": 480,
    "ratio": "4:3",
    "bitrate": 512000
  },
];

var currentUsedBitrate = ref(0);

import {computed, ref} from 'vue';

export default function useDeviceHandlers(){

  const checkPermissions = () => {
    //in case user agent has no permissions api, we count that as true.
    if (!navigator.permissions) {
      return new Promise(() => {
        return {
          audio: true,
          video: true,
        };
      });
    }

    let micPermissionPromise
      = navigator.permissions.query({ name: 'microphone' });
    let cameraPermissionPromise
      = navigator.permissions.query({ name: 'camera' });
    return Promise.all([micPermissionPromise, cameraPermissionPromise]).
      then((values) => {
        return {
          audio: values[0].state === 'granted',
          video: values[1].state === 'granted',
        };
      }).catch(() => {
        return {
          audio: true,
          video: true,
        }
      });
  }

  const eDevices = (audioList, videoList) => {
    return navigator.mediaDevices.enumerateDevices()
    .then((devices) => {
      return gotDevices(devices, audioList, videoList);
    }).catch((error) => {
      console.error(error);
    });
  }

  const enumerateDevices = () => {
    let audioList = [],videoList = [];
    let audioSelected, videoSelected;

    return eDevices(
      audioList,
      videoList
    ).then((selected) => {
      audioSelected = selected.audio;
      videoSelected = selected.video;

      selected = getStoredDevices(
        audioList,
        videoList,
        audioSelected,
        videoSelected
      );
      audioSelected = selected.audio;
      videoSelected = selected.video;
      storeSelectedDevices(audioSelected, videoSelected);

      return {
        audio:{
          selected: audioSelected,
          list: audioList
        },
        video:{
          selected: videoSelected,
          list: videoList
        },
      };
    });
  }

  const getMediaStream = () => {
    return enumerateDevices().then(async (media) => {
      let constr = await getMediaConstraints(
        media.audio.list.length > 0,
        media.video.list.length > 0,
        media.audio.selected,
        media.video.selected,
      );

      return getUserMedia(constr).then((stream) => {
        return {
          stream: stream,
          media: media,
        };
      }).catch((error) => {
        console.error(error);
      });
    });
  }

  const gotDevices = (deviceInfos, audioList, videoList) => {
    let audioSelected, videoSelected;
    for (let i = 0; i !== deviceInfos.length; ++i) {
      let deviceInfo = deviceInfos[i];
      if(deviceInfo.deviceId === ""){
        continue;
      }
      if (deviceInfo.kind === 'audioinput') {
        audioList.push({
          id: deviceInfo.deviceId,
          value: deviceInfo.deviceId,
          label: deviceInfo.label
        });
        if(audioList.length === 1){
          audioSelected = audioList[0].value;
        }
      } else if (deviceInfo.kind === 'videoinput') {
        videoList.push({
          id: deviceInfo.deviceId,
          value: deviceInfo.deviceId,
          label: deviceInfo.label
        });
        if(videoList.length === 1){
          videoSelected = videoList[0].value;
        }
      }
    }
    return {
      audio: audioSelected,
      video: videoSelected
    }
  }


  const getStoredDevices = (audioList, videoList, currentAudioDeviceId, currentVideoDeviceId) => {

    let audioVal = sessionStorage.getItem('Pelikan.echoTest.audioSelected');
    let videoVal = sessionStorage.getItem('Pelikan.echoTest.videoSelected');

    if(
      audioVal
      && checkDeviceInArray(
        audioVal,
        audioList
      )
    ){
      currentAudioDeviceId = audioVal;
    }
    if(
      videoVal
      && checkDeviceInArray(
        videoVal,
        videoList
      )
    ){
      currentVideoDeviceId = videoVal;
    }

    return {
      audio: currentAudioDeviceId,
      video: currentVideoDeviceId
    };
  }

  const checkDeviceInArray = (id, array) => {
    for (const item of array) {
      if(item.value === id){
        return true;
      }
    }
    return false;
  }
  const storeSelectedDevices = (audioValue, videoValue) => {
    sessionStorage.setItem('Pelikan.echoTest.audioSelected', audioValue);
    sessionStorage.setItem('Pelikan.echoTest.videoSelected', videoValue);
  }
  const removeSelectedDevices = () => {
    if(sessionStorage.getItem('Pelikan.echoTest.audioSelected')){
      sessionStorage.removeItem('Pelikan.echoTest.audioSelected');
    }
    if(sessionStorage.getItem('Pelikan.echoTest.videoSelected')){
      sessionStorage.removeItem('Pelikan.echoTest.videoSelected');
    }
  }

  const getMediaConstraints = async (userHasAudio, userHasVideo, audioDeviceId = '', videoDeviceId = '') => {
    let audio = false, video = false;

    if (userHasAudio && audioDeviceId) {
      audio = {
        deviceId: {
          exact: audioDeviceId,
        },
      };
    }

    if (userHasVideo && videoDeviceId) {
      let resolution = await getCameraResolution(videoDeviceId)
      currentUsedBitrate.value = cameraCheckList.find(x => x.width === resolution.width)?.bitrate
      video = {
        width: {exact: resolution.width},
        height: {exact: resolution.height},
        deviceId: {
          exact: videoDeviceId,
        },
      };
    }

    return {
      audio: audio,
      video: video,
    };
  }

  const gumCheck = (candidate, deviceId) => {
      //create constraints object
      let constraints = {
        audio: false,
        video: {
          deviceId: deviceId ? {exact: deviceId} : undefined,
          width: {exact: candidate.width},    //new syntax
          height: {exact: candidate.height}   //new syntax
        }
      };

      return navigator.mediaDevices.getUserMedia(constraints)
  }

  const getCameraResolution = async (videoDeviceId) => {
    let width, height;

    for (const candidate of cameraCheckList) {
      await gumCheck(candidate, videoDeviceId).then(() => {
        width = candidate.width
        height = candidate.height
      }).catch((error) => {
        console.log('getUserMedia error!', error);
      });
      if(width && height){
        return new Promise((resolve) => {
          resolve({
            width: width,
            height: height
          })
        })
      }
    }
  }

  const devicesChangeHandler = async (userHasAudio, userHasVideo, audioDeviceId = '', videoDeviceId = '') => {
    storeSelectedDevices(audioDeviceId, videoDeviceId);
    let constraints
      = await getMediaConstraints(
      userHasAudio,
      userHasVideo,
      audioDeviceId,
      videoDeviceId);

    if(!userHasAudio && !userHasVideo){
      return Promise.resolve();
    }

    return getUserMedia(constraints);
  }
  const getUserMedia = (constraints) => {
    return navigator.mediaDevices.getUserMedia(constraints)
    .then((stream) => {
      return stream;
    });
  }

  const getScreenMedia = () => {
    return navigator.mediaDevices.getDisplayMedia({
      audio: false,
      video: true
    }).then((stream) => {
      return stream;
    });
  }

  const getFilteredStream = (audioOn, videoOn, stream) => {
    let tracks = [];

    if(audioOn && stream.getAudioTracks().length > 0){
      tracks.push(stream.getAudioTracks()[0]);
    }

    if(videoOn && stream.getVideoTracks().length > 0){
      tracks.push(stream.getVideoTracks()[0]);
    }

    return new MediaStream(tracks);
  }

  return {
    checkPermissions,
    enumerateDevices,
    getMediaStream,
    gotDevices,
    getStoredDevices,
    checkDeviceInArray,
    storeSelectedDevices,
    removeSelectedDevices,
    getMediaConstraints,
    devicesChangeHandler,
    getUserMedia,
    getScreenMedia,
    getFilteredStream,
    currentBitrate: computed(() => currentUsedBitrate.value)
  }
}