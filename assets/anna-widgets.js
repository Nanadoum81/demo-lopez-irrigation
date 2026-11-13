/*
 * Anna widgets (Lopez demo) - mark the VOICE widget host for stacking.
 *
 * HighLevel renders each chat widget as a <chat-widget> web component.
 * The launcher lives inside the component's shadow DOM, and the widget
 * id is a JavaScript property (widgetId) on the host element - not an
 * HTML attribute - so plain CSS selectors cannot tell the two widgets
 * apart, and the two hosts append in a load-order race, so DOM order
 * (nth-of-type / last-of-type) is not reliable either.
 *
 * This script finds the host whose widgetId property is the Anna VOICE
 * widget (6af65b5190f7860d2918cb6a) and marks it with data-voice-widget.
 * assets/anna-widgets.css then lifts only that host above the chat
 * bubble. Nothing else is changed: no widget content, colors, prompt,
 * voice or knowledge base is touched.
 */
(function () {
  var VOICE_WIDGET_ID = '6af65b5190f7860d2918cb6a';

  function isVoiceHost(host) {
    if (!host) return false;
    if (host.widgetId === VOICE_WIDGET_ID) return true;
    // Fallbacks, in case the id is also exposed as an attribute.
    if (host.getAttribute) {
      if (host.getAttribute('widget-id') === VOICE_WIDGET_ID) return true;
      if (host.getAttribute('data-widget-id') === VOICE_WIDGET_ID) return true;
    }
    return false;
  }

  function markVoiceHost() {
    var hosts = document.querySelectorAll('chat-widget');
    for (var i = 0; i < hosts.length; i++) {
      if (isVoiceHost(hosts[i])) {
        if (!hosts[i].hasAttribute('data-voice-widget')) {
          hosts[i].setAttribute('data-voice-widget', '');
        }
        return true;
      }
    }
    return false;
  }

  // 1) Scan now - the hosts may already be on the page.
  if (markVoiceHost()) return;

  // 2) Watch for hosts as they are added (they load asynchronously).
  var observer = null;
  if ('MutationObserver' in window) {
    observer = new MutationObserver(function () {
      if (markVoiceHost() && observer) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  // 3) Rescan briefly, in case a host appears without a mutation we see.
  var attempts = 0;
  var timer = setInterval(function () {
    attempts += 1;
    if (markVoiceHost() || attempts >= 40) {
      clearInterval(timer);
      if (observer) observer.disconnect();
    }
  }, 500); // up to ~20 seconds
})();
