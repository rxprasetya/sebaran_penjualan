import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { DataTable } from 'simple-datatables'
import Swal from 'sweetalert2'

function ProductCompetitor() {
  const { productID } = useParams()
  const [productCompetitor, setProductCompetitor] = useState([])

  const fetchproductCompetitor = async (productID: number) => {
    try {
      const res = await fetch(`http://localhost:3000/api/products/${productID}/competitors/`, { method: 'GET' })
      const data = await res.json()
      setProductCompetitor(data.data)
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
        const res = await fetch(`http://localhost:3000/api/products/${productID}/competitors/delete/` + id, { method: 'DELETE' })
        if (res.ok) {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Data has been deleted successfully.',
            showConfirmButton: true
          });
          fetchproductCompetitor(Number(productID))
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
    fetchproductCompetitor(Number(productID))
  }, [])

  useEffect(() => {
    if (productCompetitor.length > 0) {
      const tableElement = document.querySelector("#table1") as HTMLTableElement | null;
      if (tableElement) {
        new DataTable(tableElement);
      }
    }
  }, [productCompetitor]);

  return (
    <div className="page-heading">
      <div className="page-title">
        <div className="row">
          <div className="col-12 col-md-6 order-md-1 order-last">
            <h3>Competitors DataTable</h3>
            <p className="text-subtitle text-muted">A sortable, searchable, paginated table without
              dependencies thanks to simple-datatables.</p>
            <Link to={`/product/${productID}/competitor/create`} className="btn btn-primary mb-2">Create</Link>
          </div>
          <div className="col-12 col-md-6 order-md-2 order-first">
            <nav aria-label="breadcrumb" className="breadcrumb-header float-start float-lg-end">
              <ol className="breadcrumb">
                <li className="breadcrumb-item"><Link to={'/'}>Dashboard</Link></li>
                <li className="breadcrumb-item"><Link to={`/product/preview/${productID}`}>Preview Product</Link></li>
                <li className="breadcrumb-item active" aria-current="page">Competitors DataTable</li>
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
                  <th>Competitor</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {
                  productCompetitor.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center">No records found.</td>
                    </tr>
                  ) : (
                    productCompetitor.map((item: any, idx: number) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        {/* <td>[{item.productCode}] {item.productName}</td> */}
                        <td>{item.competitorName}</td>
                        <td className='w-25'>
                          <div className="flex">
                            <Link className='badge bg-success me-2' to={`/product/${productID}/competitor/update/${item.pcID}`}>
                              <i className="bi bi-pencil-square"></i>
                            </Link>
                            <Link className='badge bg-danger' to={`#`} onClick={() => onDelete(item.pcID)}>
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

export default ProductCompetitor