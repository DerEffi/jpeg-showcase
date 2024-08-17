import Segment from "./segment";

/**
 * Base information of a marker present in the bytecode of the uploaded file.
 * Used to mark the beginning of a new data segment.
 * More information: https://en.wikipedia.org/wiki/JPEG#Syntax_and_structure
 */
export default class Marker<ContentType = any> {
    public code: number = 0; // identifier for the type
    public start: number = 0;
    public size: number = 0;
    public segment: Segment = Segment.NONE;
    public content?: ContentType;

    get end(): number {
        return this.start + this.size;
    }

    get hexCode(): string {
        return "0x" + this.code.toString(16).toUpperCase();
    }
}