import { createApp } from 'vue'
import App from './views/App.vue'

console.log('[CRXJS] Hello world from content script!')

/* Http Interceptor script */

const script = document.createElement('script');
script.src = chrome.runtime.getURL('assets/interceptor.js');
script.onload = function() {
  (this as any).remove();
};
(document.head || document.documentElement).appendChild(script);


/* Listenners */

console.log('[content] loaded on', location.href);

// Tell extension which tab this content script is running in
chrome.runtime.sendMessage({ type: 'CONTENT_READY', href: location.href });

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type === "SET_MOCK") {
    // Forward to injected script
    console.log('Content will post message')
    window.postMessage(
      {
        __fromExtension: true,
        type: "SET_MOCK",
        payload: msg.payload, // { method, urlPart, jsonResponse }
      },
      "*"
    );

    sendResponse({ ok: true });
    return;
  }
});

/**
 * Mount the Vue app to the DOM.
 */
function mountApp() {
  const container = document.createElement('div')
  container.id = 'crxjs-app'
  document.body.appendChild(container)
  const app = createApp(App)
  app.mount(container)
}

mountApp()
