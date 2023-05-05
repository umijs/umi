import { RouteChart } from '@/components/routes/routeChart';
import { RouteDrawer } from '@/components/routes/routeDrawer';
import { useAppData } from '@/hooks/useAppData';
import { FAKE_ID, realizeRoutes } from '@/utils/realizeRoutes';
import { useState } from 'react';

export default function Page() {
  const [open, setOpen] = useState(false);
  const [routeId, setRouteId] = useState('');
  const { data } = useAppData();
  if (!data) return <div>Loading...</div>;

  const routes = data.routes;
  const info = routes[routeId];
  const handleClickNode = (routeId: string) => {
    if (routeId === FAKE_ID) {
      return;
    }
    setRouteId(routeId);
    setOpen(true);
  };
  return (
    <div>
      <RouteDrawer open={open} info={info} onClose={() => setOpen(false)} />
      <RouteChart
        routes={realizeRoutes(routes)}
        onNodeClick={handleClickNode}
      />
    </div>
  );
}
