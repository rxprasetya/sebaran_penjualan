import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import AsyncSelect from 'react-select/async'


const RetailActionForm = () => {

    const { id } = useParams()
    const nav = useNavigate()

    const [errorMessage, setErrorMessage] = useState<string>('');

    const [isDarkMode, setIsDarkMode] = useState<boolean | null>(null);
    const [defaultCityOptions, setDefaultCityOptions] = useState([]);
    const [defaultDistrictOptions, setDefaultDistrictOptions] = useState([]);
    const [defaultVillageOptions, setDefaultVillageOptions] = useState([]);

    const [retailName, setRetailName] = useState('')
    const [adrress, setAdrress] = useState('')
    const [provinceID, setProvinceID] = useState<{ value: number; label: string } | null>(null);
    const [cityID, setCityID] = useState<{ value: number; label: string } | null>(null);
    const [districtID, setDistrictID] = useState<{ value: number; label: string } | null>(null);
    const [villageID, setVillageID] = useState<{ value: number; label: string } | null>(null);

    const [isUpdate, setIsUpdate] = useState<boolean>(false)

    const onReset = () => {
        setRetailName('')
        setProvinceID(null)
        setCityID(null)
        setDistrictID(null)
        setVillageID(null)
        setAdrress('')
    }

    useEffect(() => {
        init()
    }, [])

    useEffect(() => {
        const detectTheme = () => {
            const currentTheme = document.documentElement.getAttribute('data-bs-theme');
            setIsDarkMode(currentTheme === 'dark');
        };

        detectTheme();

        const observer = new MutationObserver(detectTheme);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-bs-theme'],
        });

        return () => observer.disconnect();
    }, []);


    const init = async () => {
        if (id) {
            const res = await fetch('http://localhost:3000/api/retails/search/' + id, { method: 'GET' });
            const result = await res.json();
            // console.log(result);
            const data = result.data[0];
            setIsUpdate(true);
            setRetailName(data.retailName);
            setProvinceID({ value: data.provinceID, label: data.provinceName }); // Make sure provinceName is returned in the API
            setCityID({ value: data.cityID, label: data.cityName });             // Same here
            setDistrictID({ value: data.districtID, label: data.districtName });
            setVillageID({ value: data.villageID, label: data.villageName });
            setAdrress(data.address);
        }
    }

    const fetchProvinceOptions = async (inputValue: string) => {

        const url = inputValue
            ? `http://localhost:3000/api/provinces?search=${inputValue}`
            : `http://localhost:3000/api/provinces`;

        const res = await fetch(url);
        const data = await res.json();

        // console.log(data);

        return data.data.map((item: any) => ({
            value: item.id,
            label: item.provinceName,
        }));
    };


    const fetchCityOptions = async (inputValue: string) => {
        if (!provinceID) return [];

        const url = inputValue
            ? `http://localhost:3000/api/cities?provinceID=${provinceID.value}&search=${inputValue}`
            : `http://localhost:3000/api/cities?provinceID=${provinceID.value}`;

        // console.log("Fetching cities from:", url);

        const res = await fetch(url);
        const data = await res.json();

        return data.data.map((item: any) => ({
            value: item.id,
            label: item.cityName,
        }));
    };


    const fetchDistrictOptions = async (inputValue: string) => {
        if (!provinceID && !cityID) return [];

        const url = inputValue
            ? `http://localhost:3000/api/districts?provinceID=${provinceID?.value}&cityID=${cityID?.value}&search=${inputValue}`
            : `http://localhost:3000/api/districts?provinceID=${provinceID?.value}&cityID=${cityID?.value}`;

        // console.log("Fetching cities from:", url);

        const res = await fetch(url);
        const data = await res.json();

        // console.log(data.data);


        return data.data.map((item: any) => ({
            value: item.id,
            label: item.districtName,
        }));
    };

    const fetchVillageOptions = async (inputValue: string) => {
        if (!provinceID && !cityID && districtID) return [];

        const url = inputValue
            ? `http://localhost:3000/api/villages?provinceID=${provinceID?.value}&cityID=${cityID?.value}&districtID=${districtID?.value}&search=${inputValue}`
            : `http://localhost:3000/api/villages?provinceID=${provinceID?.value}&cityID=${cityID?.value}&districtID=${districtID?.value}`;

        const res = await fetch(url);
        const data = await res.json();

        // Log the response to see what is returned
        // console.log('Fetched village data:', data);

        // Ensure the response contains data
        return data.data.map((item: any) => ({
            value: item.id.toString(),  // Make sure to handle BigInt if needed
            label: item.villageName,
        }));
    };


    useEffect(() => {
        const loadDefaultCities = async () => {
            if (provinceID?.value) {
                const options = await fetchCityOptions('');
                setDefaultCityOptions(options);
            } else {
                setDefaultCityOptions([]);
            }
        };
        loadDefaultCities();
    }, [provinceID]);

    useEffect(() => {
        const loadDefaultDistricts = async () => {
            if (provinceID?.value && cityID?.value) {
                const options = await fetchDistrictOptions('');
                setDefaultDistrictOptions(options);
            } else {
                setDefaultDistrictOptions([]);
            }
        };
        loadDefaultDistricts();
    }, [cityID]);

    useEffect(() => {
        const loadDefaultVillages = async () => {
            if (provinceID?.value && cityID?.value && districtID?.value) {
                const options = await fetchVillageOptions('');
                setDefaultVillageOptions(options);
            } else {
                setDefaultVillageOptions([]);
            }
        };
        loadDefaultVillages();
    }, [districtID]);


    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage('');
        // Validate fields to ensure they are valid numbers
        try {
            const formData = new FormData();
            formData.append('retailName', retailName || '');
            formData.append('provinceID', provinceID?.value.toString() || '');
            formData.append('cityID', cityID?.value.toString() || '');
            formData.append('districtID', districtID?.value.toString() || '');
            if (villageID) {
                formData.append('villageID', villageID.value.toString());
            }
            formData.append('address', adrress || '');

            // console.log(villageID);

            const res = await fetch(isUpdate
                ? 'http://localhost:3000/api/retails/update/' + id
                : 'http://localhost:3000/api/retails/create', {
                method: isUpdate ? 'PATCH' : 'POST',
                body: formData,
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('successMessage', `Data has been ${isUpdate ? 'updated' : 'added'} successfully!`);
                nav('/retail');
            } else {
                if (res.status === 409) {
                    alert(data.message)
                }
                if (res.status == 422) {
                    setErrorMessage(data.message);
                }
            }
        } catch (error: any) {
            console.log(error);
        }
    }

    return (
        <div>
            <div className="page-title">
                <div className="row">
                    <div className="col-12 col-md-6 order-md-1 order-last">
                        <h3>{isUpdate ? 'Update Retail' : 'Create Retail'}</h3>
                        <p className="text-subtitle text-muted">A sortable, searchable, paginated table without dependencies thanks to
                            simple-datatables.</p>
                    </div>
                    <div className="col-12 col-md-6 order-md-2 order-first">
                        <nav aria-label="breadcrumb" className="breadcrumb-header float-start float-lg-end">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item">
                                    <Link to="/">Dashboard</Link>
                                </li>
                                <li className="breadcrumb-item">
                                    <Link to="/retail">Datatable Retails</Link>
                                </li>
                                <li className="breadcrumb-item active" aria-current="page">{isUpdate ? 'Update Retails' : 'Create Retails'}</li>
                            </ol>
                        </nav>
                    </div>
                </div>
            </div>
            <section className="section">
                <div className="card">
                    <div className="card-content">
                        <div className="card-body">
                            <form className="form form-vertical" onSubmit={onSubmit} >
                                <div className="form-body">
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="form-group">
                                                <label htmlFor="retailName">Retail Name <span className="text-danger">*</span></label>
                                                <input className="form-control" type="text" id="retailName" value={retailName} onChange={(e) => setRetailName(e.target.value)} placeholder="cth: Retail/Toko Basudara" />
                                                {errorMessage && retailName === '' && (
                                                    <span className="text-danger">
                                                        Retail Name must be filled
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="form-group">
                                                <label>Province <span className="text-danger">*</span></label>
                                                <AsyncSelect
                                                    cacheOptions
                                                    defaultOptions
                                                    isClearable
                                                    value={provinceID}
                                                    loadOptions={fetchProvinceOptions}
                                                    onChange={(selected: any) => {
                                                        setProvinceID(selected);
                                                        setCityID(null);
                                                        setDistrictID(null);
                                                        setVillageID(null);
                                                    }}
                                                    placeholder="-- Select Province --"
                                                    noOptionsMessage={() => "No provinces found"}
                                                    theme={(theme) => ({
                                                        ...theme,
                                                        colors: {
                                                            ...theme.colors,
                                                            primary25: isDarkMode ? '#2c3e50' : '#f0f0f0',
                                                            primary: isDarkMode ? '#1abc9c' : '#007bff',
                                                            neutral0: isDarkMode ? '#1e1e2f' : '#fff',
                                                            neutral5: isDarkMode ? '#2c2c3c' : '#f9f9f9',
                                                            neutral10: isDarkMode ? '#1abc9c' : '#007bff',
                                                            neutral80: isDarkMode ? '#ecf0f1' : '#333',
                                                        },
                                                    })}
                                                />
                                                {errorMessage && provinceID === null && (
                                                    <span className="text-danger">
                                                        Province must be filled
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="form-group">
                                                <label>City <span className="text-danger">*</span></label>
                                                <AsyncSelect
                                                    cacheOptions
                                                    isClearable
                                                    defaultOptions={defaultCityOptions}
                                                    loadOptions={fetchCityOptions}
                                                    value={cityID}
                                                    onChange={(selected: any) => {
                                                        setCityID(selected);
                                                        setDistrictID(null);
                                                        setVillageID(null);
                                                    }}
                                                    isDisabled={!provinceID}
                                                    placeholder="-- Select City --"
                                                    theme={(theme) => ({
                                                        ...theme,
                                                        colors: {
                                                            ...theme.colors,
                                                            primary25: isDarkMode ? '#2c3e50' : '#f0f0f0',
                                                            primary: isDarkMode ? '#1abc9c' : '#007bff',
                                                            neutral0: isDarkMode ? '#1e1e2f' : '#fff',
                                                            neutral5: isDarkMode ? '#2c2c3c' : '#f9f9f9',
                                                            neutral10: isDarkMode ? '#1abc9c' : '#007bff',
                                                            neutral80: isDarkMode ? '#ecf0f1' : '#333',
                                                        },
                                                    })}
                                                />
                                                {errorMessage && cityID === null && (
                                                    <span className="text-danger">
                                                        City must be filled
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="form-group">
                                                <label>District <span className="text-danger">*</span></label>
                                                <AsyncSelect
                                                    cacheOptions
                                                    isClearable
                                                    defaultOptions={defaultDistrictOptions}
                                                    value={districtID}
                                                    loadOptions={fetchDistrictOptions}
                                                    onChange={(selected: any) => {
                                                        setDistrictID(selected);
                                                        setVillageID(null);
                                                    }}
                                                    isDisabled={!cityID}
                                                    placeholder="-- Select District --"
                                                    theme={(theme) => ({
                                                        ...theme,
                                                        colors: {
                                                            ...theme.colors,
                                                            primary25: isDarkMode ? '#2c3e50' : '#f0f0f0',
                                                            primary: isDarkMode ? '#1abc9c' : '#007bff',
                                                            neutral0: isDarkMode ? '#1e1e2f' : '#fff',
                                                            neutral5: isDarkMode ? '#2c2c3c' : '#f9f9f9',
                                                            neutral10: isDarkMode ? '#1abc9c' : '#007bff',
                                                            neutral80: isDarkMode ? '#ecf0f1' : '#333',
                                                        },
                                                    })}
                                                />
                                                {errorMessage && districtID === null && (
                                                    <span className="text-danger">
                                                        District must be filled
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="form-group">
                                                <label>Village <span className="text-danger">*</span></label>
                                                <AsyncSelect
                                                    cacheOptions
                                                    isClearable
                                                    defaultOptions={defaultVillageOptions}
                                                    value={villageID}
                                                    loadOptions={fetchVillageOptions}
                                                    onChange={(selected: any) => { setVillageID(selected) }}
                                                    isDisabled={!districtID}
                                                    placeholder="-- Select Village --"
                                                    theme={(theme) => ({
                                                        ...theme,
                                                        colors: {
                                                            ...theme.colors,
                                                            primary25: isDarkMode ? '#2c3e50' : '#f0f0f0',
                                                            primary: isDarkMode ? '#1abc9c' : '#007bff',
                                                            neutral0: isDarkMode ? '#1e1e2f' : '#fff',
                                                            neutral5: isDarkMode ? '#2c2c3c' : '#f9f9f9',
                                                            neutral10: isDarkMode ? '#1abc9c' : '#007bff',
                                                            neutral80: isDarkMode ? '#ecf0f1' : '#333',
                                                        },
                                                    })}
                                                />
                                                {errorMessage && villageID === null && (
                                                    <span className="text-danger">
                                                        Village must be filled
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="form-group">
                                                <label htmlFor="address">Detail Address</label>
                                                <textarea className="form-control" id="address" onChange={(e) => setAdrress(e.target.value)} placeholder="cth: Perum. xxxxx, Blok. xx, No. xx, RT. xx/RW. xx" defaultValue={adrress}></textarea>
                                            </div>
                                        </div>
                                        <div className="col-12 d-flex justify-content-end">
                                            <button type="submit" className="btn btn-primary me-1 mb-1">Submit</button>
                                            <button type="reset"
                                                className="btn btn-light-secondary me-1 mb-1" onClick={onReset}>Reset</button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default RetailActionForm