import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { getNotes } from "./store";

const Notes = (props) => {
  return (
    <div>
      <Link to="/home">Home</Link>
    </div>
  );
};

const mapStateToProps = (state) => state;

const mapDispatchToProps = (dispatch) => {
  return {
    getNotes: (userId) => dispatch(getNotes(userId)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Notes);
