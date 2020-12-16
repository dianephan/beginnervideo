(() => {
    'use strict';
    const TWILIO_DOMAIN = location.host; 
    const ROOM_NAME = 'myfirstvideoapp';
    const Video = Twilio.Video;
    let videoRoom, localStream;
    const video = document.getElementById("video");
   
    // preview video in nav doesn't show up bc this is commented out 
    // navigator.mediaDevices.getUserMedia({video: true, audio: true})
    // .then(vid => {
    //     video.srcObject = vid;
    //     localStream = vid;
    // })

    const joinRoomButton = document.getElementById("button-join");
    const leaveRoomButton = document.getElementById("button-leave");

    joinRoomButton.onclick = () => {
      // get access token
      axios.get(`https://${TWILIO_DOMAIN}/generatetoken`).then(async (body) => {
        const token = body.data.token;
        Video.connect(token, { 
          name: ROOM_NAME,
          video: true,
          audio: true
        }).then((room) => {
          // console.log(`Connected to Room ${room.name}`);
          videoRoom = room;
          joinRoomButton.disabled = true;
          leaveRoomButton.disabled = false;

          //loads all existing participants ((NEW LINES))
          addLocalParticipant(room.localParticipant)
          room.participants.forEach(participant => participantConnected(participant));

          // when new participant connects or disconnects          
          room.on("participantConnected", participantConnected);
          room.on("participantDisconnected", participantDisconnected);

            room.once("disconnected", (error) =>
              room.participants.forEach(participantDisconnected)
            );
          });
      });
    };
    leaveRoomButton.onclick = () => {
      videoRoom.disconnect();
      // console.log(`Disconnected from Room ${videoRoom.name}`);
      joinRoomButton.disabled = false;
      leaveRoomButton.disabled = true;
    };
})();

const participantConnected = (participant, local=false) => {
  participant.on('trackSubscribed', track => addTrack(participant.sid, track));
  participant.on('trackUnsubscribed', trackUnsubscribed);
}

// new function 
const addLocalParticipant = participant => {
  console.log('adding local participant')
  participant.tracks.forEach(publication => {
      addTrack(participant.sid, publication.track)
  });
}

const participantDisconnected = (participant) => {
  console.log(`Participant ${participant.identity} disconnected.`);
  document.getElementById(participant.sid).remove();
}

const trackSubscribed = (div, track) => {
  div.appendChild(track.attach());
}

// new function 
const addTrack = (sid, track) => {
  console.log(track)
  const div = document.createElement('div'); // create div for new participant
  div.id = sid;
  div.classList.add('remoteParticipant');
  div.appendChild(track.attach());
  document.body.appendChild(div);
}

const trackUnsubscribed = (track) => {
  track.detach().forEach(element => element.remove());
}