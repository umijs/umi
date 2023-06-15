import React, { useEffect } from 'react';
import Contributing from '../components/Contributing';
import Features from '../components/Features';
import Footer from '../components/Footer';
import Hero from '../components/Hero';
import WhoIsUsing from '../components/WhoIsUsing';

export default () => {
  useEffect(() => {
    document.title = 'UmiJS - 插件化的企业级前端应用框架';
  });

  return (
    <>
      <Hero></Hero>
      <Features></Features>
      <WhoIsUsing></WhoIsUsing>
      <Contributing></Contributing>
      <Footer></Footer>
    </>
  );
};
