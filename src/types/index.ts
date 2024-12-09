export type TFragment = {
  id?: number;
  startTime: string;
  endTime: string;
  startSeconds?: number;
  endSeconds?: number;
};

export type TFile = {
  name: string;
  type: string;
  size: number;
  path: string;
};

export type TVideo = {
  videoName: string;
  fragmentList?: TFragment[];
  inputPath: string;
  outputPath?: string;
};
