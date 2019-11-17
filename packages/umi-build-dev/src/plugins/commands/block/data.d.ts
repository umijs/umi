export interface Block {
  url: string;
  name?: string;
  description?: string;
  img?: string;
  tags?: string[];
  previewUrl?: string;
}

export interface BlockData {
  data: Block[];
  success: boolean;
  message?: string;
}

export interface RequestParams {
  keyword?: string;
  current: number;
}

export interface Resource {
  id: string;
  name?: string;
  icon?: string;
  blockType?: 'template' | 'block';
  resourceType?: 'github' | 'custom';
  url?: string;
  description?: string;
  getData?: (params?: RequestParams) => Promise<BlockData>;
}

export interface AddBlockParams {
  url?: string;
  routePath?: string;
  name?: string;
  path?: string;
  isPage?: boolean;
  transformJS?: boolean;
  removeLocale?: boolean;
  index?: number;
  npmClient?: string;
  blockTarget?: string;
  block?: Block;
}
