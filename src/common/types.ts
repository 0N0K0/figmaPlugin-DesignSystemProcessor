export type layoutGuide = {
  minColumnWidth: number;
  gutter: number;
  horizontalBodyPadding: number;
  baselineGrid: number;
  minViewportHeight: number;
  horizontalMainPadding: number;
  maxContentHeight: number;
  offsetHeight: number;
};

export type imageDatas = Record<
  string,
  Array<{ name: string; data: ArrayBuffer; width: number; height: number }>
>;

export type radiusDatas = Record<string, number>;
