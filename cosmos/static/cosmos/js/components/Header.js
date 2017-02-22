import React from "react";


export default class Header extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      name: "Cosmos"
    };
  }

  render() {
    return (
    <div>
        <nav class="navbar navbar-toggleable-md navbar-light bg-faded">
          <button class="navbar-toggler navbar-toggler-right" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <a class="navbar-brand" href="#">{this.state.name}</a>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
          </div>
          </nav>
     </div>
    );
  }
}