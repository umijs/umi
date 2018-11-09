import { register } from 'register-service-worker';

// polyfill the CustomEvent in ie9/10/11
// https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent#Polyfill
(function() {
  if (typeof window.CustomEvent === 'function') return false;

  function CustomEvent(event, params) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(
      event,
      params.bubbles,
      params.cancelable,
      params.detail,
    );
    return evt;
  }

  CustomEvent.prototype = window.Event.prototype;
  window.CustomEvent = CustomEvent;
})();

function dispatchServiceWorkerEvent(eventName, eventData) {
  const event = new CustomEvent(eventName, { detail: eventData });
  window.dispatchEvent(event);
}

export default function(swDest) {
  register(`${process.env.BASE_URL}${swDest}`, {
    updated(registration) {
      dispatchServiceWorkerEvent('sw.updated', registration);
    },

    offline() {
      dispatchServiceWorkerEvent('sw.offline', {});
    },
  });
}
