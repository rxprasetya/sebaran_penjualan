import './templates/dist/assets/compiled/css/app.css'
import './templates/dist/assets/compiled/css/app-dark.css'
import './templates/dist/assets/compiled/css/iconly.css'
import './templates/dist/assets/compiled/css/auth.css'
import 'rc-tree/assets/index.css';
import { Route, Routes } from "react-router-dom"
import Sidebar from "./pages/global/Sidebar"
import PageTitle from './components/PageTitle'
import 'leaflet/dist/leaflet.css';
import Dashboard from './pages/Dashboard'
import Employee from './pages/Employee'
import Product from './pages/Product'
import ProductFormAction from './pages/Product/ProductFormAction'
import EmployeeFormAction from './pages/Employee/EmployeeFormAction'
import SalesCoverageArea from './pages/SalesCoverageArea'
import SalesCoverageAreaActionForm from './pages/SalesCoverageArea/SalesCoverageAreaActionForm'
import Retail from './pages/Retail';
import RetailActionForm from './pages/Retail/RetailFormAction';
import Login from './pages/Login';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/login"
          element={
            <>
              <Login />
              <PageTitle title='Login Page' />
            </>
          }
        />
        <Route path="/"
          element={
            <>
              <Sidebar CustomComponent={Dashboard} />
              <PageTitle title='Dashboard Page' />
            </>
          }
        />
        <Route path="/employee"
          element={
            <>
              <Sidebar CustomComponent={Employee} />
              <PageTitle title='Employee Page' />
            </>
          }
        />
        <Route path="/employee/create"
          element={
            <>
              <Sidebar CustomComponent={EmployeeFormAction} />
              <PageTitle title='Create Employee Page' />
            </>
          }
        />
        <Route path="/employee/update/:id"
          element={
            <>
              <Sidebar CustomComponent={EmployeeFormAction} />
              <PageTitle title='Update Employee Page' />
            </>
          }
        />
        <Route path="/product"
          element={
            <>
              <Sidebar CustomComponent={Product} />
              <PageTitle title='Product Page' />
            </>
          }
        />
        <Route path="/product/create"
          element={
            <>
              <Sidebar CustomComponent={ProductFormAction} />
              <PageTitle title='Create Product Page' />
            </>
          }
        />
        <Route path="/product/update/:id"
          element={
            <>
              <Sidebar CustomComponent={ProductFormAction} />
              <PageTitle title='Update Product Page' />
            </>
          }
        />
        <Route path="/sales-coverage-area/"
          element={
            <>
              <Sidebar CustomComponent={SalesCoverageArea} />
              <PageTitle title='Sales Coverage Area Page' />
            </>
          }
        />
        <Route path="/sales-coverage-area/create"
          element={
            <>
              <Sidebar CustomComponent={SalesCoverageAreaActionForm} />
              <PageTitle title='Create Sales Coverage Area Page' />
            </>
          }
        />
        <Route path="/sales-coverage-area/update/:id"
          element={
            <>
              <Sidebar CustomComponent={SalesCoverageAreaActionForm} />
              <PageTitle title='Update Sales Coverage Area Page' />
            </>
          }
        />
        <Route path="/retail/"
          element={
            <>
              <Sidebar CustomComponent={Retail} />
              <PageTitle title='Retail Page' />
            </>
          }
        />
        <Route path="/retail/create"
          element={
            <>
              <Sidebar CustomComponent={RetailActionForm} />
              <PageTitle title='Create Retail Page' />
            </>
          }
        />
        <Route path="/retail/update/:id"
          element={
            <>
              <Sidebar CustomComponent={RetailActionForm} />
              <PageTitle title='Update Retail Page' />
            </>
          }
        />
      </Routes>
    </div >
  );
}

export default App;
