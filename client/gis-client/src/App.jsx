import MapComponent from './components/Map/Map.jsx'
import config from './config.json';
import './App.css'

function App() {
    return (
        <>
            <h1>Gis Client</h1>
            <MapComponent 
                layerName={config.defaultLayer}
                bbox={config.bbox}
                zoom={config.zoom}
            />
        </>
    )
}

export default App