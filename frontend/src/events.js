//events.js

function subscribe(eventName: any, listener: any): any {
  document.addEventListener(eventName, listener);
}

function unsubscribe(eventName: any, listener: any): any {
  document.removeEventListener(eventName, listener);
}

function publish(eventName: any, data: any): any {
  const event = new CustomEvent(eventName, { detail: data });
  document.dispatchEvent(event);
}

export { publish, subscribe, unsubscribe };
