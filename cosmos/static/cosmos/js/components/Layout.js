import React from "react";

import Footer from "./Footer";
import Header from "./Header";
import Categories from "../pages/Categories";

export default class Layout extends React.Component {
  constructor() {
    super();
    this.state = {
      title: "Welcome"
    };
  }

  render() {
    return (
      <div>
        <Header />
        <Categories />
        <Footer />
      </div>
    );
  }
}