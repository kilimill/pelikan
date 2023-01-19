import {Janus} from 'janus-gateway';
import { Plugin } from '@/services/janus/plugins/Plugin';

export class EchoTestPlugin extends Plugin {

  audioMicStuff = {
    canvasContext: undefined,
    audioContext: undefined,
    analyser: undefined,
    microphone: undefined,
    javascriptNode: undefined
  }

  constructor (janus) {
    super(janus, Plugin.TYPE_ECHOTEST);
    this.player = janus.janusService.players.echo;
  }

  attachCallbackSuccess (pluginHandle) {
    this.handle = pluginHandle;
    this.janus.config.successCallback();
  }

  attachCallbackOnMessage (msg, jsep) {
    Janus.debug(msg);
    Janus.debug(jsep);
    if (jsep !== undefined && jsep !== null) {
      Janus.debug("Handling SDP as well...");
      Janus.debug(jsep);
      this.handle.handleRemoteJsep({ jsep: jsep });
    }
  }

  attachCallbackOnRemoteStream (stream) {
    Janus.attachMediaStream(this.player, stream);
  }

  attachCallbackError (error) {
    Janus.error(error);
  }

  createEchoTestOffer (stream, bitrate) {
    this.handle.createOffer({
      media: {
        replaceAudio: true,
        replaceVideo: true,
        update: false,
      },
      stream: stream,
      success: (jsep) => {
        this.handle.send({
          'message': {
            'request': 'configure',
            'bitrate': bitrate,
          },
          'jsep': jsep,
        });

      },
      error: (error) => {
        Janus.error('WebRTC error:', error);
      },
    });
  }
}