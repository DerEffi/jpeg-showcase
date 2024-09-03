import { parseAPP0, parseCOM, parseDHT, parseDQT, parseSOF0, parseSOS } from "../utils/parser";
import { renderAPP0, renderCOM, renderDHT, renderDQT, renderSOF0, renderSOS } from "../utils/rederer";
import Marker from "./marker";

/** 
 * Definition of known markers.
 * Class structure to make it usable like an Enum, but with multiple properties and not just a string/number as value
 * More information: https://en.wikipedia.org/wiki/JPEG#Syntax_and_structure
 */
export default class Segment {
    static readonly NONE = new Segment(0xFFFFFF, "NONE", true, false, 0, "Unknown segment");
    
    static readonly SOF0 = new Segment(0xFFC0, "SOF0", false, true, 2, "Start Of Frame (baseline DCT)", parseSOF0, renderSOF0);
    static readonly SOF1 = new Segment(0xFFC1, "SOF1", false, true, 2, "Start Of Frame (extended sequential DCT)");
    static readonly SOF2 = new Segment(0xFFC2, "SOF2", false, true, 2, "Start Of Frame (progressive DCT)");
    static readonly DHT = new Segment(0xFFC4, "DHT", false, true, 2, "Define Huffman Tables", parseDHT, renderDHT);
    static readonly JPG = new Segment(0xFFC8, "JPG", false, true, 2, "JPEG extensions");
    static readonly SOF10 = new Segment(0xFFCA, "SOF10", false, true, 2, "Progressive DCT");
    static readonly DAC = new Segment(0xFFCC, "DAC", false, true, 2, "Define Arithmetic Coding");

    static readonly SOI = new Segment(0xFFD8, "SOI", true, false, 2, "Start Of Image");
    static readonly EOI = new Segment(0xFFD9, "EOI", true, false, 2, "End Of Image");
    static readonly SOS = new Segment(0xFFDA, "SOS", false, false, 10, "Start Of Scan", parseSOS, renderSOS);
    static readonly DQT = new Segment(0xFFDB, "DQT", false, true, 2, "Define Quantization Table", parseDQT, renderDQT);
    static readonly COM = new Segment(0xFFFE, "COM", false, true, 2, "Comment", parseCOM, renderCOM);

    static readonly DRI = new Segment(0xFFDD, "DRI", false, true, 6, "Define Restart Interval");
    static readonly RST0 = new Segment(0xFFD0, "RST0", true, false, 2, "Restart");
    static readonly RST1 = new Segment(0xFFD1, "RST1", true, false, 2, "Restart");
    static readonly RST2 = new Segment(0xFFD2, "RST2", true, false, 2, "Restart");
    static readonly RST3 = new Segment(0xFFD3, "RST3", true, false, 2, "Restart");
    static readonly RST4 = new Segment(0xFFD4, "RST4", true, false, 2, "Restart");
    static readonly RST5 = new Segment(0xFFD5, "RST5", true, false, 2, "Restart");
    static readonly RST6 = new Segment(0xFFD6, "RST6", true, false, 2, "Restart");
    static readonly RST7 = new Segment(0xFFD7, "RST7", true, false, 2, "Restart");

    static readonly APP0 = new Segment(0xFFE0, "APP0", false, true, 2, "JFIF header", parseAPP0, renderAPP0);
    static readonly APP1 = new Segment(0xFFE1, "APP1", false, true, 2, "EXIF header");
    static readonly APP2 = new Segment(0xFFE2, "APP2", false, true, 2, "EXIF header (flashpoint)");
    static readonly APP3 = new Segment(0xFFE3, "APP3", false, true, 2, "App specific");
    static readonly APP4 = new Segment(0xFFE4, "APP4", false, true, 2, "App specific");
    static readonly APP5 = new Segment(0xFFE5, "APP5", false, true, 2, "App specific");
    static readonly APP6 = new Segment(0xFFE6, "APP6", false, true, 2, "App specific");
    static readonly APP7 = new Segment(0xFFE7, "APP7", false, true, 2, "App specific");
    static readonly APP8 = new Segment(0xFFE8, "APP8", false, true, 2, "App specific");
    static readonly APP9 = new Segment(0xFFE9, "APP9", false, true, 2, "App specific");
    static readonly APP10 = new Segment(0xFFEA, "APP10", false, true, 2, "App specific");
    static readonly APP11 = new Segment(0xFFEB, "APP11", false, true, 2, "App specific");
    static readonly APP12 = new Segment(0xFFEC, "APP12", false, true, 2, "App specific");
    static readonly APP13 = new Segment(0xFFED, "APP13", false, true, 2, "Adobe Photophop header");
    static readonly APP14 = new Segment(0xFFEE, "APP14", false, true, 2, "Copyright header");
    static readonly APP15 = new Segment(0xFFEF, "APP15", false, true, 2, "App specific");

    private constructor(
        readonly code: number, // marker code to indicate that segment in the byte array of the jpeg file
        readonly shortName: string,
        readonly isFixedSize: boolean, // true if size of that segment is the same for all jpeg files
        readonly hasSizeInfo: boolean, // true if following the marker is a 2-byte size indicator
        readonly size: number, // fixed or minimum size of that segment
        readonly name: string,
        readonly parser: (data: Uint8Array) => any = () => undefined, // function run on reading in newly uploaded file for parsing/preparing content 
        readonly renderer: (marker: Marker) => JSX.Element = () => <></> // function run during display of that selected segment for the user
    ) {}

    /**
     * @returns hexadecimal string representation of the bytecode in the file starting with '0x'
     */
    public get hexCode(): string {
        return "0x" + this.code.toString(16).toUpperCase();
    }

    toString() {
        return this.shortName;
    }

    /**
     * Find the Enum-like property for the Segment that matches the given bytecode
     * @param code bytecode to search for
     * @returns matching Segment for given bytecode
     */
    static findCode(code: number): Segment {
        const search = Segment.listAll()
            .filter(s => s.code === code) // find the code in the static properties listed above
        return search.length !== 1 ? Segment.NONE : search[0];
    }

    /**
     * List all known, predefined Segments
     * @returns List of the segments
     */
    static listAll(): Segment[] {
        return Object.getOwnPropertyNames(Segment)
            .filter(s => s === s.toUpperCase())  // only find the 'enum-like' properties and not something like 'length' or 'toString'
            .map(s => (Segment[s as keyof typeof Segment]))
            .filter(s => s instanceof Segment); // make sure it really is a segment and not some other property or function
    }
}
