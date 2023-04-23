import { Datum } from '@antv/g2plot';

export { Datum };

export interface VisitDataType {
  x: string;
  y: number;
}

export type SearchDataType = {
  index: number;
  keyword: string;
  count: number;
  range: number;
  status: number;
};

export type OfflineDataType = {
  name: string;
  cvr: number;
};

export interface OfflineChartData {
  date: number;
  type: number;
  value: number;
}

export type RadarData = {
  name: string;
  label: string;
  value: number;
};

export interface AnalysisData {
  visitData: Datum[];
  visitData2: Datum[];
  salesData: Datum[];
  searchData: Datum[];
  offlineData: OfflineDataType[];
  offlineChartData: Datum[];
  salesTypeData: Datum[];
  salesTypeDataOnline: Datum[];
  salesTypeDataOffline: Datum[];
  radarData: RadarData[];
}
