import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import { DataTable } from 'simple-datatables';
import "simple-datatables/dist/style.css";
import Swal from 'sweetalert2';

const Employee = () => {

    const [employees, setEmployees] = useState([])

    const fetchEmployee = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/employees/', { method: 'GET' })
            const data = await res.json()
            setEmployees(data.data)
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
                const res = await fetch('http://localhost:3000/api/employees/delete/' + id, { method: 'DELETE' })
                const data = res.json()
                window.location.reload()
            } catch (error: any) {
                console.log(error)
            }
        }
    }

    useEffect(() => {
        fetchEmployee()
    }, [])

    useEffect(() => {
        if (employees.length > 0) {
            const tableElement = document.querySelector("#table1") as HTMLTableElement | null;
            if (tableElement) {
                new DataTable(tableElement);
            }
        }
    }, [employees]);

    return (
        <div className="page-heading">
            <div className="page-title">
                <div className="row">
                    <div className="col-12 col-md-6 order-md-1 order-last">
                        <h3>Employees DataTable</h3>
                        <p className="text-subtitle text-muted">A sortable, searchable, paginated table without
                            dependencies thanks to simple-datatables.</p>
                        <Link to={'/employee/create'} className="btn btn-primary mb-2">Create</Link>
                    </div>
                    <div className="col-12 col-md-6 order-md-2 order-first">
                        <nav aria-label="breadcrumb" className="breadcrumb-header float-start float-lg-end">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><Link to={'/'}>Dashboard</Link></li>
                                <li className="breadcrumb-item active" aria-current="page">Employees DataTable</li>
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
                                    <th>Position</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map((item: any, idx: number) => (
                                    <tr key={idx}>
                                        <td>{idx + 1}</td>
                                        <td>{item.employeeCode}</td>
                                        <td>{item.employeeName}</td>
                                        <td>{item.employeePosition}</td>
                                        <td>
                                            <div className="flex">
                                                <Link className='badge bg-success me-2' to={`/employee/update/${item.id}`}>Update</Link>
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

export default Employee