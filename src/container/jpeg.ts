import Marker from "../models/marker";
import Segment from "../models/segment";
import DHT from "../models/segments/dht";
import SOF0 from "../models/segments/sof0";
import { decodeJPEG } from "../utils/decoder";
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

        // decode the sof content (jpeg encoded data bitstream)
        // TODO dynamically find markers and use right decoding method 
        const dhts: DHT[] = this._markers.filter(marker => marker.code === Segment.DHT.code).map(marker => marker.content) as DHT[];
        const sofs: SOF0[] = this._markers.filter(marker => marker.code === Segment.SOF0.code).map(marker => marker.content) as SOF0[];
        const soss: number[][] = this._markers.filter(marker => marker.code === Segment.SOS.code).map(marker => marker.content) as number[][];
        if(dhts.length !== 4 || sofs.length !== 1 || soss.length !== 1)
            throw new Error("Not implemented (yet)");
        //decodeJPEG(soss[0], sofs[0], dhts);
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