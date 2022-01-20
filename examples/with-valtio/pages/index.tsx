import React from 'react';
import DisplayCount from "../components/DisplayCount";
import ControlCount from "../components/ControlCount";

export default function HomePage() {
  return (
    <div className="container">
      <p className="title">UmiJS x Valtio</p>
      <DisplayCount/>
      <ControlCount/>
      <div className="description">
        <p>The buttons and the display number is not in one component.</p>
        <p>They share the state by a proxy using valtio.</p>
      </div>
    </div>
  );
}
