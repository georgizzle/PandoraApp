import { EventEmitter } from "events";

import dispatcher from "../dispatcher";

class TodoStore extends EventEmitter {
  constructor() {
    super()
    this.categories = [];
  }

  createCategory(name, desc, img) {

    this.categories.push({
      name,
      desc,
      img,
    });

    this.emit("change");
  }

  getAll() {
    return this.categories;
  }

  handleActions(action) {
    switch(action.type) {
      case "CREATE_CATEGORY": {
        this.createCategory(action.text);
        break;
      }
      case "RECEIVE_CATEGORIES": {
        this.categories = action.categories;
        this.emit("change");
        break;
      }
    }
  }

}

const todoStore = new TodoStore;
dispatcher.register(todoStore.handleActions.bind(todoStore));

export default todoStore;