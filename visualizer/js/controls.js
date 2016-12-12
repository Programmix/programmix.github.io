
class Controls {

  constructor(audio) {
    this.audio = audio;
    this.container = document.getElementById('controls-container');
    this.toggle = document.getElementById('toggle-controls');
    this.form = document.getElementById('song-input');
    this.input = document.getElementById('song-url');
    this.errorMessage = document.getElementById('input-error');
    this.songDisplay = document.getElementById('controls-display');

    this.display = {
      title: document.getElementById('song-title'),
      artist: document.getElementById('song-artist'),
      duration: document.getElementById('song-duration'),
      artwork: document.getElementById('song-artwork')
    }

    this.minimized = false;

    this.toggle.addEventListener('click', this.toggleMinimized.bind(this));
    this.form.addEventListener('submit', this.onSubmit.bind(this));
    this.audio.addEventListener('ended', this.ended.bind(this));

    this.audio.crossOrigin = 'anonymous';

    setInterval(this.updateDuration.bind(this), 500);
  }

  play() {
    const track = this.fetchTrack();
    if (!track || (this.track && track.id === this.track.id)) return false;
    this.track = track;

    this.audio.src = track.stream_url;

    const { title, artist, artwork } = this.display;

    title.innerHTML = track.title;
    artist.innerHTML = track.user.username;
    artwork.src = track.artwork_url || track.user.avatar_url;

    this.songDisplay.classList.remove('hidden');
    return true;
  }

  ended() {
    const success = this.play();
    if (success) return;

    this.setMinimized(false);
    this.songDisplay.classList.add('hidden');
  }

  updateDuration() {
    if (!this.track) return;

    const elapsed = this.audio.currentTime;
    const duration = (this.track.duration * 0.001)

    this.display.duration.innerHTML =
      this.formatTime(elapsed) + ' / ' + this.formatTime(duration);
  }

  formatTime(secs) {
    let minutes = Math.floor(secs / 60);
    let seconds = Math.floor(secs % 60);

    if (seconds < 10) seconds = '0' + seconds;

    return `${minutes}:${seconds}`;
  }

  setMinimized(minimized) {
    const method = minimized ? 'add' : 'remove';

    this.minimized = minimized;

    this.container.classList[method]('minimized');
    this.toggle.classList[method]('minimized');
  }

  toggleMinimized(minimized) {
    this.setMinimized(!this.minimized);
  }

  onSubmit(e) {
    e.preventDefault();

    this.errorMessage.classList.add('hidden');

    const url = this.input.value;
    SC.get('/resolve', { url })
    .then((result) => {
      if (result.kind === 'playlist') {
        let index = 0;

        this.fetchTrack = () => {
          const track = result.tracks[index++];
          if (!track) return null;
          track.stream_url += '?client_id=' + CLIENT_ID;

          return track;
        };
      }
      else if (result.kind === 'track') {
        this.fetchTrack = () => {
          const track = result;
          track.stream_url += '?client_id=' + CLIENT_ID;

          return result;
        };
      }

      this.setMinimized(true);
      this.play();
    })
    .catch((errors) => {
      console.log(errors);
      this.errorMessage.classList.remove('hidden');
    });
  }

}
