function setConfirmUnload(on) {
    window.onbeforeunload = (on) ? unloadMessage : null;
}

function unloadMessage() {
    return "Your live event is still transmitting the local buffer. If you leave the current page the transmission will be interrupted.";
}

function jsLog(message) {
    console.log(message);
    $('#krecord_msg').text(message);
}


function toHHMMSS (sec_num) {
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    var time    = hours+':'+minutes+':'+seconds;
    return time;
}

jsLog('set up prototype');

var krecordLiveHandlerPrototype = function() {

    this.interval = 0;
    this.timer = 0;


    this.startStreaming = function() {
        var krec = document.getElementById('krecord');
        krec.startRecording();
        $("#btn_stream").hide();
    }

    this.stopStreaming = function() {
        var krec = document.getElementById('krecord');
        krec.stopRecording();
        $("#btn_stop").hide();
        window.clearInterval(krecordHandler.interval);
    }


    this.updateTimer = function() {
        this.timer++;
        $("#timer").html('<i class="icon-circle text-error"></i> ' + toHHMMSS(this.timer));
    }

    // ------------------------------------------
    // KRecord event handlers
    // ------------------------------------------


    this.deviceDetected = function() {
        jsLog('detected device');
    }

    this.recordStart = function() {
        jsLog('record started');
        $("#btn_stream").hide();
        $("#btn_stop").show();
        krecordHandler.interval = window.setInterval(function(){krecordHandler.updateTimer()}, 1000);
        setConfirmUnload(true);
    }

    this.recordComplete = function() {
        setConfirmUnload(false);
        jsLog('record stopped');
        $("#btn_stream").show();
        $("#btn_stop").hide();
        $("#krecordwrapper").remove();
        $("#btn_stream").remove();
    }

    /*
     *  connection to media server failed
     */
    this.netconnectionConnectFailed = function() {
        alert('connection to media server failed');
        jsLog('netconnectionConnectFailed');
    }

    /*
     * connection to media server failed
     */
    this.netconnectionConnectInvalidapp = function() {
        alert('connection to media server failed');
        jsLog('netconnectionConnectInvalidapp');
    }

    /*
     * connection to media server failed
     */
    this.netconnectionConnectClosed = function() {
        alert('connection to media server failed');
        jsLog('netconnectionConnectClosed');
    }

    /*
     * connection to media server failed
     */
    this.netconnectionConnectRejected = function() {
        alert('connection to media server failed');
        jsLog('netconnectionConnectRejected');
    }


    this.connected = function() {
        jsLog('connected');
        $("#btn_stream").show();
        $("#setupKRecord_msg").hide();
    }

    this.connecting = function(){
        jsLog('connecting');
    }

    this.errorCamera = function() {
        jsLog('errorCamera');
    }

    this.errorMicrophone = function() {
        jsLog('errorMicrophone');
    }

    this.cameraDenied = function() {
        jsLog('cameraDenied');
    }

    this.microphoneDenied = function() {
        jsLog('microphoneDenied');
    }
}


var krecordHandler = new krecordLiveHandlerPrototype();
var broadcastID = '<%-  results[1].id  %>';
var statusCheckTimeout = 2000;
var kdp = null;

function startStreaming() {
  $('#kaltura_player').empty();
  $('#playertype').text('');
  krecordHandler.startStreaming();

  var checkStatusTimer = null;
  var liveTestStart = new Date().getTime();
  var checkStatus_isLive = function() {
    new kWidget.api( { 'wid' : "_<%-  answers.partnerId  %>" })
    .doRequest({'service':'liveStream', 'action': 'islive', 'id': broadcastID, 'protocol': 'auto',  "cache_st": Math.floor((Math.random() * 10000000) + 1) }, 
      function( data ){
        if (data == false) {
          console.log( 'Live stream playback is not ready yet... ' + data );
          clearTimeout(checkStatusTimer);
          checkStatusTimer = setTimeout(checkStatus_isLive, statusCheckTimeout);
          $('#setupLiveStream_msg').show();
        } else {
          clearTimeout(checkStatusTimer);
          console.log( 'now live! ' + data );
          var liveToPublishTime = (new Date().getTime()) - liveTestStart;
          console.log('Live to Publish initialization time: ' + ms2TimeString(liveToPublishTime));
          $('#kaltura_player').show();
          $('#playertype').text('Watching the live stream:');
          kWidget.embed({
            "targetId": "kaltura_player",
            "wid": "_<%-  answers.partnerId  %>",
            "uiconf_id": "<%-  answers.uiConf  %>",
            "flashvars": {
              "streamerType": "auto",
              'autoPlay': true,
              "externalInterfaceDisabled": false
            },
            "cache_st": 11,
            "entry_id": broadcastID,
            'readyCallback': function( playerId ){
              console.log( "kWidget player ready: " + playerId );
              kdp = $( '#' + playerId ).get(0);
            }
          });
          $('#setupLiveStream_msg').hide();
        }
      }
    );
  };
  checkStatus_isLive();
}

function stopStreaming() {
  krecordHandler.stopStreaming();

  kdp.sendNotification('doStop');
  new kWidget.api({ 'wid' : "_<%-  answers.partnerId  %>", })
    .doRequest({'service':'liveStream', 'action': 'get', 'entryId': broadcastID}, 
      function( data ){
        vodEntryId = data.recordedEntryId;
        playVODRecording();
      }
  );
}

var vodEntryId = null;
var playVODRecording = function () {
  
  $('#playertype').text('Watching last available DVR. Not Live anymore. Waiting for VOD Recording to be ready (this can take several minutes up to few hours):');
  kdp.sendNotification("doPlay");

  var checkVODStatusTimer = null;
  var vodTestStart = new Date().getTime();
  var checkStatus_VODReady = function() {
    new kWidget.api( { 'wid' : "_<%-  answers.partnerId  %>" })
    .doRequest({'service':'media', 'action': 'get', 'entryId': vodEntryId,  "cache_st": Math.floor((Math.random() * 10000000) + 1) }, 
      function( data ){
        if (data.status != 2) {
          console.log( 'VOD Recording is not ready yet... ' + data.id + ' : ' + data.status);
          clearTimeout(checkVODStatusTimer);
          checkVODStatusTimer = setTimeout(checkStatus_VODReady, statusCheckTimeout);
        } else {
          clearTimeout(checkVODStatusTimer);
          console.log( 'VOD Recording now available! ' + data.id + ' : ' + data.status);
          var VODRecordingProcessingTime = (new Date().getTime()) - vodTestStart;
          console.log('VOD Processing time: ' + ms2TimeString(VODRecordingProcessingTime));
          $('#kaltura_player').show();
          $('#playertype').text('Watching the VOD Recording:');
          kWidget.embed({
            "targetId": "kaltura_player",
            "wid": "_<%-  answers.partnerId  %>",
            "uiconf_id": "<%-  answers.uiConf  %>",
            "flashvars": {
              "streamerType": "auto",
              'autoPlay': true,
              "externalInterfaceDisabled": false
            },
            "cache_st": 11,
            "entry_id": data.id,
            'readyCallback': function( playerId ){
              console.log( "kWidget player ready: " + playerId );
              kdp = $( '#' + playerId ).get(0);
            }
          });
        }
      }
    );
  };
  checkStatus_VODReady();
}

function ms2TimeString(a,k,s,m,h){
   return k=a%1e3, // optimized by konijn
    s=a/1e3%60|0,
    m=a/6e4%60|0,
    h=a/36e5%24|0,
    (h?(h<10?'0'+h:h)+':':'')+ // optimized
    (m<10?0:'')+m+':'+  // optimized
    (s<10?0:'')+s+'.'+ // optimized
    (k<100?k<10?'00':0:'')+k // optimized
}

