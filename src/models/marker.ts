/**
 * Base information of a marker present in the bytecode of the uploaded file.
 * Used to mark the beginning of a new data segment.
 * More information: https://en.wikipedia.org/wiki/JPEG#Syntax_and_structure
 */
export default class Marker {
    public code: number = 0; // identifier for the type
    public start: number = 0;
    public size: number = 0;
    public segment: Segment = segments[0];
    public content?: any;

    get end(): number {
        return this.start + this.size + 2; // add two more bytes for the marker code
    }

    get hexCode(): string {
        return "0x" + this.code.toString(16).toUpperCase();
    }
}

export interface Segment {
    code: number;
    isFixedSize: boolean;
    hasSizeInfo: boolean;
    size: number;
    shortName: string;
    name: string;
    comment: string;
}

/** 
 * Definition of known markers.
 * More information: https://en.wikipedia.org/wiki/JPEG#Syntax_and_structure
 */
export const segments: Segment[] = [
    { code: 0xFFFFFF, isFixedSize: true, hasSizeInfo: false, size: 0, shortName: "NULL", name: "Unknown segment", comment: "Segment could not be found in the list of known segments." },
    
    
    { code: 0xFFC0, isFixedSize: false, hasSizeInfo: true, size: 2, shortName: "SOF0", name: "Start Of Frame (baseline DCT)", comment: "Indicates that this is a baseline DCT-based JPEG, and specifies the width, height, number of components, and component subsampling (e.g., 4:2:0)." },
    { code: 0xFFC1, isFixedSize: false, hasSizeInfo: true, size: 2, shortName: "SOF1", name: "Start Of Frame (extended sequential DCT)", comment: "Indicates that this is a extended sequential DCT-based JPEG, and specifies the width, height, number of components, and component subsampling (e.g., 4:2:0)." },
    { code: 0xFFC2, isFixedSize: false, hasSizeInfo: true, size: 2, shortName: "SOF2", name: "Start Of Frame (progressive DCT)", comment: "Indicates that this is a progressive DCT-based JPEG, and specifies the width, height, number of components, and component subsampling (e.g., 4:2:0)." },
    { code: 0xFFC4, isFixedSize: false, hasSizeInfo: true, size: 2, shortName: "DHT", name: "Define Huffman Table(s)", comment: "Specifies one or more Huffman tables." },
    { code: 0xFFC8, isFixedSize: false, hasSizeInfo: true, size: 2, shortName: "JPG", name: "JPEG extensions", comment: "" },
    { code: 0xFFCA, isFixedSize: false, hasSizeInfo: true, size: 2, shortName: "SOF10", name: "Progressive DCT", comment: "" },
    { code: 0xFFCC, isFixedSize: false, hasSizeInfo: true, size: 2, shortName: "DAC", name: "Define Arithmetic Coding", comment: "" },


    { code: 0xFFD8, isFixedSize: true, hasSizeInfo: false, size: 2, shortName: "SOI", name: "Start Of Image", comment: "" },
    { code: 0xFFD9, isFixedSize: true, hasSizeInfo: false, size: 2, shortName: "EOI", name: "End Of Image", comment: "" },
    { code: 0xFFDA, isFixedSize: false, hasSizeInfo: false, size: 2, shortName: "SOS", name: "Start Of Scan", comment: "Begins a top-to-bottom scan of the image. In baseline DCT JPEG images, there is generally a single scan. Progressive DCT JPEG images usually contain multiple scans. This marker specifies which slice of data it will contain, and is immediately followed by entropy-coded data." },
    { code: 0xFFDB, isFixedSize: false, hasSizeInfo: true, size: 2, shortName: "DQT", name: "Define Quantization Table(s)", comment: "Specifies one or more quantization tables." },
    { code: 0xFFFE, isFixedSize: false, hasSizeInfo: true, size: 2, shortName: "COM", name: "Comment", comment: "" },


    { code: 0xFFDD, isFixedSize: false, hasSizeInfo: true, size: 6, shortName: "DRI", name: "Define Restart Interval", comment: "Specifies the interval between RSTn markers, in Minimum Coded Units (MCUs)." },
    { code: 0xFFD0, isFixedSize: true, hasSizeInfo: false, size: 2, shortName: "RST-0", name: "Restart", comment: "Inserted every r macroblocks, where r is the restart interval set by a DRI marker." },
    { code: 0xFFD1, isFixedSize: true, hasSizeInfo: false, size: 2, shortName: "RST-1", name: "Restart", comment: "Inserted every r macroblocks, where r is the restart interval set by a DRI marker." },
    { code: 0xFFD2, isFixedSize: true, hasSizeInfo: false, size: 2, shortName: "RST-2", name: "Restart", comment: "Inserted every r macroblocks, where r is the restart interval set by a DRI marker." },
    { code: 0xFFD3, isFixedSize: true, hasSizeInfo: false, size: 2, shortName: "RST-3", name: "Restart", comment: "Inserted every r macroblocks, where r is the restart interval set by a DRI marker." },
    { code: 0xFFD4, isFixedSize: true, hasSizeInfo: false, size: 2, shortName: "RST-4", name: "Restart", comment: "Inserted every r macroblocks, where r is the restart interval set by a DRI marker." },
    { code: 0xFFD5, isFixedSize: true, hasSizeInfo: false, size: 2, shortName: "RST-5", name: "Restart", comment: "Inserted every r macroblocks, where r is the restart interval set by a DRI marker." },
    { code: 0xFFD6, isFixedSize: true, hasSizeInfo: false, size: 2, shortName: "RST-6", name: "Restart", comment: "Inserted every r macroblocks, where r is the restart interval set by a DRI marker." },
    { code: 0xFFD7, isFixedSize: true, hasSizeInfo: false, size: 2, shortName: "RST-7", name: "Restart", comment: "Inserted every r macroblocks, where r is the restart interval set by a DRI marker." },


    { code: 0xFFE0, isFixedSize: false, hasSizeInfo: true, size: 2, shortName: "APP-0", name: "App specific", comment: "JFIF Header" },
    { code: 0xFFE1, isFixedSize: false, hasSizeInfo: true, size: 2, shortName: "APP-1", name: "App specific", comment: "Exif Header" },
    { code: 0xFFE2, isFixedSize: false, hasSizeInfo: true, size: 2, shortName: "APP-2", name: "App specific", comment: "" },
    { code: 0xFFE3, isFixedSize: false, hasSizeInfo: true, size: 2, shortName: "APP-3", name: "App specific", comment: "" },
    { code: 0xFFE4, isFixedSize: false, hasSizeInfo: true, size: 2, shortName: "APP-4", name: "App specific", comment: "" },
    { code: 0xFFE5, isFixedSize: false, hasSizeInfo: true, size: 2, shortName: "APP-5", name: "App specific", comment: "" },
    { code: 0xFFE6, isFixedSize: false, hasSizeInfo: true, size: 2, shortName: "APP-6", name: "App specific", comment: "" },
    { code: 0xFFE7, isFixedSize: false, hasSizeInfo: true, size: 2, shortName: "APP-7", name: "App specific", comment: "" },
    { code: 0xFFE8, isFixedSize: false, hasSizeInfo: true, size: 2, shortName: "APP-8", name: "App specific", comment: "" },
    { code: 0xFFE9, isFixedSize: false, hasSizeInfo: true, size: 2, shortName: "APP-9", name: "App specific", comment: "" },
    { code: 0xFFEA, isFixedSize: false, hasSizeInfo: true, size: 2, shortName: "APP-A", name: "App specific", comment: "" },
    { code: 0xFFEB, isFixedSize: false, hasSizeInfo: true, size: 2, shortName: "APP-B", name: "App specific", comment: "" },
    { code: 0xFFEC, isFixedSize: false, hasSizeInfo: true, size: 2, shortName: "APP-C", name: "App specific", comment: "" },
    { code: 0xFFED, isFixedSize: false, hasSizeInfo: true, size: 2, shortName: "APP-D", name: "App specific", comment: "" },
    { code: 0xFFEE, isFixedSize: false, hasSizeInfo: true, size: 2, shortName: "APP-E", name: "App specific", comment: "Often Copyright" },
    { code: 0xFFEF, isFixedSize: false, hasSizeInfo: true, size: 2, shortName: "APP-F", name: "App specific", comment: "" },

];