import React from "react";

import Category from "../components/Category";
import * as CategoryActions from "../actions/CategoryActions";
import CategoryStore from "../stores/CategoryStore";


export default class Categories extends React.Component {
  constructor() {
    super();
    this.getCategories = this.getCategories.bind(this);
    this.state = {
      categories: CategoryStore.getAll(),
    };
  }

  getCategories() {
    this.setState({
      categories: CategoryStore.getAll(),
    });
  }

  reloadCategories() {
    CategoryActions.reloadCategories();
  }

  render() {
    const { categories } = this.state;

    const CategoryComponents = categories.map((category) => {
        return <Todo key={category.name} {...category}/>;
    });

    return (
      <div>
        <button onClick={this.reloadCategories.bind(this)}>Reload!</button>
        <h1>Categories</h1>
        <ul>{CategoryComponents}</ul>
      </div>
    );
  }
}