export default class KnobStore {
  constructor() {
    this.store = {};
    this.callbacks = [];
  }

  has(key) {
    return this.store[key] !== undefined;
  }

  setAll(knobsByKey) {
    this.store = {
      ...this.store,
      ...knobsByKey,
    };
    this.callbacks.forEach(cb => cb());
  }

  set(key, value) {
    this.store[key] = value;
    this.store[key].used = true;
    this.callbacks.forEach(cb => cb(this.store[key]));
  }

  get(key) {
    const knob = this.store[key];
    if (knob) {
      knob.used = true;
    }
    return knob;
  }

  getAll() {
    return this.store;
  }

  reset() {
    this.store = {};
  }

  markAllUnused() {
    Object.keys(this.store).forEach(knobName => {
      this.store[knobName].used = false;
    });
  }

  subscribe(cb) {
    this.callbacks.push(cb);
  }

  unsubscribe(cb) {
    const index = this.callbacks.indexOf(cb);
    this.callbacks.splice(index, 1);
  }
}
