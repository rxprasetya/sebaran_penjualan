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
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Confirm",
            cancelButtonText: "Cancel",
        });

        if (result.isConfirmed) {
            try {
                const res = await fetch('http://localhost:3000/api/products/delete/' + id, { method: 'DELETE' })
                const data = await res.json()
                window.location.reload()
            } catch (error: any) {
                console.log(error)
            }
        }
    }

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
                                    <th>Competitor</th>
                                    <th>Village</th>
                                    {/* <th>Image</th> */}
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((item: any, idx: number) => (
                                    <tr key={idx}>
                                        <td>{idx + 1}</td>
                                        <td>{item.productCode}</td>
                                        <td>{item.productName}</td>
                                        <td>{item.competitorName}</td>
                                        <td>{item.villageName}</td>
                                        {/* <td>
                                            {item.productImage !== null &&
                                                <img className='w-10' src={item.competitorImage} alt={item.productName} />
                                            }
                                        </td> */}
                                        <td className='w-25'>
                                            <div className="flex">
                                                <Link className='badge bg-success me-2' to={`/product/update/${item.id}`}>Update</Link>
                                                <Link className='badge bg-danger' to={`#`} onClick={() => onDelete(item.id)}>Delete</Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Product