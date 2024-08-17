/**
 * Quantisation tables
 */
export default class DQT {
    public hasWords: boolean = false; // precision mode: bytes = 8bit (false) or words = 16bit (true)
    public destination: number = 0; // destination identifier for the component this DQT is used for.
    public values: number[] = []; // 64 numbers in zigzag order
}