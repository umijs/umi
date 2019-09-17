export interface Block {
  url: string;
  name: string;
  description: string;
  img: string;
  isPage: boolean;
  defaultPath: string;
  tags: string[];
}

export interface BlockData {
  data: Block[];
}

export interface Resource {
  id: string;
  name: string;
  type: 'git' | 'custom';
  url?: string;
  handler?: () => BlockData;
}

export interface AddBlockParams {
  url: string;
  path?: string;
  isPage?: boolean;
  transformJS?: boolean;
}
