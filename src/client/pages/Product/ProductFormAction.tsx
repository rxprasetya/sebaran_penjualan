import { useEffect, useRef, useState } from "react"
import { Link, useLocation, useNavigate, useParams } from "react-router-dom"
import ImageCropper from "../../components/ImageCropper";

const ProductFormAction = () => {
    const cropperRef = useRef<{ crop: () => void }>(null);
    const [key, setKey] = useState(Math.random());
    const [errorMessage, setErrorMessage] = useState<{ [key: string]: string }>({});

    const [showCropper, setShowCropper] = useState<boolean>(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [productCode, setProductCode] = useState('')
    const [productName, setProductName] = useState('')
    const [productImage, setProductImage] = useState<File | null>(null);

    const [isUpdate, setIsUpdate] = useState(false)
    const nav = useNavigate()
    const { id } = useParams()
    const location = useLocation()
    const preview = `/product/preview/${id}`

    const onReset = () => {
        setProductCode('')
        setProductName('')
        setProductImage(null)
    }

    useEffect(() => {
        init()
    }, [])

    const init = async () => {
        if (id) {
            const res = await fetch('http://localhost:3000/api/products/search/' + id, { method: 'GET' });
            const data = await res.json();
            setIsUpdate(true);
            setProductCode(data.data[0].productCode);
            setProductName(data.data[0].productName);
            setProductImage(data.data[0].productImage);
        }
    }

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('productCode', productCode);
            formData.append('productName', productName);
            if (productImage) {
                formData.append('productImage', productImage);
            }

            const res = await fetch(isUpdate
                ? 'http://localhost:3000/api/products/update/' + id
                : 'http://localhost:3000/api/products/create', {
                method: isUpdate ? 'PATCH' : 'POST',
                body: formData,
            });

            const data = await res.json();

            if (location.pathname !== preview) {
                if (res.ok) {
                    localStorage.setItem('successMessage', `Data has been ${isUpdate ? 'updated' : 'added'} successfully!`);
                    nav('/product')
                } else {
                    if (res.status === 409) {
                        alert(data.message)
                    }
                    if (res.status === 422) {
                        const errorObj: { [key: string]: string } = {};
                        data.errors.forEach((err: any) => {
                            errorObj[err.path] = err.msg;
                        });
                        setErrorMessage(errorObj);
                    }
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
                        <h3>{isUpdate && location.pathname === preview ? 'Preview Product Data' : (isUpdate ? 'Update Product Data' : 'Create Product Data')}</h3>
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
                                    <Link to="/product">Datatable Product</Link>
                                </li>
                                <li className="breadcrumb-item active" aria-current="page">{isUpdate && location.pathname === preview ? 'Preview Product Data' : (isUpdate ? 'Update Product Data' : 'Create Product Data')}</li>
                            </ol>
                        </nav>
                    </div>
                </div>
            </div>
            <section className="section">
                <div className="card">
                    <div className="card-content">
                        <div className="card-body">
                            {location.pathname === preview && isUpdate &&
                                <>
                                    <button className="btn btn-dark me-1" onClick={() => nav(`/product/${id}/distribution-area`)}>Distribution Areas</button>
                                    <button className="btn btn-dark me-1" onClick={() => nav(`/product/${id}/competitor`)}>Competitors</button>
                                </>
                            }
                            <form className="form form-vertical mt-2" onSubmit={location.pathname === preview && isUpdate ? undefined : onSubmit} >
                                <div className="form-body">
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="form-group">
                                                <label htmlFor="productCode">Product Code <span className="text-danger">*</span></label>
                                                <input type="text" id="productCode" className="form-control"
                                                    value={productCode} onChange={(e) => {
                                                        setProductCode(e.target.value)
                                                        setErrorMessage(prev => ({ ...prev, productCode: '' }))
                                                    }} placeholder="cth: SMPRN" disabled={location.pathname === preview} />
                                                {errorMessage['productCode'] && (
                                                    <span className="text-danger">{errorMessage['productCode']}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="form-group">
                                                <label htmlFor="productName">Product Name <span className="text-danger">*</span></label>
                                                <input type="text" id="productName" className="form-control"
                                                    value={productName} onChange={(e) => {
                                                        setProductName(e.target.value)
                                                        setErrorMessage(prev => ({ ...prev, productName: '' }))
                                                    }} placeholder="cth: Sampoerna" disabled={location.pathname === preview} />
                                                {errorMessage['productName'] && (
                                                    <span className="text-danger">{errorMessage['productName']}</span>
                                                )}
                                            </div>
                                        </div>
                                        {location.pathname !== preview && (
                                            <>
                                                <div className="col-12">
                                                    <div className="form-group">
                                                        <label htmlFor="productImage">Image</label>
                                                        <input type="file" id="productImage" className="form-control"
                                                            accept="image/png, image/jpeg, image/jpg, image/webp"
                                                            key={key}
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    setSelectedFile(file);
                                                                    setShowCropper(true);
                                                                }
                                                            }} />
                                                    </div>
                                                </div>
                                                <div className={`col-12`}>
                                                    <div className="d-flex justify-content-end">
                                                        <button type="submit" className="btn btn-primary me-1">Submit</button>
                                                        <button type="reset"
                                                            className="btn btn-light-secondary me-1" onClick={onReset}>Reset</button>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        {location.pathname === preview && (
                                            <div className="col-12">
                                                <div className="form-group">
                                                    <div className="d-flex flex-column">
                                                        <label htmlFor="productImage">Image</label>
                                                        <img
                                                            className="w-25"
                                                            src={productImage ? typeof productImage === 'string' ? productImage : 'Product Image' : 'Product Image'}
                                                            alt="Product Image"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </form>
                            {selectedFile && (
                                <div className={`modal fade text-left ${showCropper ? 'show d-block' : ''}`} aria-labelledby="myModalLabel1" aria-modal="true" tabIndex={-1} role="dialog">
                                    <div className="modal-dialog modal-dialog-scrollable" role="document">
                                        <div className="modal-content">
                                            <div className="modal-header">
                                                <h5 className="modal-title" id="myModalLabel1">Basic Modal</h5>
                                                <button type="button" className="btn-close" onClick={() => {
                                                    setShowCropper(false);
                                                    setSelectedFile(null);
                                                }} />
                                            </div>
                                            <div className="modal-body">
                                                <ImageCropper
                                                    ref={cropperRef}
                                                    file={selectedFile}
                                                    onCropComplete={(croppedFile) => {
                                                        setProductImage(croppedFile);
                                                        setShowCropper(false);
                                                        setSelectedFile(null);
                                                    }}
                                                />
                                            </div>
                                            <div className="modal-footer">
                                                <button type="button" className="btn btn-secondary" onClick={() => {
                                                    setShowCropper(false);
                                                    setSelectedFile(null);
                                                    setKey(Math.random());
                                                }}>
                                                    Cancel
                                                </button>
                                                <button type="button" className="btn btn-primary" onClick={() => {
                                                    cropperRef.current?.crop();
                                                }}>
                                                    Crop
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section >
        </div >
    )
}

export default ProductFormAction