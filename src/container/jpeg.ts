import Marker from "../models/marker";
import { generateSegmentTable } from "../utils/parser";

export default class JPEG {

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
        this._markers = generateSegmentTable(this._data);
        console.dir(this._markers);

        // parse the different sections
        for(let i = 0; i < this._markers.length; i++) {
            let marker = this._markers[i];
            marker.content = marker.segment.parser(this._data.subarray(marker.start, marker.end));
        }
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