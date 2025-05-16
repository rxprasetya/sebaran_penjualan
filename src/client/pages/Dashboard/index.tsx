import { useEffect } from 'react'
import Heading from '../../components/Heading'
import Map from '../Map'
import profile from './../../templates/dist/assets/compiled//jpg/1.jpg'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {

    const nav = useNavigate()

    useEffect(() => {
        !localStorage.getItem('auth') && nav('/login')
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
                                                <i className="iconly-boldShow"></i>
                                            </div>
                                        </div>
                                        <div className="col-md-8 col-lg-12 col-xl-12 col-xxl-7">
                                            <h6 className="text-muted font-semibold">Profile Views</h6>
                                            <h6 className="font-extrabold mb-0">112.000</h6>
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
                                                <i className="iconly-boldProfile"></i>
                                            </div>
                                        </div>
                                        <div className="col-md-8 col-lg-12 col-xl-12 col-xxl-7">
                                            <h6 className="text-muted font-semibold">Followers</h6>
                                            <h6 className="font-extrabold mb-0">183.000</h6>
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
                                                <i className="iconly-boldAdd-User"></i>
                                            </div>
                                        </div>
                                        <div className="col-md-8 col-lg-12 col-xl-12 col-xxl-7">
                                            <h6 className="text-muted font-semibold">Following</h6>
                                            <h6 className="font-extrabold mb-0">80.000</h6>
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
                                                <i className="iconly-boldBookmark"></i>
                                            </div>
                                        </div>
                                        <div className="col-md-8 col-lg-12 col-xl-12 col-xxl-7">
                                            <h6 className="text-muted font-semibold">Saved Post</h6>
                                            <h6 className="font-extrabold mb-0">112</h6>
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
                                    <h5 className="font-bold">Admin</h5>
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