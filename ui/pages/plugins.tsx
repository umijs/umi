import { PluginList } from '@/components/plugin/PluginList';
import { useAppData } from '@/hooks/useAppData';

export default function Page() {
  const { data } = useAppData();
  if (!data) return <div>Loading...</div>;
  return (
    <div>
      <PluginList plugins={data.plugins} />
    </div>
  );
}
