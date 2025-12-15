import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { Suspense, lazy } from "react"

import HomePage from "../module/HomePage/HomePage"
import HomePageLayout from "../module/HomePage/Layout/HomePageLayout"
import ViewMessagePage from "../module/Message/ViewMessagePage"

const ProductViewLayout = lazy(() => import("../module/ProductPage/Layout/ProductViewLayout"))
const ProductViewPage = lazy(() => import("../module/ProductPage/ProductViewPage"))

const AuthLayoutPage = lazy(() => import("../module/AuthPage/Layout/AuthLayoutPage"))
const LoginPage = lazy(() => import("../module/AuthPage/LoginPage"))
const RegisterPage = lazy(() => import("../module/AuthPage/RegisterPage"))
const ForgetPassword = lazy(() => import("../module/AuthPage/ForgetPassword"))
const ResetPassword = lazy(() => import("../module/AuthPage/ResetPassword"))
const ActivateAccount = lazy(() => import("../module/AuthPage/ActivateAccount"))

const AdminLayoutPage = lazy(() => import("../module/Admin/Layout/AdminLayoutPages"))
const AdminCategoryPage = lazy(() => import("../module/Admin/Category/AdminCategoryPage"))
const AdminCategoryUpdatePage = lazy(() => import("../module/Admin/Category/AdminCategoryUpdatePage"))
const AdminBannerPage = lazy(() => import("../module/Admin/Banner/AdminBannerPage"))
const AdminBannerUpdatePage = lazy(() => import("../module/Admin/Banner/AdminBannerUpdatePage"))
const AdminBannerCreatePage = lazy(() => import("../module/Admin/Banner/AdminBannerCreatePage"))
const AdminProductPage = lazy(() => import("../module/Admin/Product/AdminProductPage"))
const AdminCouponPage = lazy(() => import("../module/Admin/Coupon/AdminCouponPage"))
const AdminCouponUpdatePage = lazy(() => import("../module/Admin/Coupon/AdminCouponUpdatePage"))
const AdminUserPage = lazy(() => import("../module/Admin/AdminUsersPage"))
const AdminUserViewPage = lazy(() => import("../module/Admin/AdminUserViewPage"))
const AdminDashboardPage = lazy(() => import("../module/Admin/AdminDashboardPage"))

const SellerLayoutPage = lazy(() => import("../module/Seller/Layout/SellerLayoutPage"))
const SellerPage = lazy(() => import("../module/Seller/SellerPage"))
const SellerUpdatePage = lazy(() => import("../module/Seller/SellerUpdatePage"))
const SellerProductViewPage = lazy(() => import("../module/Seller/SellerProductViewPage"))
const SellerDashboardPage = lazy(() => import("../module/Seller/SellerDashboardPage"))
const SellerViewCategoryPage = lazy(() => import("../module/Seller/SellerViewCategory"))

const CustomerLayoutPage = lazy(() => import("../module/Customer/Layout/CustomerLayout"))
const CustomerCartPage = lazy(() => import("../module/Customer/Cart/CustomerCartPage"))
const CartViewPage = lazy(() => import("../module/Customer/Cart/CartViewPage"))
const CustomerOrderItemsPage = lazy(() => import("../module/Customer/OrderItem/OrderItemsPage"))

const MoreProductPage = lazy(() => import("../module/ProductPage/MoreProductPage"))
const PageNotFound = lazy(() => import("../module/PageNotFound"))

const router = createBrowserRouter([
    {
        path: '',
        Component: HomePageLayout,
        children: [
            { index: true, Component: HomePage },
            {
                path: 'product/:id',
                Component: ProductViewLayout,
                children: [{ index: true, Component: ProductViewPage }]
            },
            { path: 'product/more', Component: MoreProductPage },
        ]
    },

    {
        path: 'customer',
        Component: CustomerLayoutPage,
        children: [
            { path: 'cart', Component: CustomerCartPage },
            { path: 'orders', Component: CustomerOrderItemsPage },
            { path: 'cart/cartView/:id', Component: CartViewPage },
            { path: 'cart/khalti-success', Component: CustomerCartPage },
        ]
    },

    {
        path: 'auth',
        Component: AuthLayoutPage,
        children: [
            { path: 'login', Component: LoginPage },
            { path: 'register', Component: RegisterPage },
            { path: 'forget-password', Component: ForgetPassword },
            { path: 'reset-password', Component: ResetPassword },
            { path: 'activate/account/:id', Component: ActivateAccount }
        ],
    },

    {
        path: '/admin',
        Component: AdminLayoutPage,
        children: [
            { index: true, Component: AdminDashboardPage },
            {
                path: 'category',
                Component: AdminCategoryPage,
                children: [
                    { path: 'update/:id', Component: AdminCategoryUpdatePage }
                ]
            },
            {
                path: 'banner',
                Component: AdminBannerPage,
                children: [
                    { path: 'create', Component: AdminBannerCreatePage },
                    { path: 'update/:id', Component: AdminBannerUpdatePage }
                ]
            },
            { path: 'product', Component: AdminProductPage },
            {
                path: 'coupon',
                Component: AdminCouponPage,
                children: [
                    { path: 'update/:id', Component: AdminCouponUpdatePage }
                ]
            },
            {
                path: 'users',
                Component: AdminUserPage,
                children: [
                    { path: 'view/:id', Component: AdminUserViewPage }
                ]
            }
        ]
    },

    {
        path: '/seller',
        Component: SellerLayoutPage,
        children: [
            { index: true, Component: SellerDashboardPage },
            { path: 'category/view', Component: SellerViewCategoryPage },
            {
                path: 'product',
                Component: SellerPage,
                children: [
                    { path: 'update/:id', Component: SellerUpdatePage },
                    { path: 'view/:id', Component: SellerProductViewPage }
                ]
            },
        ],
    },

    {
        path: '*', // This path matches any URL that hasn't been matched by the routes above
        Component: PageNotFound // Display your 404 component
    }
])

const RouterConfig = () => {
    return (
        <Suspense fallback={<div className="text-center p-8">Loading...</div>}>
            <RouterProvider router={router} />
        </Suspense>
    )
}

export default RouterConfig