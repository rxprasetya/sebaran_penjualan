import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import ImageCropper from '../../components/ImageCropper';
import React, { useRef } from 'react';

type Employee = {
    id: number;
    employeeCode: string;
    employeeName: string;
    employeePosition: string;
    employeeImage: string;
    employeeColor: string;
    employeeParentID: number;
};

const EmployeeFormAction = () => {
    const cropperRef = useRef<{ crop: () => void }>(null);
    const [key, setKey] = React.useState(Math.random());

    const [errorMessage, setErrorMessage] = useState<{ [key: string]: string }>({});
    const [employeeCode, setEmployeeCode] = useState<string>('')
    const [employeeName, setEmployeeName] = useState<string>('')
    const [employeePosition, setEmployeePosition] = useState<string>('');

    const [showCropper, setShowCropper] = useState<boolean>(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [employeeImage, setEmployeeImage] = useState<File | string>('');
    const [employeeColor, setEmployeeColor] = useState<string>('');
    const [employeeParentID, setEmployeeParentID] = useState<number | string>('');
    const [isUpdate, setIsUpdate] = useState<boolean>(false)
    const [employeeLeader, setEmployeeLeader] = useState<Employee[]>([])
    const nav = useNavigate()
    const { id } = useParams()

    const onReset = () => {
        setEmployeeCode('')
        setEmployeeName('')
        setEmployeePosition('')
        setEmployeeImage('')
        setEmployeeColor('#000000')
        setEmployeeParentID('')
    }

    useEffect(() => {
        init()
        selectLeader()
    }, [])

    const init = async () => {
        if (id) {
            const res = await fetch('http://localhost:3000/api/employees/search/' + id, { method: 'GET' });
            const data = await res.json();
            setIsUpdate(true);
            setEmployeeCode(data.data[0].employeeCode);
            setEmployeeName(data.data[0].employeeName);
            setEmployeePosition(data.data[0].employeePosition);
            setEmployeeImage(data.data[0].employeeImage);
            setEmployeeColor(data.data[0].employeeColor);
            setEmployeeParentID(data.data[0].employeeParentID);
        }
    }

    const selectLeader = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/employees/leader', { method: 'GET' })
            const data = await res.json()
            setEmployeeLeader(data.data)
        } catch (error: any) {
            console.log(error);

        }
    }

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const formData = new FormData();
            formData.append('employeeCode', employeeCode);
            formData.append('employeeName', employeeName);
            formData.append('employeePosition', employeePosition);
            if (employeeImage) {
                formData.append('employeeImage', employeeImage);
            }
            if (employeeColor) {
                formData.append('employeeColor', employeeColor);
            }
            if (employeeParentID) {
                formData.append('employeeParentID', employeeParentID.toString());
            }

            const res = await fetch(
                isUpdate
                    ? `http://localhost:3000/api/employees/update/${id}`
                    : 'http://localhost:3000/api/employees/create',
                {
                    method: isUpdate ? 'PATCH' : 'POST',
                    body: formData,
                }
            );

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('successMessage', `Data has been ${isUpdate ? 'updated' : 'added'} successfully!`);
                nav('/employee');
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

        } catch (error: any) {
            console.log(error);
        }
    };

    return (
        <div>
            <div className="page-title">
                <div className="row">
                    <div className="col-12 col-md-6 order-md-1 order-last">
                        <h3>{isUpdate ? 'Update Employee Data' : 'Create Employee Data'}</h3>
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
                                    <Link to="/employee">Datatable Employee</Link>
                                </li>
                                <li className="breadcrumb-item active" aria-current="page">{isUpdate ? 'Update Employee Data' : 'Create Employee Data'}</li>
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
                                                <label htmlFor="employeeCode">Code <span className="text-danger">*</span></label>
                                                <input type="text" id="employeeCode" className="form-control"
                                                    value={employeeCode}
                                                    onChange={(e) => {
                                                        setEmployeeCode(e.target.value)
                                                        setErrorMessage(prev => ({ ...prev, employeeCode: '' }))
                                                    }}
                                                    placeholder="cth: KS001" />
                                                {errorMessage['employeeCode'] && (
                                                    <span className="text-danger">{errorMessage['employeeCode']}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="form-group">
                                                <label htmlFor="employeeName">Name <span className="text-danger">*</span></label>
                                                <input type="text" id="employeeName" className="form-control"
                                                    value={employeeName}
                                                    onChange={(e) => {
                                                        setEmployeeName(e.target.value);
                                                        setErrorMessage(prev => ({ ...prev, employeeName: '' }));
                                                    }} placeholder="cth: Rxxx Axxx Pxxx" />
                                                {errorMessage['employeeName'] && (
                                                    <span className="text-danger">{errorMessage['employeeName']}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="form-group">
                                                <label htmlFor="employeePosition">Position <span className="text-danger">*</span></label>
                                                <select id="employeePosition" className="form-control" value={employeePosition}
                                                    onChange={(e) => {
                                                        setEmployeePosition(e.target.value)
                                                        setErrorMessage(prev => ({ ...prev, employeePosition: '' }))
                                                    }}>
                                                    <option value="" hidden>-- Select Position --</option>
                                                    <option value="Manager">Manager</option>
                                                    <option value="Koordinator">Koor KA</option>
                                                    <option value="Admin">Admin</option>
                                                    <option value="Kepala Sales">Kepala Sales</option>
                                                    <option value="Sales">Sales</option>
                                                </select>
                                                {errorMessage['employeePosition'] && (
                                                    <span className="text-danger">{errorMessage['employeePosition']}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="form-group">
                                                <label htmlFor="employeeImage">Image</label>
                                                <input type="file" id="employeeImage" className="form-control"
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
                                        {employeePosition === 'Sales' && (
                                            <div className="col-12">
                                                <div className="form-group">
                                                    <label htmlFor="employeeColor">Color</label>
                                                    <input type="color" id="employeeColor" className="form-control" value={employeeColor || '#000000'} onChange={(e) => setEmployeeColor(e.target.value)} />
                                                </div>
                                            </div>
                                        )}
                                        {employeePosition && employeePosition !== 'Manager' && (
                                            <div className="col-12">
                                                <div className="form-group">
                                                    <label htmlFor="employeeParentID">Leader</label>
                                                    <select
                                                        id="employeeParentID"
                                                        className="form-control"
                                                        value={employeeParentID !== null && employeeParentID !== undefined ? employeeParentID.toString() : ''}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            setEmployeeParentID(val === '' ? '' : parseInt(val, 10));
                                                        }}
                                                    >
                                                        <option value="">-- Select Leader --</option>
                                                        {employeeLeader.map((leader) => (
                                                            <option key={leader.id} value={leader.id}>[ {leader.employeeCode} ] {leader.employeeName} - {leader.employeePosition}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        )}
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
                                                        setEmployeeImage(croppedFile);
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

export default EmployeeFormAction