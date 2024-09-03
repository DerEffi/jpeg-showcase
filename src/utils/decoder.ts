import { Bitstream } from "../models/bitstream";
import RunLengthPair from "../models/runlength";
import DHT from "../models/segments/dht";
import SOF0 from "../models/segments/sof0";
import SOS from "../models/segments/sos";
import { BinaryNode } from "../models/tree";

const sqrt2 = Math.sqrt(2.0);
const sqrt2Inverse = 1 / sqrt2;

/**
 * main decoding function for jpeg compression (baseline)
 */
export function decodeBaselineJPEG(compressedData: Uint8Array | number[], sof: SOF0, sos: SOS, dhts: DHT[]) {
    
    // init bitstream for loading single bits that don't line up nicely with whole bytes
    const datastream: Bitstream = new Bitstream(compressedData);

    // saving DC coefficients outside the loop, because they are delta encoded (depending on the values of the previous iteration)
    const coefficients: number[] = new Array(sos.components.length).fill(0);

    // saving different component extracted matrices
    const rawMCUData: number[][] = [];
    for(let i = 0; i < sos.components.length; i++)
        rawMCUData[i] = [];

    // calculating the number of 8x8 segments in the image
    // if not fitting exactly in 8x8 segments, account for padding
    let segmentHeight = Math.ceil(sof.height / 8);
    let segmentWidth = Math.ceil(sof.width / 8);

    // convert huffman table array into one index by their respective identifier
    const huffmanTables: DHT[] = [];
    dhts.forEach(dht => huffmanTables[dht.identifier] = dht);

    // looping over the segments to decode 8x8 squares from the bitstream
    for(let y = 0; y < segmentHeight; y++) {
        for(let x = 0; x < segmentWidth; x++) {
            
            // TODO account for sampling rate
            // decode the different components and store them for next steps
            for(let i = 0; i < sos.components.length; i++) {
                const componentDC: number = sos.components[i].dht & 0x0F; // 4 LSB for DC table
                const componentAC: number = 16 + ((sos.components[i].dht >> 4) & 0x0F); // 4 MSB for AC table with identifier 0b0001xxxx indicating an AC table
                rawMCUData[i].push(...decodeJPEGSegment(datastream, huffmanTables[componentDC], huffmanTables[componentAC], {value: coefficients[i]}));
            }

        }
    }
}

/**
 * Decode a single 8x8 square for a single component of the jpeg
 * @param datastream jpeg bitstream
 * @param dcHuffmanTable huffman table for decoding the dc value at the start
 * @param acHuffmanTable huffman table for decoding the ac values
 * @param dcCoefficient passed as object (by reference), so we can modify the value inside the function and don't have to return it
 * @returns 1d matrix of decoded values
 */
function decodeJPEGSegment(datastream: Bitstream, dcHuffmanTable: DHT, acHuffmanTable: DHT, dcCoefficient: { value: number }): number[] {

    if(dcHuffmanTable.identifier >= 16 || acHuffmanTable.identifier < 16)
        throw new Error("wrong type of DHT passed in decoding");

    // init 8x8 matrix with zeroes, since we will skip these
    const decodedValues: number[] = Array<number>(64).fill(0);

    // decoding first value in segment - always DC, delta encoded to the last used dc value for that component
    const encodedBitSize: number = getHuffmanValue(datastream, dcHuffmanTable) as number; // get bitsize of next value
    const encodedBits = datastream.nextBits(encodedBitSize); // retrive next value
    const decodedBits = decodeVariableLengthNumber(encodedBits, encodedBitSize); // decode variable length value to decimal number
    
    dcCoefficient.value = decodedBits + dcCoefficient.value; // add to last dc coefficient, because of delta encoding
    decodedValues[0] = dcCoefficient.value;

    // decoding all the other AC values in the 8x8 segment
    let index = 1; // starting at 1, cause 0 was DC value that we just did
    while(index < 64) {
        
        const runLengthInformation: RunLengthPair = getHuffmanValue(datastream, acHuffmanTable) as RunLengthPair; // get bitsize and leading zeroes of nxet value
        if(runLengthInformation.byteValue === 0)
            break; // (0,0) means end of segment

        index += runLengthInformation.skips; // skip the indicies of zero values
        if(index >= 64)
            break;

        const encodedACBits = datastream.nextBits(runLengthInformation.size); // retrieve next value
        const decodedACBits = decodeVariableLengthNumber(encodedACBits, runLengthInformation.size); // decode variable length value to decimal number
        decodedValues[index] = decodedACBits;

        index++;
    }

    return decodedValues;
}

/**
 * Traverses the huffman tree with the bits found in the passed in bitstream to determine the next huffman code / value
 * @param datastream to traverse along the huffman tree
 * @param huffmanTable to be traversed
 * @returns found value for the input bitstream with the type T of the given BinaryNodes<T> in the huffman tree passed in
 */
function getHuffmanValue(datastream: Bitstream, huffmanTable: DHT): number | RunLengthPair {

    // reading in bits and traversing the huffman tree until we get a valid huffman code
    let huffmanValue: BinaryNode<number> | undefined = huffmanTable.tree as BinaryNode<number>;
    do {
        const nextBit = datastream.nextBits(1);
        huffmanValue = nextBit === 0 ? huffmanValue.left : huffmanValue.right;
    } while(huffmanValue !== undefined && huffmanValue.value === undefined)   

    if(huffmanValue === undefined || huffmanValue.value === undefined)
        throw new Error("Could not determine huffman code for specified bits");

    return huffmanValue.value;
}

/**
 * Generates inverse DCT coefficient table for given size
 * @param size of each side of the table (usually 8)
 * @returns 2d matrix of coefficients
 */
function getInverseDCT(size: number = 8): number[][] {
    const matrix: number[][] = [];

    for(let y = 0; y < size; y++) {
        let row: number[] = [];
        const coeff = y === 0 ? sqrt2Inverse : 0;

        for(let x = 0; x < size; x++) {
            row.push(coeff * Math.cos(((2.0 * x + 1.0) * y * Math.PI) / (2.0 * size)))
        }

        matrix.push(row);
    }

    return matrix;
}

/**
 * Convert the variable length encoded number from the bitstream to decimal
 * 
 * Variable length encoding of signed number does not need an additional sign bit, the sign bit is implied with the number of bits necessary to encode it.
 * 
 * @example (IDE hover tooltip might not show properly)
 * 
 * bits           values                            binary
 *  0                0                                 -
 *  1              -1,1                               0,1
 *  2           -3,-2,2,3                         00,01,10,11
 *  3       -7,...,-4,4,...,7           000,001,010,011,100,101,110,111
 *  4      -15,...,-8,8,...,15       0000,0001,...,0111,1000,...,1110,1111
 * 
 * @param value number representation of the bits found in the bitstream
 * @param length number of bits that were necessary to hold that number in the bitstream
 */
function decodeVariableLengthNumber(value: number, length: number): number {
    // most significaant bit (msb) will be 1 for positive numbers -> value already represented correctly
    if((value >> (length - 1)) === 1)
        return value;

    // if msb 0 start at the left boundary: nagative of "(2^bitlength)-1" and add the value
    // mathematically reordered but still the same as described
    return (value - Math.pow(2, length) + 1);
}