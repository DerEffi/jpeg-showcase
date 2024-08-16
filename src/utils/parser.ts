import { APP0, DensityUnit, ThumbnailFormat } from "../models/app0";
import Marker, { Segment } from "../models/marker";
import { Buffer } from 'buffer';
import { padLeft } from "./formatter";

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
export function parseAPP0(data: Uint8Array) {
    // validate app0 marker and length
    if(data.byteLength <= 9)
        throw new Error("Given data is too short to be JFIF APP0 header");
    const size = data[2] * 256 + data[3] + 2; // add 2 bytes for the marker itself
    if(data.byteLength !== size)
        throw new Error("Given data doesn't match the defined APP0 header size");
    const marker = data[0] * 256 + data[1];
    if(marker !== 0xFFE0)
        throw new Error("Can't analyse '0x" + marker.toString(16).toUpperCase() + "' as APP0 - 0xFFE0 expected");

    // read identifier
    const content: APP0 = new APP0();
    content.identifier = Buffer.from(data.subarray(4, 8)).toString();
    
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
            if(size <= 780)
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