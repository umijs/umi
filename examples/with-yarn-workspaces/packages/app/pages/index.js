import Head from 'head';
import Footer from 'footer';

export default function Home() {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '20px 0 40px 0',
      }}
    >
      <Head />
      <p style={{ margin: '16px 0' }}>
        🍙 Extensible enterprise-level front-end application framework.
      </p>
      <Footer />
    </div>
  )
}
