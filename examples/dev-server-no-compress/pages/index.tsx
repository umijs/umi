import React, { useEffect, useState } from 'react';

class Event {
  data: string;
  timeString: string;

  constructor(data: string) {
    this.data = data;
    this.timeString = new Date().toLocaleTimeString();
  }
}

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  useEffect(() => {
    console.log('开始请求');
    const eventSource = new EventSource('/events/number');
    let startEvent = new Event('开始请求');
    setEvents((prev) => [...prev, startEvent]);
    eventSource.onmessage = function (e: any) {
      let item = new Event(e.data);
      setEvents((prev) => [...prev, item]);
    };
    eventSource.onerror = (e) => {
      console.log('EventSource failed:', e);
      eventSource.close();
    };
  }, []);
  return (
    <div className="container">
      <table>
        <thead>
          <tr>
            <th>事件内容</th>
            <th>接收时间</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event, index) => (
            <tr key={index}>
              <td>{event.data}</td>
              <td>{event.timeString}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
