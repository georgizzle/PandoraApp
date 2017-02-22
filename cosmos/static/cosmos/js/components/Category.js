import React from "react";

export default class Category extends React.Component {
  constructor(props) {
    super();
  }

  render() {
    const { name, desc, img } = this.props;


    return (
      <li>
        <span>{name}</span>
        <span>{desc}</span>
        <span>{img}</span>
      </li>
    );
  }
}