import { useRef, useState } from "react";

import PropTypes from "prop-types";

function GenericPlayer({ audioUrl, imageSrc, defaultState = false }) {
//  const audioRef = useRef(new Audio(audioUrl));
  const [isPlaying, setIsPlaying] = useState(defaultState);
 /*  var base_url = window.location.origin + window.location.pathname;
  var imageUrl = "";
debugger
  if(imageSrc.includes("://")) { // assume full Url as protocol specified
    imageUrl = new URL(imageSrc);
  } else {
    imageUrl = new URL(imageSrc,base_url); // base url required
  }; */
  const handleClick = () => {
    if (isPlaying) {
      audioUrl.current.pause();
      audioUrl.current.currentTime = 0; // Reset audio to start
    } else {
      audioUrl.current.play();
    }
    setIsPlaying(!isPlaying);
  };

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
