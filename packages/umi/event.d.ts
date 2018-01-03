export declare class EventBus {
  private eventHandlers;
  /**
   * addEventListener
   * @param eventType string
   * @param callback event callback
   */
  addEventListener<T>(eventType: string, callback: (event: T) => void): void;
  /**
   * removeEventListener
   * @param eventType string
   * @param callback event callback
   */
  removeEventListener<T>(eventType: string, callback: (event: T) => void): void;
  removeAllEventListeners(eventType: any): void;
  emit<T>(eventType: any, data: T): void;
}

declare const defaultInstance: EventBus;
export default defaultInstance;

export const Events: {
  PAGE_INITIALIZED: string,
};

export namespace EventTypes {
  interface PAGE_INITIALIZED_TYPE { key: string }
}
