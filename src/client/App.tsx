import './templates/dist/assets/compiled/css/app.css'
import './templates/dist/assets/compiled/css/app-dark.css'
import './templates/dist/assets/compiled/css/iconly.css'
import './templates/dist/assets/compiled/css/auth.css'
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
import ProductDistributionArea from './pages/Product/ProductDistributionArea/index';
import ProductCompetitor from './pages/Product/ProductCompetitor/index';
import ProductDistributionAreaAction from './pages/Product/ProductDistributionArea/ProductDistributionAreaAction';
import ProductCompetitorAction from './pages/Product/ProductCompetitor/ProductCompetitorAction';

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
        <Route path="/product/preview/:id"
          element={
            <>
              <Sidebar CustomComponent={ProductFormAction} />
              <PageTitle title='Preview Product Page' />
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
        <Route path="/product/:productID/competitor"
          element={
            <>
              <Sidebar CustomComponent={ProductCompetitor} />
              <PageTitle title='Product Competitors Page' />
            </>
          }
        />
        <Route path="/product/:productID/competitor/create"
          element={
            <>
              <Sidebar CustomComponent={ProductCompetitorAction} />
              <PageTitle title='Create Competitor Page' />
            </>
          }
        />
        <Route path="/product/:productID/competitor/update/:id"
          element={
            <>
              <Sidebar CustomComponent={ProductCompetitorAction} />
              <PageTitle title='Update Competitor Page' />
            </>
          }
        />
        <Route path="/product/:productID/distribution-area"
          element={
            <>
              <Sidebar CustomComponent={ProductDistributionArea} />
              <PageTitle title='Distribution Areas Page' />
            </>
          }
        />
        <Route path="/product/:productID/distribution-area/create"
          element={
            <>
              <Sidebar CustomComponent={ProductDistributionAreaAction} />
              <PageTitle title='Create Distribution Area Page' />
            </>
          }
        />
        <Route path="/product/:productID/distribution-area/update/:id"
          element={
            <>
              <Sidebar CustomComponent={ProductDistributionAreaAction} />
              <PageTitle title='Update Distribution Area Page' />
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
