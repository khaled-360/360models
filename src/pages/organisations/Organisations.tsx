@@ .. @@
 import { useNavigate } from "react-router-dom";
 import { motion } from "framer-motion";
-import { useContext as useOrganisations } from "../../contexts/useOrganisations.js";
-import { useContext as useAuth } from "../../contexts/useAuth.js";
+import { useContext as useOrganisations } from "@contexts/useOrganisations.tsx";
+import { useContext as useAuth } from "@contexts/useAuth.tsx";
 import { useCallback, useEffect, useState } from "react";
 import { useContext as useBreadcrumbs } from "@contexts/useBreadcrumb.tsx";
 import { useOverlayRenderer as useModal } from "@contexts/useOverlayRenderer.tsx";
 import { Modal } from "@components/Modal.tsx";
 import { OrganisationForm } from "@forms/OrganisationForm.tsx";
 import {
     CreateOrganisationData,
     FetchedOrganisationData,
     UpdateOrganisationData,
 } from "@360models.platform/types/DTO/organisations";
 import {
     IconBlocks,
     IconChartScatter3d,
     IconCube,
     IconEdit,
     IconKey,
     IconPlus,
     IconSearch,
     IconUsers,
 } from "@tabler/icons-react";
-import { GridList, GridRow } from "@components/GridList.tsx";
 import { Button } from "@components/Button.tsx";
 import { PageHeader } from "@components/Header/PageHeader.tsx";
 import { Page } from "@components/Page.tsx";

 export function Organisations() {
     const navigate = useNavigate();
     const { isAdmin } = useAuth();
     const { organisations, addOrganisation } = useOrganisations();
     const breadcrumbs = useBreadcrumbs();
     const { pushModal, popModal } = useModal();
     const [organisationFilter, setOrganisationFilter] = useState("");

     useEffect(() => {
         breadcrumbs.setCrumbs([
             { label: "Organisations", link: "/organisations" },
         ]);
     }, []);

     const onAddOrganisation = useCallback(
         async (data: CreateOrganisationData<File>) => {
             await addOrganisation(data);
             popModal();
         },
         [addOrganisation],
     );

     useEffect(() => {
         if (isAdmin) return;
         if (organisations.length !== 1) return;
         navigate(`/organisations/${organisations[0].id}`);
     }, [organisations, navigate]);

+    const filteredOrganisations = organisations.filter((org) =>
+        org.name.toLowerCase().includes(organisationFilter.toLowerCase())
+    );

     return (
         <Page>
             <PageHeader
-                title={"Organisations"}
+                title="Organisations"
+                subtitle={`${organisations.length} organisation${organisations.length !== 1 ? 's' : ''} available`}
+                showBreadcrumbs={false}
                 primaryActionElement={
                     isAdmin && (
                         <Button
-                            className={
-                                "flex items-center gap-1 rounded-lg border border-red-500/50 bg-red-400 px-3 py-2 shadow-md"
-                            }
                             onClick={() =>
                                 pushModal(
                                     <Modal className={"w-full max-w-xl"}>
                                         <OrganisationForm
                                             add={onAddOrganisation}
                                         />
                                     </Modal>,
                                 )
                             }
+                            aria-label="Add new organisation"
                         >
-                            <IconPlus className={"aspect-square h-[80%]"} />
+                            <IconPlus className="h-5 w-5" />
+                            <span className="hidden sm:inline">Add Organisation</span>
                         </Button>
                     )
                 }
             />
+            
             <motion.div
                 initial={{ opacity: 0.5 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0.5 }}
-                className={"flex h-full flex-col"}
+                className="flex h-full flex-col px-4 py-6"
             >
-                <div className={"flex max-w-sm items-center gap-2 pb-3"}>
-                    <IconSearch />
-                    <input
-                        type={"text"}
-                        className={
-                            "flex-grow rounded-lg border border-black/20 px-4 py-2 !outline-0 focus:border-black/45"
-                        }
-                        placeholder={"Filter organisations"}
-                        onChange={(e) =>
-                            setOrganisationFilter(e.currentTarget.value)
-                        }
-                    />
+                <div className="mb-6 flex max-w-md items-center gap-3">
+                    <div className="relative flex-1">
+                        <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
+                        <input
+                            type="text"
+                            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm transition-colors focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
+                            placeholder="Search organisations..."
+                            value={organisationFilter}
+                            onChange={(e) => setOrganisationFilter(e.target.value)}
+                            aria-label="Filter organisations"
+                        />
+                    </div>
                 </div>
-                <GridList
-                    columnSizes={["100px", "1fr"]}
-                    gridClassName={"gap-4"}
-                >
-                    {organisations
-                        .filter((org) => org.name.includes(organisationFilter))
-                        .map((org) => (
-                            <GridRow
-                                key={org.id}
-                                className={
-                                    "items-center gap-2 rounded-lg border-2 border-black/10 p-3"
-                                }
-                            >
-                                {org.logoSrc ? (
-                                    <img
-                                        src={org.logoSrc}
-                                        alt={"Logo"}
-                                        className={
-                                            "aspect-square w-full rounded-lg border border-black/15 bg-white object-scale-down p-1"
-                                        }
-                                    />
-                                ) : (
-                                    <div
-                                        className={
-                                            "aspect-square w-full rounded-lg border border-black/15 bg-white p-1"
-                                        }
-                                    ></div>
-                                )}
-                                <div
-                                    className={
-                                        "flex flex-col items-center justify-between gap-2 px-2 2xl:flex-row"
-                                    }
-                                >
-                                    <p className={"text-2xl font-bold"}>
-                                        {org.name}
-                                    </p>
-                                    <div className={"flex flex-wrap gap-2"}>
-                                        {isAdmin && (
-                                            <OrganisationUsersLink
-                                                organisation={org}
-                                            />
-                                        )}
-                                        <OrganisationModelLink
-                                            organisation={org}
-                                        />
-                                        {isAdmin && (
-                                            <OrganisationConfiguratorLink
-                                                organisation={org}
-                                            />
-                                        )}
-                                        {isAdmin && (
-                                            <OrganisationSplatLink
-                                                organisation={org}
-                                            />
-                                        )}
-                                        {isAdmin && (
-                                            <OrganisationApiKeyLink
-                                                organisation={org}
-                                            />
-                                        )}
-                                        {isAdmin && (
-                                            <OrganisationEditButton
-                                                organisation={org}
-                                            />
-                                        )}
-                                    </div>
-                                </div>
-                            </GridRow>
-                        ))}
-                </GridList>
+                
+                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
+                    {filteredOrganisations.length === 0 ? (
+                        <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
+                            <IconSearch className="mb-4 h-12 w-12 text-gray-400" />
+                            <h3 className="text-lg font-semibold text-gray-900">No organisations found</h3>
+                            <p className="mt-1 text-sm text-gray-600">
+                                {organisationFilter 
+                                    ? "Try adjusting your search terms"
+                                    : "Get started by creating your first organisation"
+                                }
+                            </p>
+                        </div>
+                    ) : (
+                        filteredOrganisations.map((org) => (
+                            <OrganisationCard key={org.id} organisation={org} />
+                        ))
+                    )}
+                </div>
             </motion.div>
         </Page>
     );
 }

+function OrganisationCard({ organisation }: { organisation: FetchedOrganisationData }) {
+    const { isAdmin } = useAuth();
+    
+    return (
+        <motion.div
+            initial={{ opacity: 0, y: 20 }}
+            animate={{ opacity: 1, y: 0 }}
+            className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-lg"
+        >
+            <div className="aspect-square w-full bg-gradient-to-br from-gray-50 to-gray-100 p-6">
+                {organisation.logoSrc ? (
+                    <img
+                        src={organisation.logoSrc}
+                        alt={`${organisation.name} logo`}
+                        className="h-full w-full rounded-lg object-contain"
+                    />
+                ) : (
+                    <div className="flex h-full w-full items-center justify-center rounded-lg bg-gray-200">
+                        <IconBuilding className="h-12 w-12 text-gray-400" />
+                    </div>
+                )}
+            </div>
+            
+            <div className="p-6">
+                <h3 className="text-balance text-lg font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
+                    {organisation.name}
+                </h3>
+                
+                <div className="mt-4 grid grid-cols-2 gap-2">
+                    <OrganisationModelLink organisation={organisation} />
+                    {isAdmin && <OrganisationUsersLink organisation={organisation} />}
+                    {isAdmin && <OrganisationApiKeyLink organisation={organisation} />}
+                    {isAdmin && <OrganisationEditButton organisation={organisation} />}
+                </div>
+            </div>
+        </motion.div>
+    );
+}

 function OrganisationUsersLink({
     organisation,
 }: {
     organisation: FetchedOrganisationData;
 }) {
     const navigate = useNavigate();
     const navigateTo = useCallback(() => {
         navigate(`/organisations/${organisation.id}/users`);
     }, [organisation, navigate]);

     return (
         <Button
-            className={
-                "flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-400 px-4 py-3 shadow-md"
-            }
+            variant="secondary"
+            size="sm"
+            className="w-full justify-center"
             onClick={navigateTo}
+            aria-label={`Manage users for ${organisation.name}`}
         >
-            <IconUsers className={"aspect-square h-[80%]"} />
-            Users
+            <IconUsers className="h-4 w-4" />
+            <span className="hidden sm:inline">Users</span>
         </Button>
     );
 }

 function OrganisationModelLink({
     organisation,
 }: {
     organisation: FetchedOrganisationData;
 }) {
     const navigate = useNavigate();
     const navigateTo = useCallback(() => {
         navigate(`/organisations/${organisation.id}/models`);
     }, [organisation, navigate]);

     return (
         <Button
-            className={
-                "flex flex-col items-center gap-1 rounded-lg border border-red-500/50 bg-red-400 px-4 py-3 shadow-md"
-            }
+            size="sm"
+            className="w-full justify-center"
             onClick={navigateTo}
+            aria-label={`View models for ${organisation.name}`}
         >
-            <div className={"flex items-center gap-2"}>
-                <IconCube className={"aspect-square h-[80%]"} />
-                Models
-            </div>
+            <IconCube className="h-4 w-4" />
+            <span className="hidden sm:inline">Models</span>
         </Button>
     );
 }

-function OrganisationConfiguratorLink({
-    organisation,
-}: {
-    organisation: FetchedOrganisationData;
-}) {
-    const navigate = useNavigate();
-    const navigateTo = useCallback(() => {
-        navigate(`/organisations/${organisation.id}/configurators`);
-    }, [organisation, navigate]);
-
-    return (
-        <Button
-            className={
-                "flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-400 px-3 py-2 shadow-md"
-            }
-            onClick={navigateTo}
-        >
-            <IconBlocks className={"aspect-square h-[80%]"} />
-            Configurators
-        </Button>
-    );
-}
-
-function OrganisationSplatLink({
-    organisation,
-}: {
-    organisation: FetchedOrganisationData;
-}) {
-    const navigate = useNavigate();
-    const navigateTo = useCallback(() => {
-        navigate(`/organisations/${organisation.id}/splats`);
-    }, [organisation, navigate]);
-
-    return (
-        <Button
-            className={
-                "flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-400 px-4 py-3 shadow-md"
-            }
-            onClick={navigateTo}
-        >
-            <IconChartScatter3d className={"aspect-square h-[80%]"} />
-            Gaussian Splats
-        </Button>
-    );
-}

 function OrganisationApiKeyLink({
     organisation,
 }: {
     organisation: FetchedOrganisationData;
 }) {
     const navigate = useNavigate();
     const navigateTo = useCallback(() => {
         navigate(`/organisations/${organisation.id}/api-keys`);
     }, [organisation, navigate]);

     return (
         <Button
-            className={
-                "flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-400 px-4 py-3 shadow-md"
-            }
+            variant="secondary"
+            size="sm"
+            className="w-full justify-center"
             onClick={navigateTo}
+            aria-label={`Manage API keys for ${organisation.name}`}
         >
-            <IconKey className={"aspect-square h-[80%]"} />
-            API Keys
+            <IconKey className="h-4 w-4" />
+            <span className="hidden sm:inline">Keys</span>
         </Button>
     );
 }

 function OrganisationEditButton({
     organisation,
 }: {
     organisation: FetchedOrganisationData;
 }) {
     const { pushModal, popModal } = useModal();
     const { updateOrganisation: update } = useOrganisations();
     const updateOrganisation = useCallback(
         async (
             data: UpdateOrganisationData<File>,
             original: FetchedOrganisationData,
         ) => {
             void update(original.id, data);
             popModal();
         },
         [update],
     );

     const openEditModal = useCallback(() => {
         pushModal(
             <Modal className={"w-full max-w-xl"}>
                 <OrganisationForm
                     data={organisation}
                     update={updateOrganisation}
                 />
             </Modal>,
         );
     }, [pushModal, updateOrganisation]);

     return (
         <Button
-            className={
-                "flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-400 px-4 py-3 shadow-md"
-            }
+            variant="ghost"
+            size="sm"
+            className="w-full justify-center"
             onClick={openEditModal}
+            aria-label={`Edit ${organisation.name}`}
         >
-            <IconEdit className={"aspect-square h-[80%]"} />
-            Edit
+            <IconEdit className="h-4 w-4" />
+            <span className="hidden sm:inline">Edit</span>
         </Button>
     );
 }