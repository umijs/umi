import { useAppData } from '@/hooks/useAppData';
import { PluginList } from '@/pages/plugins/components/PluginList';

export default function Page() {
  const { data } = useAppData();
  if (!data) return <div>Loading...</div>;
  return (
    <div>
      <PluginList plugins={data.plugins} />
    </div>
  );
}
