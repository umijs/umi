import { useEffect } from "react";
import axios from 'axios';

export default function HomePage() {

  useEffect(() => {
    axios("/aaa")
  }, [])

  return (
    <div>
      <h2>Yay! Welcome to umi!</h2>
      <p>
        To get started, edit <code>index.tsx</code> and save to reload.
      </p>
    </div>
  );
}
