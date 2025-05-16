import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import { DataTable } from 'simple-datatables';
import "simple-datatables/dist/style.css";
import Swal from 'sweetalert2'


type DataRetail = {
    id: number,
    retailName: string,
    provinceName: string,
    cityName: string,
    districtName: string,
    villageName: string,
}

const Retail = () => {

    const [retails, setRetails] = useState<DataRetail[]>([])

    const fetchRetail = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/retails/', { method: 'GET' })
            const data = await res.json()
            setRetails(data.data)
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
                await fetch(`http://localhost:3000/api/retails/delete/${id}`, {
                    method: 'DELETE'
                });

                await swalWithBootstrapButtons.fire({
                    title: "Deleted!",
                    text: "Data has been deleted.",
                    icon: "success"
                });

                fetchRetail();
            } catch (error: any) {
                console.log(error);
                Swal.fire("Error!", "There was a problem deleting the data.", "error");
            }
        }
    };

    useEffect(() => {
        fetchRetail()
    }, [])

    useEffect(() => {
        if (retails.length > 0) {
            const tableElement = document.querySelector("#table1") as HTMLTableElement | null;
            if (tableElement) {
                new DataTable(tableElement);
            }
        }
    }, [retails]);

    return (
        <div className="page-heading">
            <div className="page-title">
                <div className="row">
                    <div className="col-12 col-md-6 order-md-1 order-last">
                        <h3>Retails DataTable</h3>
                        <p className="text-subtitle text-muted">A sortable, searchable, paginated table without
                            dependencies thanks to simple-datatables.</p>
                        <Link to={'/retail/create'} className="btn btn-primary mb-2">Create</Link>
                    </div>
                    <div className="col-12 col-md-6 order-md-2 order-first">
                        <nav aria-label="breadcrumb" className="breadcrumb-header float-start float-lg-end">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to={'/'}>Dashboard</Link></li>
                                <li className="breadcrumb-item active" aria-current="page">Retails DataTable</li>
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
                                    <th>Retail</th>
                                    <th>Province</th>
                                    <th>City</th>
                                    <th>District</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {retails.map((item: any, idx: number) => (
                                    <tr key={idx}>
                                        <td>{idx + 1}</td>
                                        <td>{item.retailName}</td>
                                        <td>{item.provinceName}</td>
                                        <td>{item.cityName}</td>
                                        <td>{item.districtName}</td>
                                        <td>
                                            <div className="flex">
                                                <Link className='badge bg-success me-2' to={`/retail/update/${item.id}`}>Update</Link>
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

export default Retail