import { useEffect, useRef, useState } from "react";
// import PropTypes from "prop-types";
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
//var bird = [];

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
          <div
            style={{
              position: "fixed",
              top: "0px",
              left: "0px",
              padding: "10px",
              zIndex: 1000,
            }}
          >
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
                //onClick={handleBirdClick} // Use this to play/stop sound and potentially advance
                onClick={playBirdSound}
              />
            ) : null}
          </div>
        ))}
    </div>
  );

  const handleBirdClick = () => {
    birdHasBeenClicked.current = true;
    bird = birdies[indexRef.current];
    setCurrentBird(bird);
    playBirdSound();
   /* if (isSongPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsSongPlaying(false);
      // indexRef.current = (indexRef.current + 1) % birdies.length; // Jump to next bird
      //indexRef.current = indexRef.current + 1; // Jump to next bird
      //bird = birdies[indexRef.current];
      //setCurrentBird(bird);
      birdHasBeenClicked.current = true;
    } else if (currentBird) {
      playBirdSound(currentBird);
    }*/
  };

  function playBirdSound () {
    debugger
    //console.log("birdsound ",currentBird.audioUrl,isSongPlaying);
    //audioRef.current = new Audio(currentBird.audioUrl);
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
      //indexRef.current = indexRef.current + 1;
      birdHasBeenClicked.current = !birdHasBeenClicked.current;
      setTimeout(speakNext, 100); 
    };

    audioRef.current.onerror = (error) => {
      console.error("Error playing audio:", error);
      setIsSongPlaying(false);
    };
  }; // end of playBirdSound

  function handleDivClick () {
    // Prevent the automatic scrolling from continuing if a bird is clicked
    // for manual interaction
    birdHasBeenClicked.current = !birdHasBeenClicked.current;
    setTriggerRecursion(!triggerRecursion);
    //console.log("handlediv ",currentBird.audioUrl,isSongPlaying);
  };

  function speakNext() {
    if (indexRef.current >= birdies.length && !birdHasBeenClicked.current) {
      setCurrentBird(null);
      setStartSpeaking(false);
      introRequired.current = false;
      introText = null;
      return; // stop when all birds are spoken
    }

    // if (birdHasBeenClicked.current && !isSongPlaying && !songFinishedPlaying.current) {

    if (birdHasBeenClicked.current) {
      return; // Wait for manual interaction
    }

    if (birdHasBeenClicked.current && songFinishedPlaying.current) {
      birdHasBeenClicked.current = false; // Reset flag after song finishes
      indexRef.current++;
      //console.log("speaknext",indexRef.current);
      songFinishedPlaying.current = false;
      setTimeout(speakNext, 100); // Small delay to allow state update
      return;
    }

    // if (indexRef.current < birdies.length) {
      bird = birdies[indexRef.current];
      setCurrentBird(bird);
      const speech = new SpeechSynthesisUtterance(bird.preview);

      speech.onend = () => {
        //console.log("onend ",indexRef.current);
        setTimeout(() => {
          speakNext();
        }, 2500);
        indexRef.current++; // move to next bird
      };

      window.speechSynthesis.speak(speech);
    // }

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