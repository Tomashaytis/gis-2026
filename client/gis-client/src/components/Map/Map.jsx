import { useEffect, useRef } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import ImageLayer from 'ol/layer/Image';
import ImageWMS from 'ol/source/ImageWMS';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { Style, Fill, Stroke } from 'ol/style';
import OSM from 'ol/source/OSM';
import 'ol/ol.css';
import './Map.css'

const MapComponent = ({ layerName, bbox, zoom }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);

    useEffect(() => {
        if (mapRef.current && !mapInstanceRef.current) {
            const centerLon = (bbox.minX + bbox.maxX) / 2;
            const centerLat = (bbox.minY + bbox.maxY) / 2;
            const center = [centerLon, centerLat];

            mapInstanceRef.current = new Map({
                target: mapRef.current,
                layers: [
                    new TileLayer({
                        source: new OSM()
                    })
                ],
                view: new View({
                    center: center,
                    zoom: zoom,
                    projection: 'EPSG:4326'
                })
            });

            let dataLayer;
            
            switch (layerName) {
                case 'overture':
                    dataLayer = new VectorLayer({
                        source: new VectorSource({
                            url: '/data/overture_map.geojson',
                            format: new GeoJSON()
                        }),
                        style: (feature) => {
                            const sourceType = feature.get('source_type');
                            const colors = {
                                'my': 'rgba(76, 175, 80, 0.7)',
                                'osm': 'rgba(33, 150, 243, 0.7)',
                                'ml': 'rgba(255, 152, 0, 0.7)',
                                'other': 'rgba(100, 100, 100, 0.7)'
                            };
                            return new Style({
                                fill: new Fill({ color: colors[sourceType] || 'rgba(156, 156, 156, 0.7)' }),
                                stroke: new Stroke({ color: '#0b0b0b', width: 1 })
                            });
                        }
                    });
                    break;
                case 'osm':
                    dataLayer = new ImageLayer({
                        source: new ImageWMS({
                            url: 'http://localhost:8080/geoserver/gis/wms',
                            params: {
                                'LAYERS': ['gis:areas', 'gis:buildings', 'gis:roads', 'gis:poi'],
                                'VERSION': '1.1.1',
                                'FORMAT': 'image/png',
                                'TRANSPARENT': true,
                                'SRS': 'EPSG:4326'
                            },
                            ratio: 1,
                            serverType: 'geoserver',
                            crossOrigin: 'anonymous'
                        })
                    });
                    break;
                default:
                    dataLayer = null;
            }

            if (dataLayer) {
                mapInstanceRef.current.addLayer(dataLayer);
                console.log('Карта создана с слоем:', layerName);
            }
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.setTarget(null);
                mapInstanceRef.current = null;
            }
        };
    }, [layerName, bbox, zoom]);

    return (
        <div
            ref={mapRef}
            className='map-view'
        />
    );
};

export default MapComponent;