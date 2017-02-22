    import dispatcher from "../dispatcher";

export function createCategory(text) {
  dispatcher.dispatch({
    type: "CREATE_CATEGORY",
    text,
  });
}

export function deleteCategory(id) {
  dispatcher.dispatch({
    type: "DELETE_CATEGORY",
    id,
  });
}

export function reloadCategories() {
  var data_received = {};
  axios("api/categories").then((data) => {
     console.log("got the data!", data);
     data_received = data;
  })
  dispatcher.dispatch({type: "FETCH_CATEGORIES"});
  setTimeout(() => {
    dispatcher.dispatch({type: "RECEIVE_CATEGORIES", categories: data_received});
  }, 1000);
}