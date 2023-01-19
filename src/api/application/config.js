export default {
  defaultRoomSettings() {
    return {
      "activeBoardId": 0,
      "activeMountPointId": 0,
      "blockPrivateChat": true,
      "blockPublicChat": true,
      "blockRaiseHand": true,
      "boardIsActive": false,
      "currentPresId": 0,
      "currentSlide": 1,
      "currentVPDF": false,
      "drawMode": false,
      "playbackAccess": true,
      "presStrictMode": false,
      "screenCaptureActive": false,
      "soundPrivateChatMessage": true,
      "soundPublicChatMessage": true,
      "soundRaiseHand": true,
      "userCallControl": false,
      "userCallDrawMode": true,
      "videoStrictMode": false,
      "typeIpAudioOn": true,
      "conferenceAudio": true,
      "conferenceVideo": false,
      "largePlayerUserId": 0
    }
  },
  idbSettings() {
    return {
      "dbName": "roomIDB",
      "storeName": "events",
      "chunkLength": "10"
    }
  },
}