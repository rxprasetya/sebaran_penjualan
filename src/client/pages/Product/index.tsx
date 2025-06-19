import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import { DataTable } from 'simple-datatables';
import "simple-datatables/dist/style.css";
import Swal from 'sweetalert2';

const Product = () => {

    const [products, setProducts] = useState([])

    const fetchProduct = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/products/', { method: 'GET' })
            const data = await res.json()
            setProducts(data.data)
            // console.log(data.data);
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
            text: "This data is linked to other important records. Deleting it may affect related information. Are you sure you want to proceed?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Confirm",
            cancelButtonText: "Cancel",
        });

        if (result.isConfirmed) {
            const result2 = await swalWithBootstrapButtons.fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
                icon: "error",
                showCancelButton: true,
                confirmButtonText: "Delete it",
                cancelButtonText: "Cancel",
            })
            if (result2.isConfirmed) {
                try {
                    const res = await fetch('http://localhost:3000/api/products/delete/' + id, { method: 'DELETE' })

                    if (res.ok) {
                        fetchProduct()
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
        fetchProduct()
    }, [])

    useEffect(() => {
        if (products.length > 0) {
            const tableElement = document.querySelector("#table1") as HTMLTableElement | null;
            if (tableElement) {
                new DataTable(tableElement);
            }
        }
    }, [products]);

    return (
        <div className="page-heading">
            <div className="page-title">
                <div className="row">
                    <div className="col-12 col-md-6 order-md-1 order-last">
                        <h3>Products DataTable</h3>
                        <p className="text-subtitle text-muted">A sortable, searchable, paginated table without
                            dependencies thanks to simple-datatables.</p>
                        <Link to={'/product/create'} className="btn btn-primary mb-2">Create</Link>
                    </div>
                    <div className="col-12 col-md-6 order-md-2 order-first">
                        <nav aria-label="breadcrumb" className="breadcrumb-header float-start float-lg-end">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to={'/'}>Dashboard</Link></li>
                                <li className="breadcrumb-item active" aria-current="page">Products DataTable</li>
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
                                    <th>Code</th>
                                    <th>Name</th>
                                    {/* <th>Competitor</th>
                                    <th>Village</th> */}
                                    {/* <th>Image</th> */}
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    products.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="text-center">No records found.</td>
                                        </tr>
                                    ) : (
                                        products.map((item: any, idx: number) => (
                                            <tr key={idx}>
                                                <td>{idx + 1}</td>
                                                <td>{item.productCode}</td>
                                                <td>{item.productName}</td>
                                                <td className='w-25'>
                                                    <div className="flex">
                                                        <Link className='badge bg-primary me-2' to={`/product/preview/${item.id}`}>
                                                            <i className="bi bi-eye"></i>
                                                        </Link>
                                                        <Link className='badge bg-success me-2' to={`/product/update/${item.id}`}>
                                                            <i className="bi bi-pencil-square"></i>
                                                        </Link>
                                                        <Link className='badge bg-danger' to={`#`} onClick={() => onDelete(item.id)}>
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

export default Product