import { useEffect, useRef, useState } from "react";
import "./App.css";
import parseCSV from "./components/birds/parseCSV";
import rotaryLogo from "./assets/my-rotary-logo.png";

var introText =
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
            onClick={() => {
              if (introRequired.current) {
                speakStart();
                introRequired.current = false;
              } else {
                // Cancel the intro if its playing
                window.speechSynthesis.cancel();
                setStartSpeaking(!startSpeaking);
                indexRef.current = 0; // reset the index
              }
            }}
          >
            <span>
              British bird songs
              <br />
              {introText}
              <br /> Click to start
              {introRequired.current ? speakStart() : null}
            </span>
          </button>
          <div className="credits">
           <a href="/bird-songs/credits.html" style={{ textDecoration: 'none', color: 'inherit' }}>
             Credits
           </a>
          </div>
        </>
      )}
      {startSpeaking &&
        birdies.map((bird, index) => (
          <div
            key={index}
            onClick={handleDivClick} // Use this to stop automatic scrolling
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
                alt="audio bird"
                onClick={playBirdSound}
              />
            ) : null}
          </div>
        ))}
    </div>
  );

  function playBirdSound () {
    if (ignoreClick.current) return; // ignore the click

      if (isSongPlaying) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } else {
        audioRef.current = new Audio(currentBird.audioUrl);
        songFinishedPlaying.current = false;
        audioRef.current.play();
      }
      setIsSongPlaying(!isSongPlaying);
    
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
      return; // stop when all birds are spoken
    }

    if (birdHasBeenClicked.current) {
      return; 
    }

    if (indexRef.current < birdies.length) {
      bird = birdies[indexRef.current];
    }
    setCurrentBird(bird);
    const speech = new SpeechSynthesisUtterance(bird.preview);
    ignoreClick.current = true; // ignore clicks while speaking
    window.speechSynthesis.speak(speech);

      speech.onend = () => {
        setTimeout(() => {ignoreClick.current = false;}, 200);
        setTimeout(() => {
          speakNext();
        }, 2000);
        indexRef.current++; // move to next bird
      };

  } // end of speaknext

  function speakStart() {
    const intro = new SpeechSynthesisUtterance(introText);

    intro.onend = () => {
      //console.log("start message");
    };

    window.speechSynthesis.speak(intro);
  } // end of speakStart


}

export default App;

// Removed GenericPlayer component and integrated audio logic into App