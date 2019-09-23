export interface Block {
  url: string;
  name: string;
  description: string;
  img: string;
  defaultPath: string;
  tags: string[];
}

export interface BlockData {
  data: Block[];
}

export interface RequestParams {
  keyword?: string;
  current: number;
}

export interface Resource {
  id: string;
  name: string;
  blockType: 'template' | 'block';
  resourceType: 'github' | 'custom';
  url?: string;
  getData?: (params: RequestParams) => BlockData;
}

export interface AddBlockParams {
  url: string;
  path?: string;
  isPage?: boolean;
  transformJS?: boolean;
}
