import APP0, { DensityUnit, ThumbnailFormat } from "../models/segments/app0";
import Marker from "../models/marker";
import { Buffer } from 'buffer';
import { padLeft, sanitize } from "./formatter";
import Segment from "../models/segment";
import DQT from "../models/segments/dqt";
import SOF0 from "../models/segments/sof0";

/**
 * Reads and validates size of the given data to match the table of contents and minimum length for it to contain valid data
 * @param data bytearray of the segment to analyse
 * @param segment given definition for the segment the data should represent
 * @param [minLen=2] additional required length to contain valid data for the specified segment type
 * @returns true if validation passes (never false, throws instead)
 * @throws Error if validation fails
 */
function validateSegmentSize(data: Uint8Array, segment: Segment, minLen = 2): boolean {
    if(data.byteLength < minLen)
        throw new Error(`Given data is too short to be ${segment.shortName} header`);
    const marker = data[0] * 256 + data[1];
    if(marker !== segment.code)
        throw new Error(`Can't analyse '0x${marker.toString(16).toUpperCase()}' as ${segment.shortName} - ${segment.hexCode} expected`);
    if(segment.hasSizeInfo) {
        const size = data[2] * 256 + data[3] + 2; // add 2 bytes for the marker itself
        if(data.byteLength !== size)
            throw new Error(`Given data doesn't match the defined ${segment.shortName} header size`);

    }

    return true;
}

/**
 * Reads the file contents and creates a table of the different segments of the jpeg
 * 
 * @param data content of the entire file
 * @returns table of contents
 */
export function generateSegmentTable(data: Uint8Array) {
    let position: number = 0;
    const endOfFile = data.byteLength - 2; // minus 2, because our markers are 2 byte long and can't fit on a single last byte on the end of the file
    const markers: Marker[] = [];

    while(position <= endOfFile) {
        const marker: Marker = new Marker();
        
        // read in the code of the current marker and the assigned known segment if exists
        marker.start = position;
        marker.code = data[position] * 256 + data[position + 1];    
        marker.segment = Segment.findCode(marker.code);
        if(marker.segment === Segment.NONE)
            throw new Error("Unknown Segment found: '0x" + marker.code.toString(16).toUpperCase() + "'");

        // determine size of the current segment
        if(marker.segment.isFixedSize) {
            marker.size = marker.segment.size;
        } else if(position + 2 <= endOfFile) {
            if(marker.segment.hasSizeInfo) {
                marker.size = data[position + 2] * 256 + data[position + 3] + 2; // add additional two bytes for the marker itself
            } else {
                // no info on size of the segment -> scrub through the data until the next marker is found
                let searchPosition = position + 2; // start to search after the current marker
                while(searchPosition <= endOfFile) { 
                    // markers cannot be 0xFF00 or 0xFFFF
                    // if the encoded data would represent a marker by accident (so 0xFF appears) it would be bitstuffed with 0x00, so that we know we have a marker, when it looks like one
                    if(data[searchPosition] === 0xFF && data[searchPosition + 1] !== 0x00) {
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
        markers.push(marker);
    }
    
    return markers;
}

/**
 * Parses the App0 segment of the jpeg file
 * 
 * @param data content of the segment to analyse including starting marker
 */
export function parseAPP0(data: Uint8Array): APP0 {
    validateSegmentSize(data, Segment.APP0, 10);

    // read identifier
    const content: APP0 = new APP0();
    const identifier = Buffer.from(data.subarray(4, 8)).toString();
    content.identifier = sanitize(identifier);
    
    if(content.identifier === "JFIF" || data.byteLength < 18) {
    
        // parse version number
        const major = data[9];
        const minor = data[10];
        content.version = major + "." + padLeft(minor, 2);

        // parse density information
        if(!(data[11] in DensityUnit))
            throw new Error("Unknown thumbnail density unit '" + data[11] + "'");
        content.densityUnits = data[11];
        content.densityX = data[12] * 256 + data[13];
        content.densityY = data[14] * 256 + data[15];

        // parse thumbnail information
        // Uncompressed 24 bit RGB (8 bits per color channel) raster thumbnail data
        content.thumbnail.width = data[16];
        content.thumbnail.height = data[17];
        content.thumbnail.data = data.subarray(18) || [];
    
    } else if(content.identifier === "JFXX") {

        // parse thumbnail
        if(!(data[9] in ThumbnailFormat))
            throw new Error("Unknown thumbnail format '" + data[9] + "'");
        content.thumbnail.format = data[9];

        if(content.thumbnail.format === ThumbnailFormat.JPEG) {
            // Not implemented 
        } else if(content.thumbnail.format === ThumbnailFormat.Palettized) {

            // check if segment is large enough to hold the palette information
            if(data.byteLength <= 780)
                throw new Error("APP0 segment not large enough to hold thumbnail color palette information");

            content.thumbnail.width = data[10];
            content.thumbnail.height = data[11];
            // 256 palette entries, each containing a 24 bit RGB color value
            for(let i = 12; i < 778; i = i + 3)
                content.thumbnail.palette.push(data[i] * 65536 + data[i + 1] * 256 + data[i + 2]);
            content.thumbnail.data = data.subarray(780);

        } else {
            
            // Uncompressed 24 bit RGB (8 bits per color channel) raster thumbnail data
            content.thumbnail.width = data[10];
            content.thumbnail.height = data[11];
            content.thumbnail.data = data.subarray(12);

        }

    } else {
        throw new Error("Not a valid App0 header identifier for JFIF");
    }

    return content;
}

/**
 * Parses the COM segment of the jpeg file
 * 
 * @param data content of the segment to analyse including starting marker
 */
export function parseCOM(data: Uint8Array): string {
    validateSegmentSize(data, Segment.COM, 5);

    const comment = Buffer.from(data.subarray(4)).toString()

    return sanitize(comment);
}

/**
 * Parses the DQT segment of the jpeg file
 * 
 * @param data content of the segment to analyse including starting marker
 */
export function parseDQT(data: Uint8Array): DQT {
    validateSegmentSize(data, Segment.DQT, 69);

    const content = new DQT();

    // check the second bit for precision and the last two for destination
    content.hasWords = ((data[4] >> 2) & 1) === 1;
    content.destination = data[4] & 3;

    if((content.hasWords && data.byteLength !== 133) || (!content.hasWords && data.byteLength !== 69))
        throw new Error("wrong sized DQT");

    // read in values, convert from 8bit to 16bit numbers if necessary
    if(content.hasWords) {
        const lastByte = data.byteLength - 1;
        for(let i = 5; i < lastByte; i += 2)
            content.values.push(data[i] * 256 + data[i + 1]);
    } else {
        content.values = Array.from(data.subarray(5));
    }

    return content;
}

export function parseSOF0(data: Uint8Array): SOF0 {
    validateSegmentSize(data, Segment.SOF0, 13);

    const content = new SOF0();

    // read sof0 data
    content.precision = data[4];
    content.height = data[5] * 256 + data[6];
    content.width = data[7] * 256 + data[8];
    content.componentSize = data[9];

    // read in sof0 components
    const lastByte = data.byteLength - 2;
    for(let i = 10; i < lastByte; i += 3) {
        content.components.push({
            identifier: data[i],
            samplingFactors: data[i + 1],
            dqt: data[i + 2]
        });
    }

    return content;
}