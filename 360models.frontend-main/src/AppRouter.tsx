import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// Pages
import { Login } from "@pages/Login/Login";
import { Organisations } from "@pages/organisations/Organisations";
import { Models } from "@pages/organisations/models/Models";
import { Users } from "@pages/users/Users";
import { Users as OrganisationUsers } from "@pages/organisations/users/Users";
import { Model } from "@pages/organisations/models/Model.tsx";
import { PanelLayout } from "./layouts/PanelLayout.tsx";
import { Logout } from "@pages/Logout.tsx";
import { ApiKeys } from "@pages/organisations/api-keys/ApiKeys.tsx";
import { Construction } from "@pages/Construction.tsx";

// Route Guards
import { AuthedProtectedRoute } from "@route-guards/AuthedProtectedRoute";
import { OrganisationProtectedRoute } from "@route-guards/OrganisationProtectedRoute";
import { AuthLayout } from "./layouts/AuthLayout.tsx";
import { OrganisationRouteProviders } from "./route-providers/OrganisationRouteProviders.tsx";
import { OrganisationsRouteProviders } from "./route-providers/OrganisationsRouteProviders.tsx";
import { Provider as ModelProvider } from "@contexts/useModel";
import { UsersRouteProviders } from "./route-providers/UsersRouteProviders.tsx";
import { ModelsRouteProviders } from "./route-providers/ModelsRouteProviders.tsx";

export function AppRouter() {
    return (
        <BrowserRouter basename="/">
            <AnimatePresence mode="sync">
                <Routes location={location} key={location.pathname}>
                    <Route element={<AuthLayout />}>
                        <Route path="/login" element={<Login />} />
                        <Route path="/logout" element={<Logout />} />
                    </Route>
                    {/* <Route path="*" element={<NotFound />} /> */}

                    {/* Private routes */}
                    <Route element={<PanelLayout />}>
                        <Route element={<AuthedProtectedRoute />}>
                            {/* Index should redirect to organisations */}
                            <Route
                                index
                                element={<Navigate to={"/organisations"} />}
                            />

                            {/* Organisation Routes */}
                            <Route
                                path="/organisations"
                                element={<OrganisationsRouteProviders />}
                            >
                                <Route index element={<Organisations />} />
                                {/* Private Organisation Routes */}
                                <Route element={<OrganisationProtectedRoute />}>
                                    <Route
                                        path={":organisationId"}
                                        element={<OrganisationRouteProviders />}
                                    >
                                        <Route
                                            path="models"
                                            element={<ModelsRouteProviders />}
                                        >
                                            <Route index element={<Models />} />
                                            <Route
                                                path={":modelId"}
                                                element={
                                                    <ModelProvider>
                                                        <Model />
                                                    </ModelProvider>
                                                }
                                            />
                                        </Route>
                                        <Route path="splats">
                                            <Route
                                                index
                                                element={<Construction />}
                                            />
                                        </Route>
                                        <Route
                                            path="users"
                                            element={<OrganisationUsers />}
                                        />
                                        <Route
                                            path="api-keys"
                                            element={<ApiKeys />}
                                        />
                                        <Route
                                            path="configurators"
                                            element={<Construction />}
                                        />
                                    </Route>
                                </Route>

                                {/* Admin Organisation Routes */}
                                {/*<Route element={<AdminProtectedRoute />}>*/}
                                {/*  <Route path="add" element={<AddOrganisation />}/>*/}
                                {/*  <Route path=":organisationId/models/add" element={<OrganisationProvider>*/}
                                {/*      <OrganisationsProvider>*/}
                                {/*        <AddModel />*/}
                                {/*      </OrganisationsProvider>*/}
                                {/*    </OrganisationProvider>*/}
                                {/*  } />*/}
                                {/*  <Route path=":organisationId/models/:modelId/add-file" element={<OrganisationProvider>*/}
                                {/*      <OrganisationsProvider>*/}
                                {/*        <ModelAddFile />*/}
                                {/*      </OrganisationsProvider>*/}
                                {/*    </OrganisationProvider>*/}
                                {/*  } />*/}
                                {/*  <Route path=":organisationId/splats/:splatId/add-file" element={<OrganisationProvider>*/}
                                {/*      <OrganisationsProvider>*/}
                                {/*        <SplatAddFile />*/}
                                {/*      </OrganisationsProvider>*/}
                                {/*    </OrganisationProvider>*/}
                                {/*  } />*/}
                                {/*  /!*<Route path="organisations/:organisationid/edit" element={<EditOrganisation />} />*!/*/}
                                {/*  <Route path=":organisationId/users/add" element={<OrganisationProvider>*/}
                                {/*    <OrganisationsProvider>*/}
                                {/*      <AddUser />*/}
                                {/*    </OrganisationsProvider>*/}
                                {/*  </OrganisationProvider>} />*/}
                                {/*  <Route path=":organisationId/keys/add" element={<OrganisationProvider>*/}
                                {/*      <OrganisationsProvider>*/}
                                {/*        <AddKey />*/}
                                {/*      </OrganisationsProvider>*/}
                                {/*  </OrganisationProvider>} />*/}
                                {/*  <Route path=":organisationId/splats/add" element={<OrganisationProvider>*/}
                                {/*      <OrganisationsProvider>*/}
                                {/*        <AddSplat />*/}
                                {/*      </OrganisationsProvider>*/}
                                {/*  </OrganisationProvider>} />*/}
                                {/*  /!*<Route path="organisations/:organisationid/:modelid/edit" element={<EditModel />} />*!/*/}
                                {/*  /!*<Route path="organisations/:organisationid/:modelid/:fileid/edit" element={<EditModelFile />} />*!/*/}
                                {/*  /!*<Route path="organisations/:organisationid/:modelid/:viewersettingid/editsetting" element={<EditViewerSetting />} />*!/*/}
                                {/*</Route>*/}
                            </Route>

                            <Route
                                path="/users"
                                element={<UsersRouteProviders />}
                            >
                                <Route index element={<Users />} />
                            </Route>
                        </Route>
                    </Route>
                </Routes>
            </AnimatePresence>
        </BrowserRouter>
    );
}
