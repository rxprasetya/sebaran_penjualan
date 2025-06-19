import { useEffect, useState } from 'react'
import Heading from '../../components/Heading'
import Map from '../Map'
import profile from './../../templates/dist/assets/compiled//jpg/1.jpg'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {

    const nav = useNavigate()
    const [totalEmployees, setTotalEmployees] = useState()
    const [totalProducts, setTotalProducts] = useState()
    const [totalAreas, setTotalAreas] = useState()
    const [totalRetails, setTotalRetails] = useState()

    const fetchTotal = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/total', { method: 'GET' })
            const data = await res.json()

            setTotalEmployees(data.data.totalEmployees[0].count);
            setTotalProducts(data.data.totalProducts[0].count);
            setTotalAreas(data.data.totalAreas[0].count);
            setTotalRetails(data.data.totalRetails[0].count);
        } catch (error: any) {
            console.log(error)
        }
    }

    useEffect(() => {
        !localStorage.getItem('auth') && nav('/login')
        fetchTotal()
    }, [])
    return (
        <>
            <Heading title="Dashboard Page" />
            <section className="row">
                <div className="col-12 col-lg-9">
                    <div className="row">
                        <div className="col-6 col-lg-3 col-md-6">
                            <div className="card">
                                <div className="card-body px-4 py-4-5">
                                    <div className="row">
                                        <div
                                            className="col-md-4 col-lg-12 col-xl-12 col-xxl-5 d-flex justify-content-start ">
                                            <div className="stats-icon purple mb-2">
                                                <i className="iconly-boldProfile"></i>
                                            </div>
                                        </div>
                                        <div className="col-md-8 col-lg-12 col-xl-12 col-xxl-7">
                                            <h6 className="text-muted font-semibold">Sales</h6>
                                            <h6 className="font-extrabold mb-0">{totalEmployees === 0 ? 'No Available' : totalEmployees}</h6>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-6 col-lg-3 col-md-6">
                            <div className="card">
                                <div className="card-body px-4 py-4-5">
                                    <div className="row">
                                        <div
                                            className="col-md-4 col-lg-12 col-xl-12 col-xxl-5 d-flex justify-content-start ">
                                            <div className="stats-icon blue mb-2">
                                                <i className="iconly-boldBag-2"></i>
                                            </div>
                                        </div>
                                        <div className="col-md-8 col-lg-12 col-xl-12 col-xxl-7">
                                            <h6 className="text-muted font-semibold">Products</h6>
                                            <h6 className="font-extrabold mb-0">{totalProducts === 0 ? 'No Available' : totalProducts}</h6>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-6 col-lg-3 col-md-6">
                            <div className="card">
                                <div className="card-body px-4 py-4-5">
                                    <div className="row">
                                        <div
                                            className="col-md-4 col-lg-12 col-xl-12 col-xxl-5 d-flex justify-content-start ">
                                            <div className="stats-icon green mb-2">
                                                <i className="iconly-boldLocation"></i>
                                            </div>
                                        </div>
                                        <div className="col-md-8 col-lg-12 col-xl-12 col-xxl-7">
                                            <h6 className="text-muted font-semibold">Areas</h6>
                                            <h6 className="font-extrabold mb-0">{totalAreas === 0 ? 'No Available' : totalAreas}</h6>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-6 col-lg-3 col-md-6">
                            <div className="card">
                                <div className="card-body px-4 py-4-5">
                                    <div className="row">
                                        <div
                                            className="col-md-4 col-lg-12 col-xl-12 col-xxl-5 d-flex justify-content-start ">
                                            <div className="stats-icon red mb-2">
                                                <i className="iconly-boldBuy"></i>
                                            </div>
                                        </div>
                                        <div className="col-md-8 col-lg-12 col-xl-12 col-xxl-7">
                                            <h6 className="text-muted font-semibold">Retails</h6>
                                            <h6 className="font-extrabold mb-0">{totalRetails === 0 ? 'No Available' : totalRetails}</h6>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-lg-3">
                    <div className="card">
                        <div className="card-body py-4 px-4">
                            <div className="d-flex align-items-center">
                                <div className="avatar avatar-xl">
                                    <img src={profile} alt="Face 1" />
                                </div>
                                <div className="ms-3 name">
                                    <h5 className="font-bold">{localStorage.getItem('user')}</h5>
                                    <h6 className="text-muted mb-0">Super Admin</h6>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className="row">
                <Map />
            </section>
        </>
    )
}

export default Dashboard