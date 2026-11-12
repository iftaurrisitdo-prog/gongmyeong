(() => {
  const player = document.querySelector('.exhibition-film');
  const video = player.querySelector('video');
  const controls = player.querySelector('.exhibition-controls');
  const play = controls.querySelector('.film-play');
  const seek = controls.querySelector('.film-seek');
  const volume = controls.querySelector('.film-volume');
  const fullscreen = controls.querySelector('.film-fullscreen');
  const time = controls.querySelector('.film-time');
  const status = player.querySelector('.film-status');
  const source = video.querySelector('source').src;
  let requestedTime = null;
  let adjusting = false;
  let loading = false;

  function formatTime(seconds) {
    const whole = Math.floor(seconds || 0);
    return Math.floor(whole / 60) + ':' + String(whole % 60).padStart(2, '0');
  }

  function syncTime() {
    if (!Number.isFinite(video.duration)) return;
    seek.max = video.duration;
    seek.disabled = false;
    if (!adjusting && requestedTime === null) seek.value = video.currentTime;
    time.textContent = formatTime(Number(seek.value)) + ' / ' + formatTime(video.duration);
    seek.setAttribute('aria-valuetext', formatTime(Number(seek.value)));
  }

  function isBuffered(position) {
    for (let i = 0; i < video.buffered.length; i++) {
      if (position >= video.buffered.start(i) && position <= video.buffered.end(i)) return true;
    }
    return false;
  }

  async function seekTo(position) {
    requestedTime = position;
    if (loading) return;
    if (video.currentSrc.startsWith('blob:') || isBuffered(position)) {
      video.currentTime = position;
      requestedTime = null;
      syncTime();
      return;
    }

    // The hosted static response can ignore byte-range requests. Use one
    // complete local media source for random access to unbuffered positions.
    loading = true;
    status.textContent = '선택한 재생 위치를 준비하는 중…';
    try {
      const response = await fetch(source);
      if (!response.ok) throw new Error('Video download failed');
      const blob = await response.blob();
      if (!blob.size) throw new Error('Empty video download');
      const resume = !video.paused;
      const previousTime = video.currentTime;
      const localSource = URL.createObjectURL(blob);

      const switchEvents = new AbortController();
      video.addEventListener('loadedmetadata', () => {
        switchEvents.abort();
        video.currentTime = Math.min(requestedTime, video.duration);
        requestedTime = null;
        loading = false;
        status.textContent = '';
        syncTime();
        if (resume) video.play().catch(() => {});
      }, {once: true, signal: switchEvents.signal});
      video.addEventListener('error', () => {
        switchEvents.abort();
        URL.revokeObjectURL(localSource);
        requestedTime = null;
        loading = false;
        status.textContent = '이 위치로 이동하지 못했어요. 잠시 후 다시 시도해 주세요.';
        video.addEventListener('loadedmetadata', () => {
          video.currentTime = Math.min(previousTime, video.duration);
          if (resume) video.play().catch(() => {});
        }, {once: true});
        video.src = source;
      }, {once: true, signal: switchEvents.signal});
      video.src = localSource;
    } catch {
      requestedTime = null;
      loading = false;
      status.textContent = '이 위치로 이동하지 못했어요. 잠시 후 다시 시도해 주세요.';
      syncTime();
    }
  }

  play.addEventListener('click', () => {
    if (video.paused) {
      video.play().catch(() => {
        status.textContent = '영상을 재생하지 못했어요. 다시 시도해 주세요.';
      });
    } else {
      video.pause();
    }
  });
  video.addEventListener('click', () => play.click());
  ['play', 'pause', 'ended'].forEach(event => {
    video.addEventListener(event, () => {
      play.textContent = video.paused ? '재생' : '일시정지';
    });
  });
  ['loadedmetadata', 'durationchange', 'timeupdate', 'seeked'].forEach(event => {
    video.addEventListener(event, syncTime);
  });
  seek.addEventListener('input', () => {
    adjusting = true;
    syncTime();
  });
  seek.addEventListener('change', () => {
    adjusting = false;
    seekTo(Number(seek.value));
  });
  volume.addEventListener('input', () => {
    video.volume = Number(volume.value);
    video.muted = video.volume === 0;
  });

  function syncFullscreenButton() {
    const expanded = document.fullscreenElement === player || player.classList.contains('film-expanded');
    fullscreen.textContent = expanded ? '전체화면 닫기' : '전체화면';
    fullscreen.setAttribute('aria-pressed', String(expanded));
  }

  fullscreen.addEventListener('click', async () => {
    if (player.classList.contains('film-expanded')) {
      player.classList.remove('film-expanded');
      syncFullscreenButton();
      return;
    }
    if (document.fullscreenElement === player) {
      await document.exitFullscreen();
      return;
    }

    try {
      if (player.requestFullscreen && document.fullscreenEnabled) {
        await player.requestFullscreen();
        return;
      }
      if (video.webkitEnterFullscreen && video.webkitSupportsFullscreen) {
        video.webkitEnterFullscreen();
        return;
      }
    } catch {
      // Embedded browsers may deny fullscreen. Expand inside the viewport.
    }
    player.classList.add('film-expanded');
    syncFullscreenButton();
  });
  document.addEventListener('fullscreenchange', syncFullscreenButton);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && player.classList.contains('film-expanded')) {
      player.classList.remove('film-expanded');
      syncFullscreenButton();
      fullscreen.focus();
    }
  });
  syncFullscreenButton();

  video.controls = false;
  controls.hidden = false;
  syncTime();
})();
