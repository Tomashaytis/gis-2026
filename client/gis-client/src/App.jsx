import MapComponent from './components/Map/Map.jsx'
import MapControl from './components/MapControl/MapControl.jsx'
import { useState } from 'react';
import config from './config.json';
import './App.css'

function App() {
    const options = [
        { value: 'osm', label: 'OSM' },
        { value: 'overture', label: 'Overture' }
    ];

    const [selectedLayer, setSelectedLayer] = useState(config.defaultLayer);

    const handleChange = (layerName) => {
        console.log('Переключен слой:', layerName);
        setSelectedLayer(layerName);
    };

    return (
        <>
            <h1>Gis Client</h1>
            <MapComponent
                layerName={selectedLayer}
                bbox={config.bbox}
                zoom={config.zoom}
            />
            <MapControl
                options={options}
                defaultValue={config.defaultLayer}
                onChange={handleChange}
            />
        </>
    )
}

export default App