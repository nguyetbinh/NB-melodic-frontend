import {useState, useRef, useEffect} from 'react';


function debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
}
const useAudioPlayer = (queueSong) => {
    const [queue, setQueue] = useState(queueSong);
    const [isPause, setIsPause] = useState(true);
    const [seekValue, setSeekValue] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [currentVolume, setCurrentVolume] = useState(100);
    const audioRef = useRef(null);

    const [currentSongIndex, setCurrentSongIndex] = useState(0);

   
    const togglePlayPause = () => {
        if (isPause) {
            audioRef.current.play().catch((error) => {
                console.log('Playback error:', error);
            }); // Play the audio
        } else {
            audioRef.current.pause(); // Pause the audio
        }
        setIsPause(!isPause);
    };
      const handleNext = () => {
        const nextSongIndex = (currentSongIndex + 1) % queueSong.length; // Loop back to the first song if at the end
        console.log("seekvalue", seekValue);
        console.log(currentSongIndex);
        setCurrentSongIndex(nextSongIndex);
        
        const nextSong = queueSong[nextSongIndex];
        audioRef.current.src = nextSong.file;
    
        // Add an event listener for loadedmetadata to ensure the duration is loaded
        audioRef.current.addEventListener('loadedmetadata', () => {
            //audioRef.current.play();
            setIsPause(true); // Ensure the play/pause state is updated
            setCurrentTime(0); // Reset the current time
            setSeekValue(0); // Reset the seek value
        }, { once: true }); // Use { once: true } to ensure the event listener is removed after it fires
    };
    const handlePrevious = () => {
        const previousSongIndex = (currentSongIndex - 1 + queueSong.length) % queueSong.length; // Loop back to the last song if at the beginning
        setCurrentSongIndex(previousSongIndex);
        const previousSong = queueSong[previousSongIndex];
        audioRef.current.src = previousSong.file;
        console.log("seekvalue in Audio Player", seekValue);

         // Add an event listener for loadedmetadata to ensure the duration is loaded
        audioRef.current.addEventListener('loadedmetadata', () => {
            //audioRef.current.play();
            setIsPause(true); // Ensure the play/pause state is updated
            setCurrentTime(0); // Reset the current time
            setSeekValue(0); // Reset the seek value
        }, { once: true }); // Use { once: true } to ensure the event listener is removed after it fires
    };

    const handleSeekChange = (event) => {
        const newValue = event.target.value;
        setSeekValue(newValue);
        requestAnimationFrame(() => {
          audioRef.current.currentTime = (newValue / 100) * audioRef.current.duration;
        });
    };

    const handleTimeUpdate = () => {
        const currentTimeTrack = audioRef.current.currentTime;
        const duration = audioRef.current.duration;
        setSeekValue((currentTimeTrack / duration) * 100);
        setCurrentTime(currentTimeTrack);
    };
    const handleVolumeChange = (event) => {
        const newValue = event.target.value;
        setCurrentVolume(newValue);
        audioRef.current.volume = newValue / 100;
    }
    const handleReplay = () => {
        console.log(currentTime);
        if(currentTime >= queueSong[currentSongIndex].duration){
            audioRef.current.currentTime = 0;
            setIsPause(true);
        audioRef.current.pause();
        } else{
            audioRef.current.currentTime = currentTime;
        }

        
    }
    useEffect(() => {
        const audio = audioRef.current;
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', () => {
            console.log('Audio duration:', audio.duration);
        });
    
        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
        };
    }, []);
    
    const formatDuration = (duration) => {
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };
    const debouncedHandleSeekChange = debounce(handleSeekChange, 100);



    return {
        isPause,
        seekValue,
        currentTime,
        currentVolume,
        audioRef,
        togglePlayPause,
        handleSeekChange,
        handleVolumeChange,
        formatDuration,
        handleReplay,
        handleNext,
        handlePrevious,
        currentSongIndex,
        queueSong,
    };

}

export default useAudioPlayer;