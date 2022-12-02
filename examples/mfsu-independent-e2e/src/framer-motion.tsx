import { motion, Reorder } from 'framer-motion';
import React from 'react';

export default function HomePage() {
  const [isVisible, setIsVisible] = React.useState(true);
  const [items, setItems] = React.useState([0, 1, 2, 3]);
  return (
    <div>
      <h1>Framer Motion</h1>
      <h2>Toggle Visible</h2>
      <div>
        <button
          onClick={() => {
            setIsVisible((isVisible) => !isVisible);
          }}
        >
          toggle
        </button>
      </div>
      <br />
      <motion.div animate={{ opacity: isVisible ? 1 : 0 }}>
        TOGGLE ME
      </motion.div>
      <h2>Reorder</h2>
      <Reorder.Group axis="y" values={items} onReorder={setItems}>
        {items.map((item) => (
          <Reorder.Item key={item} value={item}>
            {item}
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  );
}
