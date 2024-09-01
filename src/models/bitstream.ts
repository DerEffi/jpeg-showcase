/**
 * Bitstream class for retrieving bits off of a bytestream not necessarily aligning nicely with whole byte boundries
 */
export class Bitstream {
    private readonly _data: Uint8Array | number[];
    private _position: number = 0; // position in the byte array
    private _queue: number[] = []; // unprocessed bits of the currently loaded byte in reverse order (use .pop() to get the next byte in the right order)

    constructor(data: Uint8Array | number[]) {
        this._data = data;
    }

    /**
     * Total length of the bitstream
     */
    public get length() {
        return this._data.length * 8;
    }

    /**
     * Current position / number of retrieved bits
     */
    public get position(): number {
        // return the position on the byte stream (in bits), but without the bits still in queue
        // if queue is empty all bits from the current byte have already been processed (no need to subtract anything)
        const bytePosition = this.position * 8;
        return this._queue.length === 0 ? bytePosition : bytePosition - (8 - this._queue.length);
    }

    /**
     * Retrieve n number of bits off of the initialized bytestream data
     * @param n number of bits to receive
     * @returns number representation of the bits received. left padded zeros will be discarded
     */
    public nextBits(n: number): number {
        let value = 0;
        
        for(let i = 0; i < n; i++) {
            // if queue is empty load the next byte in reverse order
            if(this._queue.length === 0) {
                if(this._position >= this._data.length)
                    throw new Error("No more bits left in bitstream");

                const byte = this._data[this._position++];
                for(let i = 0; i < 8; i++) {
                    // shift the bit further and further to the right and read in the last bit
                    // causes the bits to be loaded in reverse order, can be retrieved via .pop() in the right order
                    this._queue.push((byte >> i) & 0b1);
                }
            }

            // shift bits to the left and add the next value
            value = value * 2 + (this._queue.pop() || 0);
        }
        
        return value;
    }
}