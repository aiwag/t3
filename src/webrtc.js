let localStream;
let remoteStream;
let peerConnection;

const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
  ],
};

export const startWebRTC = async () => {
  peerConnection = new RTCPeerConnection(configuration);

  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      // Send the candidate to the remote peer
      sendMessage({ type: 'ice-candidate', candidate: event.candidate });
    }
  };

  peerConnection.ontrack = (event) => {
    remoteStream = event.streams[0];
    // Display remote stream in the UI
    console.log('Received remote stream');
  };
};

export const createOffer = async () => {
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  sendMessage({ type: 'offer', offer });
};

export const handleOffer = async (offer) => {
  await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  sendMessage({ type: 'answer', answer });
};

export const handleAnswer = (answer) => {
  peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
};

export const handleIceCandidate = (candidate) => {
  peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
};