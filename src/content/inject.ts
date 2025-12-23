(function () {
  // ---- State ----
  let activeMock = {
    enabled: false,
    method: "GET",
    urlPart: "",
    response: null, // object | string | null
    status: 200,
    headers: { "Content-Type": "application/json" },
  };

  // ---- Helpers ----
  function safeJsonParse(str: string) {
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  }

  function normalizeMethod(m: string) {
    return (m || "GET").toUpperCase();
  }

  function setActiveMock(payload: any) {
    // payload: { method, urlPart, response, enabled?, status? }
    const method = normalizeMethod(payload?.method);
    const urlPart = String(payload?.urlPart ?? "");
    const enabled = Boolean(payload?.enabled ?? true);

    // allow response to be either a stringified JSON or an object
    let response = payload?.jsonResponse ?? null;
    if (typeof response === "string") {
      // accept either raw string or JSON string
      const parsed = safeJsonParse(response);
      response = parsed ?? response;
    }

    activeMock = {
      ...activeMock,
      enabled,
      method,
      urlPart,
      response,
      status: Number(payload?.status ?? activeMock.status),
      headers: payload?.headers ?? activeMock.headers,
    };

    console.log("[mock] activeMock updated:", activeMock);
  }

  function clearMock() {
    activeMock = {
      ...activeMock,
      enabled: false,
      urlPart: "",
      response: null,
    };
    console.log("[mock] cleared");
  }

  function matchesMock(url: string, method: any) {
    //if (!activeMock.enabled) return false;
    //if (!activeMock.response) return false;
    //if (!activeMock.urlPart) return false;

    return (
      url.includes(activeMock.urlPart) &&
      normalizeMethod(method) === normalizeMethod(activeMock.method)
    );
  }

  // ---- Message listener (from content script bridge) ----
  window.addEventListener("message", (event) => {
    if (event.source !== window) return;

    const data = event.data;
    // Expecting: { __fromExtension: true, type: "SET_MOCK", payload: {...} }
    if (!data || data.__fromExtension !== true) return;

    if (data.type === "SET_MOCK") {
      setActiveMock(data.payload);
      return;
    }

    if (data.type === "CLEAR_MOCK") {
      clearMock();
      return;
    }
  });

  // ---- Fetch interception ----
  const originalFetch = window.fetch.bind(window);

  window.fetch = async function (...args) {
    const resource = args[0] as any;
    const init = args[1] || {};

    // Determine URL + method in a way that works for Request objects
    const url = typeof resource === "string" ? resource : resource.url;
    const method =
      (init && init.method) ||
      (typeof resource !== "string" ? resource.method : "GET") ||
      "GET";

    if (matchesMock(url, method)) {
      console.log(`[mock] Mocking ${normalizeMethod(method)} ${url}`);

      const body =
        typeof activeMock.response === "string"
          ? activeMock.response
          : JSON.stringify(activeMock.response);

      return new Response(body, {
        status: activeMock.status,
        headers: activeMock.headers,
      });
    }

    return originalFetch(...args);
  };
})();