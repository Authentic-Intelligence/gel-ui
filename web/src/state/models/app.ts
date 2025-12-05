import {createContext, Model, model, prop} from "mobx-keystone";

import {InstanceState} from "@edgedb/studio/state/instance";

// Injected at build time by Vite
declare const __GEL_UI_BASE_PATH__: string;
declare const __GEL_UI_PROXY_PATH__: string;
const basePath = __GEL_UI_BASE_PATH__;
const proxyPath = __GEL_UI_PROXY_PATH__;

// Server URL configuration:
// 1. If VITE_GEL_SERVER_URL is set, use it (for direct connection)
// 2. If running embedded (proxyPath is set), use the proxy endpoint
// 3. In dev mode, default to localhost:5656
// 4. Otherwise, use the origin (for bundled with Gel server)
export const serverUrl = import.meta.env.VITE_GEL_SERVER_URL
  ? import.meta.env.VITE_GEL_SERVER_URL.startsWith("http")
    ? import.meta.env.VITE_GEL_SERVER_URL
    : `http://${import.meta.env.VITE_GEL_SERVER_URL}`
  : proxyPath
    ? `${window.location.origin}${proxyPath}`
    : import.meta.env.DEV
      ? "http://localhost:5656"
      : window.location.origin;

const url = new URL(window.location.toString());

const TOKEN_KEY = "edgedbAuthToken";
const USERNAME_KEY = "edgedbAuthUsername";

let authToken: string | null = null;
let authUsername: string | null = null;

if (url.searchParams.has("authToken")) {
  authToken = url.searchParams.get("authToken")!;
  authUsername = url.searchParams.get("authUsername") || "admin";
  localStorage.setItem(TOKEN_KEY, authToken);
  localStorage.setItem(USERNAME_KEY, authUsername);

  url.searchParams.delete("authToken");
  url.searchParams.delete("authUsername");
  window.history.replaceState(window.history.state, "", url);
} else {
  authToken = localStorage.getItem(TOKEN_KEY);
  authUsername = localStorage.getItem(USERNAME_KEY);
}

if (!authToken) {
  url.pathname = `${basePath}_login`;
  window.history.replaceState(null, "", url);
}

export function setAuthToken(username: string, token: string) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USERNAME_KEY, username);
  window.location.replace(basePath);
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
  const loginPath = `${basePath}_login`;
  if (window.location.pathname !== loginPath) {
    window.location.assign(loginPath);
  }
}

export const appCtx = createContext<App>();

@model("App")
export class App extends Model({
  instanceState: prop(
    () =>
      new InstanceState({
        serverUrl,
      })
  ),
}) {
  onInit() {
    this.instanceState._authProvider = {
      getAuthToken: () => authToken!,
      getAuthUser: () => authUsername!,
      invalidateToken: () => clearAuthToken(),
    };

    if (authToken) {
      this.instanceState.fetchInstanceInfo();
    }
    appCtx.set(this, this);
  }
}
