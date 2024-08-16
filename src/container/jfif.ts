import Marker from "../models/marker";
import JFIFParser from "../utils/jfifParser";

export default class JFIF {

    // raw byte data of the uploaded file
    private _data: Uint8Array = new Uint8Array();
    // table of contents / segments of the jpeg
    private _markers: Marker[] = [];

    // initial parsing of the file
    constructor(buffer?: ArrayBuffer) {
        if(!buffer || buffer.byteLength < 4)
            return;

        this._data = new Uint8Array(buffer);

        // read the table of contents of the file
        this._markers = JFIFParser.generateSegmentTable(this._data);

        // read app0
        console.dir(JFIFParser.parseAPP0(this._data.subarray(this._markers[1].start, this._markers[1].end)));
    }

    /**
     * File length in bytes
     */
    get length(): number {
        return this._data.byteLength;
    }

    /**
     * Table of content
     */
    get markers(): Marker[] {
        return this._markers;
    }
}