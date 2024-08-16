import { APP0, DensityUnit, ThumbnailFormat } from "../models/app0"
import Marker from "../models/marker"

export function renderAPP0(marker: Marker<APP0>): JSX.Element {
    if(marker.content === undefined || !(marker.content instanceof APP0))
        return <></>

    return(
        <>
            ID: {marker.content.identifier} Version {marker.content.identifier === "JFIF" ? marker.content.version : ""}<br/>
            Density: {marker.content.densityX} x {marker.content.densityY} {DensityUnit[marker.content.densityUnits]}<br/>
            Thumbnail: {marker.content.thumbnail.width} x {marker.content.thumbnail.height} px ({ThumbnailFormat[marker.content.thumbnail.format]})
        </>
    );
}