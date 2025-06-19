import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, FeatureGroup, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { LatLngExpression, LatLngTuple } from 'leaflet';

type MapData = {
    employeeName: string,
    employeeImage: string,
    employeeColor: string,
    employeeParent: string,
    provinceName: string,
    cityName: string,
    districtID: number,
    districtCode: string,
    districtName: string,
    villageName: string,
    details: {
        productName: string,
        competitorName: string,
        retailName: string,
        retailAddress: string
    }[]
}

type DistrictPolygon = {
    coords: LatLngTuple[],
    color: string,
    pointLocation: LatLngTuple,
    name: string,
    employeeImage: string,
    employeeParent: string,
    province: string,
    city: string,
    district: string,
    village: string,
    details: {
        productName: string,
        competitorName: string,
        retailName: string,
        retailAddress: string
    }[]
};

const Point = (color: string) => new L.DivIcon({
    className: '',
    html: `
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-geo-alt-fill" viewBox="0 0 16 16">
                <path fill=${color} d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/>
            </svg>
    `,
    iconSize: [32, 32],
    iconAnchor: [8, 16],
})

const Map: React.FC = () => {
    const [salesCoverageAreas, setsalesCoverageAreas] = useState<MapData[]>([])
    const [disctrictData, setDisctrictData] = useState<DistrictPolygon[]>([]);
    const [selectedMarker, setSelectedMarker] = useState<DistrictPolygon | null>(null);
    const [isOpen, setIsOpen] = useState(false)
    const [isDark, setIsDark] = useState(
        document.documentElement.getAttribute('data-bs-theme') === 'dark'
    );

    const center: LatLngExpression = [-0.789275, 113.921327];

    const fetchSalesCoverageArea = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/map/', { method: 'GET' })
            const data = await res.json()

            const d = data.data.map((item: MapData) => ({
                districtCode: item.districtCode,
                employeeColor: item.employeeColor,
                employeeName: item.employeeName,
                employeeImage: item.employeeImage,
                employeeParent: item.employeeParent,
                provinceName: item.provinceName,
                cityName: item.cityName,
                districtName: item.districtName,
                villageName: item.villageName ? item.villageName : '',
                details: item.details ?? []
            }))

            // console.log(d);

            setsalesCoverageAreas(d)
        } catch (error: any) {
            console.log(error);
        }
    }

    // Mengecek apakah titik ada di dalam polygon (menggunakan ray-casting)
    const isPointInPolygon = (point: LatLngTuple, vs: LatLngTuple[]): boolean => {
        const x = point[1], y = point[0];

        let inside = false;
        for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            const xi = vs[i][1], yi = vs[i][0];
            const xj = vs[j][1], yj = vs[j][0];

            const intersect = ((yi > y) !== (yj > y)) &&
                (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }

        return inside;
    };

    const getRandomPointInPolygon = (coords: LatLngTuple[]): LatLngTuple => {
        // Cari bounding box
        const lats = coords.map(c => c[0]);
        const lngs = coords.map(c => c[1]);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);

        // Coba generate sampai ketemu point yang ada di dalam
        for (let i = 0; i < 1000; i++) {
            const randLat = minLat + Math.random() * (maxLat - minLat);
            const randLng = minLng + Math.random() * (maxLng - minLng);
            const point: LatLngTuple = [randLat, randLng];

            if (isPointInPolygon(point, coords)) return point;
        }

        // Fallback: pakai centroid
        const fallback: LatLngTuple = [
            lats.reduce((a, b) => a + b, 0) / lats.length,
            lngs.reduce((a, b) => a + b, 0) / lngs.length
        ];
        return fallback;
    };

    const fetchDistrict = async () => {
        try {
            const districtPolygons: DistrictPolygon[] = [];

            for (const area of salesCoverageAreas) {
                const fileName = `${area.districtCode}.geojson`;
                const res = await fetch(`/geojson/${fileName}`);
                const geojson = await res.json();

                let latLngCoords: LatLngTuple[] = [];

                if (geojson.geometry.type === 'Polygon') {
                    latLngCoords = geojson.geometry.coordinates[0].map(
                        (coord: number[]) => [coord[1], coord[0]] as LatLngTuple
                    );
                } else if (geojson.geometry.type === 'MultiPolygon') {
                    // Ambil semua ring luar dari setiap polygon
                    latLngCoords = geojson.geometry.coordinates
                        .flat(2)
                        .map((coord: number[]) => [coord[1], coord[0]] as LatLngTuple);
                } else {
                    console.warn(`Unsupported geometry type: ${geojson.geometry.type}`);
                }


                districtPolygons.push({
                    coords: latLngCoords,
                    color: area.employeeColor,
                    pointLocation: getRandomPointInPolygon(latLngCoords),
                    name: area.employeeName,
                    employeeImage: area.employeeImage,
                    employeeParent: area.employeeParent,
                    province: area.provinceName,
                    city: area.cityName,
                    district: area.districtName,
                    village: area.villageName ? area.villageName : '',
                    details: area.details,
                });
            }
            // console.log(districtPolygons);
            setDisctrictData(districtPolygons);
        } catch (error: any) {
            console.error("Failed to fetch district data", error);
        }
    };

    function groupDetails(details: MapData['details']): {
        retailName: string,
        retailAddress: string,
        products: string[],
        competitors: string[]
    }[] {
        const grouped: Record<string, {
            retailName: string,
            retailAddress: string,
            products: Set<string>,
            competitors: Set<string>
        }> = {};

        for (const item of details) {
            if (!item.retailName || !item.retailAddress) continue;

            const key = `${item.retailName}||${item.retailAddress}`;
            if (!grouped[key]) {
                grouped[key] = {
                    retailName: item.retailName,
                    retailAddress: item.retailAddress,
                    products: new Set(),
                    competitors: new Set()
                };
            }

            if (item.productName) grouped[key].products.add(item.productName);
            if (item.competitorName) grouped[key].competitors.add(item.competitorName);
        }

        return Object.values(grouped).map(g => ({
            retailName: g.retailName,
            retailAddress: g.retailAddress,
            products: Array.from(g.products),
            competitors: Array.from(g.competitors)
        }));
    }

    function getUniqueProducts(details: MapData['details']): string[] {
        return Array.from(
            new Set(
                details
                    .map(d => d.productName)
                    .filter(p => p && p.trim() !== '')
            )
        );
    }

    function getUniqueCompetitors(details: MapData['details']): string[] {
        return Array.from(
            new Set(
                details
                    .map(d => d.competitorName)
                    .filter(c => c && c.trim() !== '')
            )
        );
    }

    function getUniqueRetails(details: MapData['details']): string[] {
        return Array.from(
            new Set(
                details
                    .map(d => d.retailName)
                    .filter(p => p && p.trim() !== '')
            )
        );
    }

    useEffect(() => {
        const fetchAll = async () => {
            await fetchSalesCoverageArea();
        };

        fetchAll();
    }, []);

    useEffect(() => {
        if (salesCoverageAreas.length > 0) {
            fetchDistrict();
        }
    }, [salesCoverageAreas]);

    useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (
                    mutation.type === 'attributes' &&
                    mutation.attributeName === 'data-bs-theme'
                ) {
                    const theme = document.documentElement.getAttribute('data-bs-theme');
                    setIsDark(theme === 'dark');
                }
            }
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-bs-theme'],
        });

        return () => observer.disconnect();
    }, []);

    return (
        <div className='d-flex w-100 mb-4'>
            <div style={{ width: selectedMarker && isOpen ? '70%' : '100%', transition: 'width 0.3s ease' }}>
                <MapContainer
                    center={center}
                    zoom={4}
                    style={{ height: '500px', width: '100%' }} // <- width 100% karena dibungkus flex container
                >
                    <TileLayer
                        attribution='&copy; OpenStreetMap contributors'
                        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    />
                    <FeatureGroup>
                        {disctrictData.map((district, idx) => (
                            <React.Fragment key={idx}>
                                <Polygon key={idx} positions={district.coords} pathOptions={{ color: 'blue', fillOpacity: 0.3 }} />
                                <Marker position={district.pointLocation} icon={Point(district.color)}
                                    eventHandlers={{
                                        click: () => {
                                            setSelectedMarker(district)
                                            setIsOpen(true)
                                        }
                                    }} />
                            </React.Fragment>
                        ))}
                    </FeatureGroup>
                </MapContainer>
            </div>
            {selectedMarker && isOpen && (
                <div
                    style={{
                        width: '30%',
                        height: '500px',
                        padding: '1rem',
                        backgroundColor: isDark ? '#1e1e2d' : '#f9f9f9',
                        overflowY: 'scroll',
                        transition: 'opacity 0.3s ease',
                    }}
                >
                    <a className='px-1 float-end' style={{ cursor: 'pointer' }} onClick={() => setIsOpen(false)}>
                        <i className="bi bi-x-circle text-danger"></i>
                    </a>
                    <br />
                    <div className="d-flex justify-content-center">
                        <img
                            src={selectedMarker.employeeImage}
                            alt="Sales"
                            style={{ width: 100, borderRadius: '50%' }}
                        />
                    </div>
                    <h4 className='text-center'>{selectedMarker.name}</h4>
                    <p>
                        <strong>Kepala Sales:</strong> {selectedMarker.employeeParent}
                        <br />
                        <strong>Wilayah:</strong>
                        <br />
                        {selectedMarker.province}, {selectedMarker.city}, {selectedMarker.district}
                        {selectedMarker.village && `, ${selectedMarker.village}`}
                    </p>
                    <hr />
                    <h5>Products</h5>
                    {getUniqueProducts(selectedMarker.details).length === 0 ? (
                        <p>No product available</p>
                    ) : (
                        <p>{getUniqueProducts(selectedMarker.details).join(', ')}</p>
                    )
                    }

                    <hr />
                    <h5>Competitors</h5>
                    {getUniqueCompetitors(selectedMarker.details).length === 0 ? (
                        <p>No competitor available</p>
                    ) : (
                        <p>{getUniqueCompetitors(selectedMarker.details).join(', ')}</p>
                    )
                    }
                    <hr />
                    <h5>Retails</h5>
                    {getUniqueRetails(selectedMarker.details).length === 0 ? (
                        <p>No retail available</p>
                    ) : (
                        <p>{getUniqueRetails(selectedMarker.details).join(', ')}</p>
                    )}
                </div >
            )}
        </div >
    );
};

export default Map;
