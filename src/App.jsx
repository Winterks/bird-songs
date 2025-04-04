import { useEffect, useRef, useState } from "react";
import GenericPlayer from "./components/birds/GenericPlayer";
import "./App.css";
import parseCSV from "./components/birds/parseCSV";

var introText = 'The application will scroll through images of each bird in turn.' + 
                  ' Click on the bird you want to hear and its song will be played.' +
                  " If the bird is clicked a second time while playing, it will stop" +
                  " the audio and scroll to the next bird.";
var birdies = [];
parseCSV("data.csv", birdies);

function App() {
  const indexRef = useRef(0);
  const birdHasBeenClicked = useRef(false);
  const introRequired = useRef(true);
  const [currentBird, setCurrentBird] = useState(null);
  const [startSpeaking, setStartSpeaking] = useState(false);
  const [triggerRecursion, setTriggerRecursion] = useState(false); 

  useEffect(() => {
    if (!birdies.length) {
      return;
    }

    if (startSpeaking) speakNext();
  }, [birdies, startSpeaking, triggerRecursion]);

  return (  
    <div className="bird-list">
      {startSpeaking ? null : (
        <button className="start-button" 
          onClick={() => {
            setStartSpeaking(!startSpeaking);
            indexRef.current = 0; // reset the index
          }}>
        <span>
          British bird songs<br />
          {introText}
          <br /> Click to start
          {introRequired.current ? speakStart() : null }
        </span>
        </button>
      )}
      {startSpeaking && birdies.map((bird, index) => (
          <div
            key={index}
            onClick={() => {
              birdHasBeenClicked.current = !birdHasBeenClicked.current;
              setTriggerRecursion(!triggerRecursion);
            }}
          >
            <h1>
              {currentBird && currentBird?.preview === bird.preview
                ? currentBird?.preview
                : null}
            </h1>
            {currentBird && currentBird?.preview === bird.preview ? (
              <GenericPlayer
                audioUrl={bird.audioUrl}
                imageSrc={bird.imageSrc}
              />
            ) : null}
          </div>
        ))}
    </div>
  );

  function speakStart() {
    const intro = new SpeechSynthesisUtterance(introText);
    window.speechSynthesis.speak(intro);
    
    intro.onend = () => {
      console.log("start message");
    };
  }

  function speakNext() {
    if (indexRef.current >= birdies.length && !birdHasBeenClicked.current) {
      setCurrentBird(null);
      setStartSpeaking(!startSpeaking);
      introRequired.current = false;
      introText = null;
      return;
    }

    if (birdHasBeenClicked.current) {
      return;
    }

    const bird = birdies[indexRef.current];

    setCurrentBird(bird);

    const speech = new SpeechSynthesisUtterance(bird.preview);

    speech.onend = () => {
      indexRef.current++;
      setTimeout(() => {
        speakNext();
      }, 2500);
    };

    window.speechSynthesis.speak(speech);
  } // end of speaknext

}

export default App;