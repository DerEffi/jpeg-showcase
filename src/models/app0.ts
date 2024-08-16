export enum DensityUnit {
    "px" = 0x00,
    "ppi" = 0x01,
    "ppcm"   = 0x02
}

export enum ThumbnailFormat {
    "JPEG"       = 0x10,
    "Palettized" = 0x11,
    "RGB"        = 0x13
}

export class Thumbnail {
    public format: ThumbnailFormat = ThumbnailFormat.RGB;
    public palette: number[] = []; // color palette for format '0x11'
    public width: number = 0; // Xthumbnail -> pixel count
    public height: number = 0; // Ythumbnail -> pixel count
    public data: Uint8Array = new Uint8Array();
}

/**
 *  App marker for JFIF itself
 */ 
export class APP0 {
    public identifier: string = ""; // JFIF or JFXX in ASCII (null terminated)
    public version: string = "";
    public densityUnits: DensityUnit = DensityUnit.px;
    public densityX: number = 0;
    public densityY: number = 0;
    public thumbnail: Thumbnail = new Thumbnail();
}