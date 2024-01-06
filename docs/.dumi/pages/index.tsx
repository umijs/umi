/**
 * title: UmiJS - 插件化的企业级前端应用框架
 */
import { Contributing } from '../components/Contributing';
import { Features } from '../components/Features';
import { Footer } from '../components/Footer';
import { Hero } from '../components/Hero';
import { WhoIsUsing } from '../components/WhoIsUsing';
import './index.less';

const Index = () => {
  return (
    <>
      <Hero />
      <Features />
      <WhoIsUsing />
      <Contributing />
      <Footer />
    </>
  );
};

export default Index;
