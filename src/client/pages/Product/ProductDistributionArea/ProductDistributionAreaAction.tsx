import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom';
import AsyncSelect from 'react-select/async';

function ProductDistributionAreaAction() {
  const { productID } = useParams()
  const { id } = useParams()
  const nav = useNavigate()

  const [isUpdate, setIsUpdate] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [defaultCityOptions, setDefaultCityOptions] = useState([]);
  const [defaultDistrictOptions, setDefaultDistrictOptions] = useState([]);
  const [defaultVillageOptions, setDefaultVillageOptions] = useState([]);

  const [provinceID, setProvinceID] = useState<{ value: number; label: string } | null>(null);
  const [cityID, setCityID] = useState<{ value: number; label: string } | null>(null);
  const [districtID, setDistrictID] = useState<{ value: number; label: string } | null>(null);
  const [villageID, setVillageID] = useState<{ value: number; label: string } | null>(null);

  const onReset = () => {
    setProvinceID(null)
    setCityID(null)
    setDistrictID(null)
    setVillageID(null)
  }

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

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    if (id) {
      const res = await fetch(`http://localhost:3000/api/products/${productID}/productdistributionareas/search/` + id, { method: 'GET' });
      const data = await res.json();
      setIsUpdate(true);
      setProvinceID({ value: data.data[0].provinceID, label: data.data[0].provinceName });
      setCityID({ value: data.data[0].cityID, label: data.data[0].cityName });
      setDistrictID({ value: data.data[0].districtID, label: data.data[0].districtName });
      setVillageID({ value: data.data[0].villageID, label: data.data[0].villageName });
      // console.log(data.data)
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

    // console.log('Fetched village data:', data);

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
    try {
      const formData = new FormData();
      formData.append('provinceID', provinceID?.value.toString() || '');
      formData.append('cityID', cityID?.value.toString() || '');
      formData.append('districtID', districtID?.value.toString() || '');
      if (villageID) {
        formData.append('villageID', villageID.value.toString());
      }

      const res = await fetch(isUpdate
        ? `http://localhost:3000/api/products/${productID}/productdistributionareas/update/` + id
        : `http://localhost:3000/api/products/${productID}/productdistributionareas/create`, {
        method: isUpdate ? 'PATCH' : 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('successMessage', `Data has been ${isUpdate ? 'updated' : 'added'} successfully!`);
        nav(`/product/${productID}/distribution-area`)
      } else {
        if (res.status == 409) {
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
            <h3>{isUpdate ? 'Update Distribution Area' : 'Create Distribution Area'}</h3>
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
                  <Link to={`/product/${productID}/distribution-area`}>Distribution Areas Datatable</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">{isUpdate ? 'Update Distribution Area' : 'Create Distribution Area'}</li>
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

export default ProductDistributionAreaAction