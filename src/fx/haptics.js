// Safe device haptics with capability checks
export const haptics = {
  // Light tap (e.g. star tap, card flip, button press)
  light() {
    if ('vibrate' in navigator) {
      try { navigator.vibrate(12); } catch (_) {}
    }
  },

  // Medium pulse (e.g. right quiz answer, scratch reveal)
  medium() {
    if ('vibrate' in navigator) {
      try { navigator.vibrate([25, 30, 25]); } catch (_) {}
    }
  },

  // Heartbeat pulse (e.g. Yes button, candle blow)
  heartbeat() {
    if ('vibrate' in navigator) {
      try { navigator.vibrate([40, 60, 40]); } catch (_) {}
    }
  },

  // Celebration burst (e.g. gift open, final candle firework)
  celebrate() {
    if ('vibrate' in navigator) {
      try { navigator.vibrate([30, 40, 50, 40, 80]); } catch (_) {}
    }
  },

  // Wrong answer subtle buzz
  buzz() {
    if ('vibrate' in navigator) {
      try { navigator.vibrate([50, 40, 50]); } catch (_) {}
    }
  }
};

