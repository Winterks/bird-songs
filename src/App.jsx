import { useEffect, useRef, useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import "./App.css";
import parseCSV from "./components/birds/parseCSV";
import rotaryLogo from "./assets/my-rotary-logo.png";

var introText =
"Click Help, if more information is required, " +
"otherwise ";
var startText = 
"Click to Start";
var helpText =
  "The application will scroll through images of each bird in turn." +
  " Click on the bird you want to hear and its song will be played." +
  " If the bird is clicked a second time while playing, it will stop" +
  " the audio and scroll to the next bird.";

var birdies = [];
parseCSV("data.csv", birdies);

function App() {
  var birdHasBeenClicked = useRef(false);
  var introRequired = useRef(true);
  var indexRef = useRef(0);
  var [currentBird, setCurrentBird] = useState(null);
  var [startSpeaking, setStartSpeaking] = useState(false);
  var [isSongPlaying, setIsSongPlaying] = useState(false); // Track if any song is playing
  var audioRef = useRef(null); // Ref to the currently playing audio object
  var songFinishedPlaying = useRef(false); // Flag for automatic song end
  var [triggerRecursion, setTriggerRecursion] = useState(false);
  var bird = useRef(null);
  var ignoreClick = useRef(false); // used to ignore clicks while speaking bird names
  var isListening = useRef(false); // Flag to track listening state
  var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;

  /*if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
    console.log("Speech recognition available");
  };*/
  var SpeechGrammarList = SpeechGrammarList || window.webkitSpeechGrammarList;
  const recognition = new SpeechRecognition();
  // grammars not supported on IOS - nothing gets displayed
  /*const grammar = '#JSGF V1.0; grammar commands; public <command> = start | next | select | play ;';
  const speechRecognitionList = new SpeechGrammarList();
  speechRecognitionList.addFromString(grammar, 1);
  recognition.grammars = speechRecognitionList;*/
  recognition.lang = 'en-GB'; // Set the language
  recognition.continuous = true; // keep listening
  recognition.interimResults = false; // Only final results wanted
  
  recognition.onstart = function() {
      isListening.current = true;
      //console.log('Speech recognition started. Listening:', isListening);
      // Optionally update UI to indicate listening
  };

  recognition.onend = function() {
    isListening.current = false;
      //console.log('Speech recognition ended. Listening:', isListening);
      // Optionally update UI to indicate not listening
  };

  recognition.onresult = function(event) {
    const last = event.results.length - 1;
    let command = event.results[last][0].transcript.toLowerCase().trim();
    //console.log('Recognized command:', command, command.length);
    if (command.lastIndexOf("select") >= 0) {command = "select";}
    if (command.lastIndexOf("play") >= 0) {command = "play";}
    if (command.lastIndexOf("next") >= 0) {command = "next";}
    if (command.lastIndexOf("start") >= 0) {command = "start";}
    if (command.lastIndexOf("help") >= 0) {command = "help";}
    switch (command) {
      case "play": // image on screen waiting to play
      console.log("play  ",isSongPlaying);
      if (!isSongPlaying) {  
        document.getElementById("play").click();
       }       
      break;
      case "select": // image on screen waiting to play
        //console.log("select  ",isSongPlaying);
        if (!isSongPlaying) {  
          document.getElementById("play").click();
         }       
        break;
      case "next": // image on screen and playing, stop playing and move to next bird
       /*console.log("next  ", songFinishedPlaying.current, isSongPlaying);
       if (songFinishedPlaying.current || isSongPlaying) {  // make sure song is playing*/
        document.getElementById("play").click();
      // }        
        break;
      case "start": // start screen displayed waiting for click
        document.getElementById("start").click();
        break;
      case "help": // start screen displayed waiting for click
       //if (!startSpeaking.current) { // make sure we are on the start screen & haven't started scrolling
        document.getElementById("help").click(); 
       //}
        break;  
      default:
        console.log(`Sorry, don't understand - `,command);
    }
   // recognition.stop();
}; // end of onresult


  useEffect(() => {
    // check to see if array is empty
    if (!birdies.length) {
      return;
    }
    
    if (startSpeaking) speakNext();
  }, [startSpeaking, triggerRecursion]);

  return (
    <div className="bird-list">
      {startSpeaking ? null : (
        <>
          <div className="rotary">
            <a
              href="https://www.rotary-ribi.org/clubs/homepage.php?ClubID=175"
              target="_blank"
              rel="noreferrer"
            >
              <img
                src={rotaryLogo}
                alt="Rotary Logo"
                style={{ width: "100px", height: "auto" }}
              />
            </a>
          </div>
          <button
            className="start-button"
            id="start"
            onClick={() => {
              if (!isListening.current) {
                recognition.start(); // start listening
                //console.log("speakstart switch on");
              };
              // Cancel the intro if its playing
              window.speechSynthesis.cancel();
              setStartSpeaking(!startSpeaking);
              indexRef.current = 0; // reset the index
              //recognition.stop(); // stop listening
            }}
          >
            <span>
              British bird songs
              <br />
              {introText}
              <br />
              {startText}
              {introRequired.current ? speakStart() : null}
            </span>
          </button>
          <div className="credits">
           <a href="/bird-songs/credits.html" style={{ textDecoration: 'none', color: "orange" }}>
             Credits
           </a>
          </div>
          <div className="help" 
            id="help"
            onClick={help}
            >
               Help
          </div>
        </>
      )}
      {startSpeaking &&
        birdies.map((bird, index) => (
          <div
            key={index}
            id="next"
            onClick={handleDivClick} 
          >
            <h1>
              {currentBird && currentBird?.preview === bird.preview
                ? currentBird?.preview
                : null}
            </h1>
            {currentBird && currentBird?.preview === bird.preview ? (
              <img
                src={bird.imageSrc}
                className={`bird react vite ${isSongPlaying ? "playing" : ""}`}
                id="play"
                alt="audio bird"
                onClick={playBirdSound}
              />
            ) : null}
          </div>
        ))}
    </div>
  );

  function help () {
    const helpIntro = new SpeechSynthesisUtterance(helpText);   
    
    document.getElementById('start').innerHTML = helpText;
    window.speechSynthesis.speak(helpIntro);
    setTriggerRecursion(!triggerRecursion);

  } // end help

  function playBirdSound () {
    if (ignoreClick.current) return; // ignore the click
    if(!isListening.current){
      recognition.start(); // start listening
      //console.log("playbirdsound switch on");
    };    

      if (isSongPlaying) { // stop it
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsSongPlaying(false);
      } else { // start playing
        audioRef.current = new Audio(currentBird.audioUrl);
        songFinishedPlaying.current = false;
        setIsSongPlaying(true);
       // recognition.stop(); // stop listening
        audioRef.current.play();
      }
      
      //console.log("playbirdsound switch off");
    
    audioRef.current.onended = () => {
      setIsSongPlaying(false);
      songFinishedPlaying.current = true;
      birdHasBeenClicked.current = !birdHasBeenClicked.current;
      setTimeout(speakNext, 100); 
    };

    audioRef.current.onerror = (error) => {
      console.error("Error playing audio:", error);
      setIsSongPlaying(false);
    };
  }; // end of playBirdSound

  function handleDivClick () {
    if (ignoreClick.current) return; // ignore the click
    birdHasBeenClicked.current = !birdHasBeenClicked.current;
    setTriggerRecursion(!triggerRecursion);
  };

  function speakNext() {
    if (ignoreClick.current) return; // ignore the click
    if (indexRef.current >= birdies.length && !birdHasBeenClicked.current) {
      setCurrentBird(null);
      setStartSpeaking(false);
      introRequired.current = false;
      introText = null;
      setTriggerRecursion(!triggerRecursion);
      recognition.stop();
      return; // stop when all birds are spoken
    }

    if (birdHasBeenClicked.current) {
      return; 
    }

    ignoreClick.current = true; // ignore clicks while speaking
    recognition.stop(); // stop listening while speaking otherwise command is corrupted

    if (indexRef.current < birdies.length) {
      bird = birdies[indexRef.current];
    }
    setCurrentBird(bird);
    const speech = new SpeechSynthesisUtterance(bird.preview);

    window.speechSynthesis.speak(speech);

      speech.onend = () => {
        setTimeout(() => {
          ignoreClick.current = false;
          // if(!isListening.current){recognition.start();} // start listening
        }, 200);
        setTimeout(() => {
          speakNext();
        }, 2000);
        indexRef.current++; // move to next bird
        if(!isListening.current){
          recognition.start(); // start listening
          //console.log("speaknext switch on");
        };    
        //console.log("speaknext switch off");
      };

  } // end of speaknext

  function speakStart() {
    const intro = new SpeechSynthesisUtterance(introText);    
    const startIntro = new SpeechSynthesisUtterance(startText);   
   
    startIntro.onend = () => {
      introText = null;
      recognition.start(); // start listening
    };
    // console.log("speakstart message", introRequired.current);

    introRequired.current = false;
    window.speechSynthesis.speak(intro);
    window.speechSynthesis.speak(startIntro);

  } // end of speakStart


}

export default App;

// Removed GenericPlayer component and integrated audio logic into Ap