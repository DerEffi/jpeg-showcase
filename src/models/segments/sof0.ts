export default class SOF0 {
    public precision: number = 0; // bit/sample size
    public height: number = 0;
    public width: number = 0;
    public components: SOF0Component[] = [];// length: 1 = greayscale, 3 = color
}

export interface SOF0Component {
    identifier: number; // Y = 1, Cb = 2, Cr = 3, I = 4, Q = 5
    verticalSampling: number; // 4 MSB of byte
    horizontalSampling: number; // 4 LSB of byte
    dqt: number; // id of the quantization table
}