import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ImageCropper from '../../../components/ImageCropper'

function ProductCompetitorAction() {
  const { productID } = useParams()
  const { id } = useParams()
  const nav = useNavigate()
  const [isUpdate, setIsUpdate] = useState(false)

  const cropperRef = useRef<{ crop: () => void }>(null);
  const [key, setKey] = useState(Math.random());
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [showCropper, setShowCropper] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [competitorName, setCompetitorName] = useState('')
  const [competitorImage, setCompetitorImage] = useState<File | null>(null);

  const onReset = () => {
    setCompetitorName('')
    setCompetitorImage(null)
  }

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    if (id) {
      const res = await fetch(`http://localhost:3000/api/products/${productID}/competitors/search/` + id, { method: 'GET' });
      const data = await res.json();
      setIsUpdate(true);
      setCompetitorName(data.data[0].competitorName);
      setCompetitorImage(data.data[0].competitorImage);
      // console.log(data.data)
    }
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      const formData = new FormData();
      formData.append('competitorName', competitorName);
      if (competitorImage) {
        formData.append('competitorImage', competitorImage);
      }

      const res = await fetch(isUpdate
        ? `http://localhost:3000/api/products/${productID}/competitors/update/` + id
        : `http://localhost:3000/api/products/${productID}/competitors/create`, {
        method: isUpdate ? 'PATCH' : 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('successMessage', `Data has been ${isUpdate ? 'updated' : 'added'} successfully!`);
        nav(`/product/${productID}/competitor`)
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
            <h3>{isUpdate ? 'Update Competitors Data' : 'Create Competitors Data'}</h3>
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
                  <Link to={`/product/${productID}/competitor`}>Competitors DataTables</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">{isUpdate ? 'Update Competitors Data' : 'Create Competitors Data'}</li>
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
                        <label htmlFor="competitorName">Competitor Name <span className="text-danger">*</span></label>
                        <input type="text" id="competitorName" className="form-control"
                          value={competitorName} onChange={(e) => setCompetitorName(e.target.value)} placeholder="cth: Ares" />
                        {errorMessage && competitorName === '' && (
                          <span className="text-danger">
                            {errorMessage}
                          </span>
                        )}
                        {errorMessage && competitorName && (
                          <span className="text-danger">
                            {errorMessage}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-group">
                        <label htmlFor="competitorImage">Competitor Image</label>
                        <input type="file" id="competitorImage" className="form-control"
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
                    <div className="col-12 d-flex justify-content-end">
                      <button type="submit" className="btn btn-primary me-1 mb-1">Submit</button>
                      <button type="reset"
                        className="btn btn-light-secondary me-1 mb-1" onClick={onReset}>Reset</button>
                    </div>
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
                            setCompetitorImage(croppedFile);
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
      </section>
    </div>
  )
}

export default ProductCompetitorAction