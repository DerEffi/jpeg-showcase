import APP0, { DensityUnit, ThumbnailFormat } from "../models/segments/app0";
import DQT from "../models/segments/dqt";
import Marker from "../models/marker"
import { sanitize } from "./formatter";
import SOF0 from "../models/segments/sof0";
import DHT from "../models/segments/dht";
import Tree, { CustomNodeElementProps, RawNodeDatum } from 'react-d3-tree';
import { BinaryNode } from "../models/tree";
import RunLengthPair from "../models/runlength";

export function renderAPP0(marker: Marker<APP0>): JSX.Element {
    if(marker.content === undefined || !(marker.content instanceof APP0))
        return <></>

    return(
        <>
            ID: {sanitize(marker.content.identifier)} Version {marker.content.identifier === "JFIF" ? marker.content.version : ""}<br/>
            Density: {marker.content.densityX} x {marker.content.densityY} {DensityUnit[marker.content.densityUnits]}<br/>
            Thumbnail: {marker.content.thumbnail.width} x {marker.content.thumbnail.height} px ({ThumbnailFormat[marker.content.thumbnail.format]})
        </>
    );
}

export function renderCOM(marker: Marker<string>): JSX.Element {
    if(marker.content === undefined || (typeof marker.content !== "string"))
        return <></>

    return(
        <>
            {sanitize(marker.content)}  
        </>
    );
}

export function renderDQT(marker: Marker<DQT>): JSX.Element {
    if(marker.content === undefined || !(marker.content instanceof DQT) || marker.content.values.length !== 64)
        return <></>

    return(
        <>
            Precision: {marker.content.hasWords ? "words" : "bytes"} <br/>
            Destination: {marker.content.destination}<br/>
            <br/>
            <table>
                <tr><td>{marker.content.values[0]}</td><td>{marker.content.values[1]}</td><td>{marker.content.values[5]}</td><td>{marker.content.values[6]}</td><td>{marker.content.values[14]}</td><td>{marker.content.values[15]}</td><td>{marker.content.values[27]}</td><td>{marker.content.values[28]}</td>
                </tr>
                <tr><td>{marker.content.values[2]}</td><td>{marker.content.values[4]}</td><td>{marker.content.values[7]}</td><td>{marker.content.values[13]}</td><td>{marker.content.values[16]}</td><td>{marker.content.values[26]}</td><td>{marker.content.values[29]}</td><td>{marker.content.values[42]}</td>
                </tr>
                <tr><td>{marker.content.values[3]}</td><td>{marker.content.values[8]}</td><td>{marker.content.values[12]}</td><td>{marker.content.values[17]}</td><td>{marker.content.values[25]}</td><td>{marker.content.values[30]}</td><td>{marker.content.values[41]}</td><td>{marker.content.values[43]}</td>
                </tr>
                <tr><td>{marker.content.values[9]}</td><td>{marker.content.values[11]}</td><td>{marker.content.values[18]}</td><td>{marker.content.values[24]}</td><td>{marker.content.values[31]}</td><td>{marker.content.values[40]}</td><td>{marker.content.values[44]}</td><td>{marker.content.values[53]}</td>
                </tr>
                <tr><td>{marker.content.values[10]}</td><td>{marker.content.values[19]}</td><td>{marker.content.values[23]}</td><td>{marker.content.values[32]}</td><td>{marker.content.values[39]}</td><td>{marker.content.values[45]}</td><td>{marker.content.values[52]}</td><td>{marker.content.values[54]}</td>
                </tr>
                <tr><td>{marker.content.values[20]}</td><td>{marker.content.values[22]}</td><td>{marker.content.values[33]}</td><td>{marker.content.values[38]}</td><td>{marker.content.values[46]}</td><td>{marker.content.values[51]}</td><td>{marker.content.values[55]}</td><td>{marker.content.values[60]}</td>
                </tr>
                <tr><td>{marker.content.values[21]}</td><td>{marker.content.values[34]}</td><td>{marker.content.values[37]}</td><td>{marker.content.values[47]}</td><td>{marker.content.values[50]}</td><td>{marker.content.values[56]}</td><td>{marker.content.values[59]}</td><td>{marker.content.values[61]}</td>
                </tr>
                <tr><td>{marker.content.values[35]}</td><td>{marker.content.values[36]}</td><td>{marker.content.values[48]}</td><td>{marker.content.values[49]}</td><td>{marker.content.values[57]}</td><td>{marker.content.values[58]}</td><td>{marker.content.values[62]}</td><td>{marker.content.values[63]}</td>
                </tr>
            </table>
        </>
    );
}

export function renderSOF0(marker: Marker<SOF0>): JSX.Element {
    if(marker.content === undefined || !(marker.content instanceof SOF0))
        return <></>

    return(
        <>
            Precision: {marker.content.precision}<br/>
            Size: {marker.content.width} x {marker.content.height} px<br/>
            Components: {marker.content.componentSize}<br/>
            <table>
                <tr>
                    <td>Id</td>
                    <td>sampling</td>
                    <td>DQT</td>
                </tr>
                {marker.content.components.map(component => 
                    <tr>
                        <td>{component.identifier}</td>
                        <td>{component.samplingFactors}</td>
                        <td>{component.dqt}</td>
                    </tr>
                )}
            </table>

        </>
    );
}

export function renderDHT(marker: Marker<DHT>): JSX.Element {
    if(marker.content === undefined || !(marker.content instanceof DHT))
        return <></>

    const tree = renderBinaryNode(marker.content.tree);

    return(
        <>
            Id: {marker.content.identifier}<br/>
            Type: {marker.content.alternating ? "AC" : "DC"}<br/>
            Sizes: {marker.content.symbolSizes.join(", ")}<br/>
            Symbols: {marker.content.symbols.join(", ")}<br/>
            <br/>
            <div className="dht-tree">
                <Tree
                    draggable={true}
                    collapsible={false}
                    hasInteractiveNodes={false}
                    pathFunc={"straight"}
                    orientation="vertical"
                    data={[tree]}
                    nodeSize={{x: 60, y: 60}}
                    translate={{x: 250, y: 30}}
                    zoomable={false}
                    separation={{siblings: 1, nonSiblings: 1}}
                    renderCustomNodeElement={(props: CustomNodeElementProps) =>
                        <>
                            <circle r={15} />
                            <text className="rd3t-label__title" text-anchor="middle" y="35">{props.nodeDatum.name}</text>
                        </>
                    }
                />
            </div>
        </>
    );
}

export function renderBinaryNode(node: BinaryNode<number> | BinaryNode<RunLengthPair>): RawNodeDatum {
    const children: RawNodeDatum[] = [];
    
    if(node.left !== undefined)
        children.push(renderBinaryNode(node.left));
    
    if(node.right !== undefined)
        children.push(renderBinaryNode(node.right));

    return {
        name: node.value === undefined ? "" : (node.value instanceof RunLengthPair ? `[${node.value.skips}, ${node.value.size}]` : "" + node.value),
        children: node.value === undefined ? children : []
    };
}