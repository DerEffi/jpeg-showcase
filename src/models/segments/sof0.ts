export default class SOF0 {
    public precision: number = 0; // bit/sample size
    public height: number = 0;
    public width: number = 0;
    public componentSize: number = 0; // 1 = greayscale, 3 = color
    public components: SOF0Component[] = [];
}

export interface SOF0Component {
    identifier: number; // Y = 1, Cb = 2, Cr = 3, I = 4, Q = 5
    samplingFactors: number; // 0-3 vertical, 4-7 horizontal
    dqt: number; // id of the quantization table
}