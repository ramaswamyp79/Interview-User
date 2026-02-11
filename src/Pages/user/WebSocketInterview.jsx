import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/WebSocketInterview.css';

const WebSocketInterview = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('disconnected');
  const [transcript, setTranscript] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [email, setEmail] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  
  const socketRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const localMediaStreamRef = useRef(null);
  const lastSpeechTimeRef = useRef(Date.now());
  const silenceCheckIntervalRef = useRef(null);
  const restartTimeIntervalRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const isFirstConnectionRef = useRef(true);
  const qindexRef = useRef(null);
  
  const startButtonRef = useRef(null);
  const stopButtonRef = useRef(null);
  const transcriptBoxRef = useRef(null);
  const answerContainerRef = useRef(null);
  const videoDisplayRef = useRef(null);
  const statusIndicatorRef = useRef(null);
  const dashboardButtonRef = useRef(null);
  const clearButtonRef = useRef(null);
  const sendQuestionRef = useRef(null);
  const questionBoxRef = useRef(null);

  const maxSilenceDuration = 5 * 60 * 1000; // 5 minutes

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const startTimer = () => {
    // Only reset timer on first connection, not on reconnection
    if (isFirstConnectionRef.current) {
      setTimerSeconds(0);
      isFirstConnectionRef.current = false;
    }
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setTimerSeconds(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const updateStatus = (newStatus) => {
    setStatus(newStatus);
    if (statusIndicatorRef.current) {
      statusIndicatorRef.current.className = 'status-badge';
      statusIndicatorRef.current.classList.add(newStatus);
      statusIndicatorRef.current.title = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
    }
  };

  const startTranscriptionProcess = async () => {
    updateStatus('connecting');
    try {
      let currentEmail = email;
      
      // Only request media if a stream doesn't already exist
      if (!localMediaStreamRef.current) {
        if (!currentEmail) {
          currentEmail = prompt("Please Confirm Your Email Address");
          setEmail(currentEmail);
        }
        
        localMediaStreamRef.current = await navigator.mediaDevices.getDisplayMedia({
          video: { width: { ideal: 640 }, height: { ideal: 360 } },
          audio: true
        });
        
        if (videoDisplayRef.current) {
          videoDisplayRef.current.srcObject = localMediaStreamRef.current;
        }
      }

      const audioTracks = localMediaStreamRef.current.getAudioTracks();
      if (audioTracks.length === 0) {
        console.warn("No audio tracks found in the existing stream, requesting new media.");
        localMediaStreamRef.current = await navigator.mediaDevices.getDisplayMedia({
          video: { width: { ideal: 640 }, height: { ideal: 360 } },
          audio: true
        });
        if (videoDisplayRef.current) {
          videoDisplayRef.current.srcObject = localMediaStreamRef.current;
        }
        const newAudioTracks = localMediaStreamRef.current.getAudioTracks();
        if (newAudioTracks.length === 0) {
          throw new Error("Could not get audio track even after re-requesting media.");
        }
      }

      const audioOnlyStream = new MediaStream(audioTracks);

      // Disconnect existing socket if any before creating a new one
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.disconnect();
      }

      // Access Socket.IO from global scope (loaded from CDN)
      socketRef.current = io({
        path: "/socket.io",
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
      });
      updateStatus('connecting');

      socketRef.current.on('connect', () => {
        updateStatus('connected');
        startTimer();
        mediaRecorderRef.current = new MediaRecorder(audioOnlyStream, {
          mimeType: 'audio/webm;codecs=opus',
        });

        mediaRecorderRef.current.ondataavailable = async (event) => {
          if (event.data.size > 0 && socketRef.current?.connected) {
            const buffer = await event.data.arrayBuffer();
            socketRef.current.emit('audioChunk', buffer);
            lastSpeechTimeRef.current = Date.now();
            updateStatus('connected');
          }
        };

        mediaRecorderRef.current.start(250);
        setIsStarted(true);
        if (startButtonRef.current) startButtonRef.current.disabled = true;
        if (stopButtonRef.current) stopButtonRef.current.disabled = false;
        setTranscript('🎙️ Listening...\n');

        socketRef.current.emit('startTranscription', {
          audioEncoding: 'WEBM_OPUS',
          audioSampleRate: 48000,
          languageCode: 'en-US',
          email: currentEmail
        });

        clearInterval(silenceCheckIntervalRef.current);
        silenceCheckIntervalRef.current = setInterval(() => {
          const timeSinceLastSpeech = Date.now() - lastSpeechTimeRef.current;
          if (timeSinceLastSpeech >= maxSilenceDuration && socketRef.current?.connected) {
            console.log("Silence exceeded 5 minutes, stopping capture due to inactivity.");
            updateStatus('idle');
            stopConnection();
          } else if (socketRef.current?.connected) {
            updateStatus('connected');
          }
        }, 60 * 1000);
      });

      socketRef.current.on('transcriptionResult', (data) => {
        setTranscript(data.transcript + '\n');
        lastSpeechTimeRef.current = Date.now();
        updateStatus('connected');
      });

      socketRef.current.on('shortanswer', (data) => {
        if (answerContainerRef.current) {
          const shortanswerdiv = answerContainerRef.current.querySelector('div[name="shortanswer"]');
          if (shortanswerdiv) {
            shortanswerdiv.innerHTML += data;
          }
        }
        updateStatus('connected');
      });

      socketRef.current.on('question', (data) => {
        if (answerContainerRef.current) {
          answerContainerRef.current.innerHTML += data;
        }
        updateStatus('connected');
      });

      socketRef.current.on('qindex', (data) => {
        qindexRef.current = data.trim();
        if (answerContainerRef.current) {
          const answerdiv = answerContainerRef.current.querySelector(`#${qindexRef.current}`);
          if (answerdiv) {
            const shortanswerdiv = answerdiv.querySelector('div[name="shortanswer"]');
            const longanswerdiv = answerdiv.querySelector('div[name="longanswer"]');
          }
        }
      });

      socketRef.current.on('longanswer', (data) => {
        if (answerContainerRef.current) {
          const answerdiv = answerContainerRef.current.querySelector(`#${qindexRef.current}`);
          if (answerdiv) {
            const longanswerdiv = answerdiv.querySelector('div[name="longanswer"]');
            if (longanswerdiv) {
              longanswerdiv.innerHTML += data;
            }
          }
        }
        updateStatus('connected');
      });

      socketRef.current.on('transcriptionError', (error) => {
        console.error('Transcription error from server:', error);
        setTranscript(prev => prev + `\n⚠️ Error with Transcription: ${error}\n`);
        updateStatus('disconnected');
        stopTimer();
        if (startButtonRef.current) startButtonRef.current.disabled = false;
        if (stopButtonRef.current) stopButtonRef.current.disabled = true;
      });

      socketRef.current.on('disconnect', () => {
        clearInterval(silenceCheckIntervalRef.current);
        stopTimer();
        setTranscript(prev => prev + '\n🛑 Disconnected from server.\n');
        if (startButtonRef.current) startButtonRef.current.disabled = false;
        if (stopButtonRef.current) stopButtonRef.current.disabled = true;
        updateStatus('disconnected');
      });

      socketRef.current.on('connect_error', (err) => {
        console.error('Socket.IO connect_error:', err);
        setTranscript(prev => prev + `\n⚠️ Connection Error: ${err}\n`);
        updateStatus('disconnected');
        stopTimer();
        if (startButtonRef.current) startButtonRef.current.disabled = false;
        if (stopButtonRef.current) stopButtonRef.current.disabled = true;
      });

    } catch (error) {
      console.error("Error accessing media devices:", error);
      setTranscript(`⚠️ Error accessing media: ${error.message}\n`);
      if (startButtonRef.current) startButtonRef.current.disabled = false;
      if (stopButtonRef.current) stopButtonRef.current.disabled = true;
      updateStatus('disconnected');
      stopLocalMedia();
    }
  };

  const startTranscription = async () => {
    if (restartTimeIntervalRef.current === null) {
      await startTranscriptionProcess();
      restartTimeIntervalRef.current = setInterval(restartTranscription, 2 * 60 * 1000);
    }
  };

  const restartTranscription = () => {
    console.log("Restarting transcription...");
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (socketRef.current?.connected) {
      socketRef.current.disconnect();
    }
    clearInterval(silenceCheckIntervalRef.current);

    setTimeout(() => {
      startTranscriptionProcess();
    }, 500);
  };

  const stopConnection = (shouldStopMedia = false) => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (socketRef.current?.connected) {
      socketRef.current.disconnect();
    }
    clearInterval(silenceCheckIntervalRef.current);
    clearInterval(restartTimeIntervalRef.current);
    restartTimeIntervalRef.current = null;
    stopTimer();
    isFirstConnectionRef.current = true;
    
    setIsStarted(false);
    if (startButtonRef.current) startButtonRef.current.disabled = false;
    if (stopButtonRef.current) stopButtonRef.current.disabled = true;
    updateStatus('disconnected');

    if (shouldStopMedia) {
      stopLocalMedia();
    }
  };

  const stopLocalMedia = () => {
    if (localMediaStreamRef.current) {
      localMediaStreamRef.current.getTracks().forEach(track => track.stop());
      localMediaStreamRef.current = null;
    }
    if (videoDisplayRef.current?.srcObject) {
      const tracks = videoDisplayRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoDisplayRef.current.srcObject = null;
    }
  };

  const handleClearAnswer = async () => {
    try {
      if (answerContainerRef.current) {
        answerContainerRef.current.innerHTML = "";
      }
    } catch (error) {
      updateStatus('error clearing answers');
    }
  };

  const handleDashboard = () => {
    navigate('/home');
  };

  const handleSendQuestion = async () => {
    try {
      const question = questionBoxRef.current?.value.trim();
      if (question && socketRef.current?.connected) {
        socketRef.current.emit("sendPrompt", { prompt: question });
        if (questionBoxRef.current) questionBoxRef.current.value = '';
      } else {
        console.error("Socket is not connected or question is empty.");
      }
    } catch (error) {
      updateStatus('error sending question');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopConnection(true);
      stopTimer();
    };
  }, []);

  return (
    <div className="websocket-interview-container">
      <div className="top-row">
        <div className="logo-container">
          <img src="/logo.png" alt="Product Logo" />
        </div>
        <div className="file-actions-container">
          <div className="timer-display">
            <img src="/clock-timer.svg" alt="Timer" className="timer-icon" />
            {formatTime(timerSeconds)}
          </div>
          <button 
            id="dashboardButton" 
            className="btn btn-primary btn-sm"
            onClick={handleDashboard}
            ref={dashboardButtonRef}
          >
            Dashboard
          </button>
          <button 
            id="clearButton" 
            className="btn btn-warning btn-sm"
            onClick={handleClearAnswer}
            ref={clearButtonRef}
          >
            Clear Answer
          </button>
        </div>
      </div>

      <div className="middle-row">
        <div className="portion-a">
          <div className="video-wrapper">
            <video 
              id="videoDisplay" 
              autoPlay 
              muted 
              ref={videoDisplayRef}
              className="video-display"
            />
          </div>
          <div className="chat-controls">
            <span 
              id="statusIndicator" 
              className="status-badge disconnected" 
              title="Disconnected"
              ref={statusIndicatorRef}
            />
            <button 
              id="start" 
              className="btn btn-primary btn-sm"
              onClick={startTranscription}
              ref={startButtonRef}
            >
              Connect
            </button>
            <button 
              id="stop" 
              className="btn btn-danger btn-sm" 
              disabled
              onClick={() => stopConnection(true)}
              ref={stopButtonRef}
            >
              Disconnect
            </button>
          </div>
          <textarea 
            id="transcript" 
            readOnly 
            placeholder="Transcription will appear here..." 
            className="transcript-box form-control"
            ref={transcriptBoxRef}
            value={transcript}
          />
          <div className="question-container">
            <textarea 
              id="questionBox" 
              placeholder="Enter your question..." 
              className="form-control"
              ref={questionBoxRef}
            />
            <button 
              id="sendQuestion" 
              className="btn btn-info btn-sm"
              onClick={handleSendQuestion}
              ref={sendQuestionRef}
            >
              Query
            </button>
          </div>
        </div>
        <div className="portion-b">
          <div 
            id="answer-container" 
            className="answer-container"
            ref={answerContainerRef}
          />
        </div>
      </div>
    </div>
  );
};

export default WebSocketInterview;
