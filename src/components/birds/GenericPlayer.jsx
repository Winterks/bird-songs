import { useRef, useState } from "react";

import PropTypes from "prop-types";

function GenericPlayer({ audioUrl, imageSrc, defaultState = false }) {
  const audioRef = useRef(new Audio(audioUrl));
  const [isPlaying, setIsPlaying] = useState(defaultState);

  const handleClick = () => {
  
    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0; // Reset audio to start
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };
  
  audioRef.current.addEventListener("ended", () => {
    setIsPlaying(true);
    // simulate bird clicked so it continues onto next bird
    // document.getElementByid("bird-button").click();
    clickBird();

  });

  audioRef.current.addEventListener('error', function(error) {
    console.error('An error occurred:', error);
  });

  return (
    <img
      src={imageSrc}
      className={`bird react vite ${isPlaying ? "playing" : ""}`}
      alt="audio bird"
      onClick={handleClick}
    />
  );
}
GenericPlayer.propTypes = {
  audioUrl: PropTypes.string,
  imageSrc: PropTypes.string.isRequired,
  defaultState: PropTypes.bool,
};

export default GenericPlayer;
