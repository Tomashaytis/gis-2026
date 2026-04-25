import { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import ImageLayer from 'ol/layer/Image';
import ImageWMS from 'ol/source/ImageWMS';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import Control from 'ol/control/Control';
import { Style, Fill, Stroke } from 'ol/style';
import OSM from 'ol/source/OSM';
import 'ol/ol.css';
import './Map.css'

const MapComponent = ({ layerName, bbox, zoom }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const dataLayerRef = useRef(null);
    const legendControlRef = useRef(null);

    // Создание карты
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
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.setTarget(null);
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Создание слоя
    useEffect(() => {
        if (!mapInstanceRef.current) return;

        // Удаляем старый слой, если есть
        if (dataLayerRef.current) {
            mapInstanceRef.current.removeLayer(dataLayerRef.current);
            dataLayerRef.current = null;
        }

        // Удаляем старую легенду, если есть
        if (legendControlRef.current) {
            mapInstanceRef.current.removeControl(legendControlRef.current);
            legendControlRef.current = null;
        }

        // Создаём слой 
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
                
                // Добавляем легенду
                const legendElement = document.createElement('div');
                legendElement.className = 'ol-unselectable ol-control';
                legendElement.style.position = 'absolute';
                legendElement.style.top = '20px';
                legendElement.style.right = '20px';
                legendElement.style.background = 'white';
                legendElement.style.padding = '8px 12px';
                legendElement.style.borderRadius = '4px';
                legendElement.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
                legendElement.style.fontSize = '12px';
                legendElement.style.fontFamily = 'Arial';
                legendElement.style.textAlign = 'left';
                legendElement.innerHTML = `
                    <b style="display:block;margin-bottom:6px">Типы данных:</b>
                    <div><span style="display:inline-block;width:16px;height:16px;background:rgba(76,175,80,0.7);margin-right:8px;border:1px solid #0b0b0b"></span> Мои данные</div>
                    <div><span style="display:inline-block;width:16px;height:16px;background:rgba(33,150,243,0.7);margin-right:8px;border:1px solid #0b0b0b"></span> OSM</div>
                    <div><span style="display:inline-block;width:16px;height:16px;background:rgba(255,152,0,0.7);margin-right:8px;border:1px solid #0b0b0b"></span> ML</div>
                    <div><span style="display:inline-block;width:16px;height:16px;background:rgba(100,100,100,0.7);margin-right:8px;border:1px solid #0b0b0b"></span> Другие</div>
                `;
                
                legendControlRef.current = new Control({ element: legendElement });
                mapInstanceRef.current.addControl(legendControlRef.current);
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
            dataLayerRef.current = dataLayer;
            mapInstanceRef.current.addLayer(dataLayer);
            console.log('Добавлен слой:', layerName);
        }
    }, [layerName]);

    return (
        <div
            ref={mapRef}
            className='map-view'
        />
    );
};

export default MapComponent;