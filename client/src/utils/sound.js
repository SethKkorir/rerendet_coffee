// utils/sound.js
/**
 * Plays a pleasant notification sound using the Web Audio API.
 * This avoids the need for external assets and ensures immediate playback.
 */
export const playNotificationSound = (type = 'info') => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;

        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        // Determine frequency based on type
        let startFreq = 500;
        let endFreq = 1000;

        if (type === 'success') {
            startFreq = 600;
            endFreq = 1200;
            osc.type = 'sine';
        } else if (type === 'error') {
            startFreq = 300;
            endFreq = 150; // Descending pitch for error
            osc.type = 'triangle';
        } else if (type === 'warning') {
            startFreq = 400;
            endFreq = 400;
            osc.type = 'square';
        }

        // Play sound
        osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + 0.1);

        // Envelope
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

        osc.start();
        osc.stop(ctx.currentTime + 0.3);
    } catch (error) {
        console.error('Failed to play notification sound:', error);
    }
};
