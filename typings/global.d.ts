import { TPreloadAPI } from "./preload";

declare global {
  interface Window {
    app: TPreloadAPI;
  }
}
