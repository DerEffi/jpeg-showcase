import { useState } from "react";
import { FileUpload } from 'primereact/fileupload';
import { Accordion, AccordionTab } from 'primereact/accordion';
import JPEG from "./container/jpeg";

export default function App() {

    const [image, setImage] = useState(new JPEG());

    const onUpload = async (files: File[]) => {
        
        // Only process when there is an image present
        if(files.length !== 1)
            return;

        // Update the state to display the new information
        const jfif = new JPEG(await files[0].arrayBuffer());
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

            <Accordion
                activeIndex={-1}
            >
                {image.markers.map(marker => 
                    <AccordionTab key={marker.start} header={`${marker.segment.shortName} - (${marker.hexCode})`}>
                        <h4>{marker.segment.name} ({marker.size} bytes)</h4>

                        {marker.segment.renderer(marker)}
                    </AccordionTab>
                )}
            </Accordion>
        </div>
    );
}