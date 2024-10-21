import React from "react";
import Heading from "../components/common/Heading";
import About from "../components/home/About";
import Team from "../components/home/Team";

export default function AboutUs() {
  return (
    <>
      <Heading heading="Acerca de nosotros" title="PETHEAVEN"/>
      <About />
      <Team />
    </>
  );
}
