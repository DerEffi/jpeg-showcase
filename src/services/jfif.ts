import Marker, { segments } from "../models/marker";

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
        this.parseMarkers();
    }

    // Reads the file contents and creates a table of the different segments of the jpeg
    private parseMarkers() {
        let position: number = 0;
        const endOfFile = this._data.byteLength - 2; // minus 2, because our markers are 2 byte long and can't fit on a single last byte on the end of the file

        while(position <= endOfFile) {
            const marker: Marker = new Marker();
            
            // read in the code of the current marker and the assigned known segment if exists
            marker.start = position;
            marker.code = this._data[position] * 256 + this._data[position + 1];
            const segmentSearch = segments.filter(s => s.code === marker.code);
            if(segmentSearch.length === 0)
                throw new Error("Unknown Segment found");    
            marker.segment = segmentSearch[0];

            // determine size of the current segment
            if(marker.segment.isFixedSize) {
                marker.size = marker.segment.size;
            } else if(position + 2 <= endOfFile) {
                if(marker.segment.hasSizeInfo) {
                    marker.size = this._data[position + 2] * 256 + this._data[position + 3] + 2; // add additional two bytes for the marker itself
                } else {
                    // no info on size of the segment -> scrub through the data until the next marker is found
                    let searchPosition = position + 2; // start to search after the current marker
                    while(searchPosition <= endOfFile) { 
                        // markers cannot be 0xFF00 or 0xFFFF
                        // if the encoded data would represent a marker by accident (so 0xFF appears) it would be bitstuffed with 0x00, so that we know we have a marker, when it looks like one
                        if(this._data[searchPosition] === 0xFF && this._data[searchPosition + 1] !== 0x00) {
                            marker.size = searchPosition - position
                            break;
                        }
                        searchPosition++;
                    }
                }
            } else {
                throw new Error("Unexpected file end");
            }

            // skip data for the current segment
            position += marker.size // additional two bytes for the marker code (not included in the definitions)

            // add marker to marker table
            this._markers.push(marker);
        }
    }

    get length(): number {
        return this._data.byteLength;
    }

    get markers(): Marker[] {
        return this._markers;
    }
}