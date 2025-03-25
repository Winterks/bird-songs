import { useRef, useState } from "react";

import PropTypes from "prop-types";

function GenericPlayer({ audioUrl, imageSrc, defaultState = false }) {
  const audioRef = useRef(new Audio(audioUrl));
  // var audioRef = audioUrl;
  const [isPlaying, setIsPlaying] = useState(defaultState);
 /*  var base_url = window.location.origin + window.location.pathname;
  var imageUrl = "";

  if(imageSrc.includes("://")) { // assume full Url as protocol specified
    imageUrl = new URL(imageSrc);
  } else {
    imageUrl = new URL(imageSrc,base_url); // base url required
  }; */
  const handleClick = () => {
  
    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0; // Reset audio to start
    } else {
      audioRef.current.play();
      audioRef.current.onended = () => {
        audioRef.current.pause();
        audioRef.current.currentTime = 0; // Reset audio to start
        debugger
      }
    }
    setIsPlaying(!isPlaying);
  };

 /*  audioRef.current.addEventListener('ended', function() {
    console.log('Audio finished playing '+ audioUrl);
    // Perform actions when the audio ends
    setIsPlaying(!isPlaying);
    debugger
  }); */
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
