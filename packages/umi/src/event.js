export class EventBus {
  eventHandlers = {};

  addEventListener(type, callback) {
    if (!this.eventHandlers[type]) {
      this.eventHandlers[type] = [];
    }
    this.eventHandlers[type].push(callback);
  }

  removeEventListener(type, callback) {
    const element = this.eventHandlers[type];
    if (element) {
      const index = element.indexOf(callback);
      if (index !== -1) {
        element.splice(index, 1);
      }
    }
  }

  removeAllEventListeners(type) {
    this.eventHandlers[type] = [];
  }

  emit(type, data) {
    if (this.eventHandlers[type]) {
      this.eventHandlers[type].forEach(handler => {
        handler(data);
      });
    }
  }
}

export default new EventBus();

const Events = {
  PAGE_INITIALIZED: 'pageInitialized',
};

export { Events };
