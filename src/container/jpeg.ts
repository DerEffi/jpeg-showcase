import Marker from "../models/marker";
import Segment from "../models/segment";
import DHT from "../models/segments/dht";
import SOF0 from "../models/segments/sof0";
import SOS from "../models/segments/sos";
import { decodeBaselineJPEG } from "../utils/decoder";
import { generateSegmentTable, parseEntropyEncoded } from "../utils/parser";

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
        console.dir(this._markers); //! DEBUG

        // parse the different sections
        for(let i = 0; i < this._markers.length; i++) {
            let marker = this._markers[i];
            marker.content = marker.segment.parser(this._data.subarray(marker.start, marker.end));
        }

        // adjust size of sos marker, since the next marker does not follow directly after
        const soss: Marker<SOS>[] = this._markers.filter(marker => marker.code === Segment.SOS.code) as Marker<SOS>[];
        soss.forEach(sos => sos.size = 2 * (sos.content as SOS).components.length + 8) // 8 fixed bytes and 3 bytes per component

        // decode the sof content (jpeg encoded data bitstream)
        // TODO dynamically find markers and use right decoding method
        const sofs: Marker<SOF0>[] = this._markers.filter(marker => marker.code === Segment.SOF0.code) as Marker<SOF0>[];
        const dhts: Marker<DHT>[] = this._markers.filter(marker => marker.code === Segment.DHT.code) as Marker<DHT>[];
        if(sofs.length !== 1 || soss.length !== 1)
            throw new Error("Not implemented (yet)");
        
        const entropyEncodedData = parseEntropyEncoded(this._data.subarray(soss[0].end));
        decodeBaselineJPEG(entropyEncodedData, sofs[0].content as SOF0, soss[0].content as SOS, dhts.map(marker => marker.content as DHT));
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