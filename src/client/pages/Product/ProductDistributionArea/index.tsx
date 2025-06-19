import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { DataTable } from 'simple-datatables'
import Swal from 'sweetalert2'

function ProductDistributionArea() {
    const { productID } = useParams()
    const [productDistributionArea, setProductDistributionArea] = useState([])

    const fetchproductDistributionArea = async (productID: number) => {
        try {
            const res = await fetch(`http://localhost:3000/api/products/${productID}/productdistributionareas/`, { method: 'GET' })
            const data = await res.json()
            setProductDistributionArea(data.data)
            // console.log(data.data)
        } catch (error: any) {
            console.log(error)
        }
    }

    const onDelete = async (id: number) => {
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
                confirmButton: "btn btn-success py-2 px-3 me-3",
                cancelButton: "btn btn-danger py-2 px-3"
            },
            buttonsStyling: false
        });

        const result = await swalWithBootstrapButtons.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Confirm",
            cancelButtonText: "Cancel",
        });

        if (result.isConfirmed) {
            try {
                const res = await fetch(`http://localhost:3000/api/products/${productID}/productdistributionareas/delete/` + id, { method: 'DELETE' })
                if (res.ok) {
                    fetchproductDistributionArea(Number(productID))
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: 'Data has been deleted successfully.',
                        showConfirmButton: true
                    });
                }
            } catch (error: any) {
                console.log(error)
            }
        }
    }

    useEffect(() => {
        const successMessage = localStorage.getItem('successMessage');
        if (successMessage) {
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: successMessage,
                showConfirmButton: true
            });

            localStorage.removeItem('successMessage');
        }
    }, []);

    useEffect(() => {
        fetchproductDistributionArea(Number(productID))
    }, [])

    useEffect(() => {
        if (productDistributionArea.length > 0) {
            const tableElement = document.querySelector("#table1") as HTMLTableElement | null;
            if (tableElement) {
                new DataTable(tableElement);
            }
        }
    }, [productDistributionArea]);

    return (
        <div className="page-heading">
            <div className="page-title">
                <div className="row">
                    <div className="col-12 col-md-6 order-md-1 order-last">
                        <h3>Distribution Areas DataTable</h3>
                        <p className="text-subtitle text-muted">A sortable, searchable, paginated table without
                            dependencies thanks to simple-datatables.</p>
                        <Link to={`/product/${productID}/distribution-area/create`} className="btn btn-primary mb-2">Create</Link>
                    </div>
                    <div className="col-12 col-md-6 order-md-2 order-first">
                        <nav aria-label="breadcrumb" className="breadcrumb-header float-start float-lg-end">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to={'/'}>Dashboard</Link></li>
                                <li className="breadcrumb-item"><Link to={`/product/preview/${productID}`}>Preview Product</Link></li>
                                <li className="breadcrumb-item active" aria-current="page">Distribution Areas DataTable</li>
                            </ol>
                        </nav>
                    </div>
                </div>
            </div>
            <section className="section">
                <div className="card">
                    <div className="card-body">
                        <table className="table table-striped" id="table1">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    {/* <th>Product</th> */}
                                    <th>Province</th>
                                    <th>City</th>
                                    <th>District</th>
                                    <th>Village</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    productDistributionArea.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center">No records found.</td>
                                        </tr>
                                    ) : (
                                        productDistributionArea.map((item: any, idx: number) => (
                                            <tr key={idx}>
                                                <td>{idx + 1}</td>
                                                {/* <td>[{item.productCode}] {item.productName}</td> */}
                                                <td>{item.provinceName}</td>
                                                <td>{item.cityName}</td>
                                                <td>{item.districtName}</td>
                                                <td>{item.villageName}</td>
                                                <td className='w-25'>
                                                    <div className="flex">
                                                        <Link className='badge bg-success me-2' to={`/product/${productID}/distribution-area/update/${item.pdaID}`}>
                                                            <i className="bi bi-pencil-square"></i>
                                                        </Link>
                                                        <Link className='badge bg-danger' to={`#`} onClick={() => onDelete(item.pdaID)}>
                                                            <i className="bi bi-trash"></i>
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default ProductDistributionArea