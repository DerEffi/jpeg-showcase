/**
 * helper functions for retrieving half-byte information of runlength encoding with leading zeroes
 */
export default class RunLengthPair {
    
    /** value of all 8 bits */
    public readonly byteValue: number;
    /** first 4 bits for the leading number of zeroes before the next data value */
    public readonly skips: number;
    /** last 4 bits for the size of the data following the zero skips */ 
    public readonly size: number;

    constructor(value: number) {
        this.byteValue = value;
        this.skips = (value >> 4) & 0b00001111;
        this.size = value & 0b00001111;
    }
}