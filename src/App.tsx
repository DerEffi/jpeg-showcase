import React, { useState } from "react";
import { FileUpload } from 'primereact/fileupload';
import JFIF from "./container/jfif";

export default function App() {

    const [image, setImage] = useState(new JFIF());

    const onUpload = async (files: File[]) => {
        
        // Only process when there is an image present
        if(files.length !== 1)
            return;

        // Update the state to display the new information
        const jfif = new JFIF(await files[0].arrayBuffer());
        setImage(jfif);
    }

    return(
        <div id="App">

            <FileUpload
                auto
                chooseLabel="Upload jpeg"
                customUpload
                uploadHandler={(props) => onUpload(props.files)}
                accept="image/jpeg"
                maxFileSize={10000000}
            />

            <table className="marker-table">
                <thead>
                    <tr>
                        <td colSpan={2}>Segment</td>
                        <td>Position</td>
                        <td>Size</td>
                    </tr>
                </thead>
                <tbody>
                    {image.markers.map(marker => 
                        <tr>
                            <td>{marker.hexCode}</td>
                            <td>{marker.segment.shortName}</td>
                            <td>{marker.start}</td>
                            <td>{marker.size}</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}