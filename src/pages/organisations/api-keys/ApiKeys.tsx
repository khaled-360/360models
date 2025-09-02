@@ .. @@
 import { useCallback, useEffect, useState } from "react";
 import { useContext as useOrganisation } from "@contexts/useOrganisation.tsx";
 import { useContext as useBreadcrumbs } from "@contexts/useBreadcrumb.tsx";
 import { useContext as useAuth } from "@contexts/useAuth.tsx";
 import { useOverlayRenderer as useModal } from "@contexts/useOverlayRenderer.tsx";
 import { PageHeader } from "@components/Header/PageHeader.tsx";
 import { Button } from "@components/Button.tsx";
 import { Modal } from "@components/Modal.tsx";
 import {
     IconArrowLeft,
     IconCopy,
     IconEdit,
     IconEye,
+    IconEyeOff,
     IconPlus,
 } from "@tabler/icons-react";
 import { PreviousCrumb } from "@components/BreadCrumbs/PreviousBreadcrumb.tsx";
 import { motion } from "framer-motion";
 import {
     GridTable,
     GridTableBody,
     GridTableHeaders,
     GridTableRow,
 } from "@components/GridTableNew.tsx";
 import {
     CreateOrganisationApiKeyData,
     FetchedOrganisationApiKeyData,
     UpdateOrganisationApiKeyData,
 } from "@360models.platform/types/DTO/organisation-api-keys";
 import { ApiKeyForm } from "@forms/ApiKeyForm.tsx";
 import { Page } from "@components/Page.tsx";

 export function ApiKeys() {
     const { info: organisation, apiKeys, createApiKey } = useOrganisation();
     const breadcrumbs = useBreadcrumbs();
     const { isAdmin } = useAuth();
     const { pushModal, popModal } = useModal();

     useEffect(() => {
         breadcrumbs.setCrumbs([
             { label: "Organisations", link: "/organisations" },
+            { label: organisation.name, link: `/organisations/${organisation.id}` },
             {
                 label: "API Keys",
                 link: `/organisations/${organisation.id}/api-keys`,
             },
         ]);
     }, []);

     const addApiKey = useCallback(
         (data: CreateOrganisationApiKeyData) => {
             void createApiKey(data);
             popModal();
         },
         [createApiKey, pushModal],
     );

     const openAddApiKeyModal = useCallback(() => {
         pushModal(
             <Modal className={"w-[88%] max-w-xl"}>
                 <ApiKeyForm add={addApiKey} />
             </Modal>,
         );
     }, [addApiKey]);

     return (
         <Page>
             <PageHeader
-                title={"API Keys"}
+                title="API Keys"
+                subtitle={`${apiKeys.length} API key${apiKeys.length !== 1 ? 's' : ''} configured`}
                 primaryActionElement={
                     isAdmin && (
                         <Button
-                            className={
-                                "flex items-center gap-1 rounded-lg border border-red-500/50 bg-red-400 px-3 py-2 shadow-md"
-                            }
                             onClick={openAddApiKeyModal}
+                            aria-label="Add new API key"
                         >
-                            <IconPlus className={"aspect-square h-[80%]"} />
+                            <IconPlus className="h-5 w-5" />
+                            <span className="hidden sm:inline">Add API Key</span>
                         </Button>
                     )
                 }
                 beforeTitleElement={
-                    <PreviousCrumb className={"rounded-full p-3 shadow-sm"}>
+                    <PreviousCrumb className="rounded-lg p-2 transition-colors hover:bg-gray-100">
                         <IconArrowLeft />
                     </PreviousCrumb>
                 }
             />
             <motion.div
                 initial={{ opacity: 0.5 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0.5 }}
-                className={"flex flex-wrap gap-4 px-4 py-2"}
+                className="p-4 lg:p-6"
             >
                 <ApiKeyList apiKeys={apiKeys} />
             </motion.div>
         </Page>
     );
 }

 function ApiKeyList({ apiKeys }: { apiKeys: FetchedOrganisationApiKeyData[] }) {
     return (
-        <GridTable columnSizes={["auto", "1fr", "auto"]}>
+        <GridTable columnSizes={["1fr", "2fr", "auto"]} className="w-full">
             <GridTableHeaders>
-                <div className={"p-2"}>Name</div>
-                <div className={"col-span-2 p-2"}>Key</div>
+                <div className="p-4 font-semibold">Name</div>
+                <div className="p-4 font-semibold">Key</div>
+                <div className="p-4 font-semibold">Actions</div>
             </GridTableHeaders>
             <GridTableBody>
                 {apiKeys.length === 0 && (
-                    <GridTableRow className={"items-center py-2"}>
-                        <p className={"col-span-full text-center"}>
+                    <GridTableRow className="items-center py-8">
+                        <div className="col-span-full text-center">
+                            <IconKey className="mx-auto mb-2 h-8 w-8 text-gray-400" />
+                            <p className="text-gray-600">
                             No API Keys in organisation
-                        </p>
+                            </p>
+                        </div>
                     </GridTableRow>
                 )}
                 {apiKeys.map((key) => (
-                    <ApiKeyRow apiKey={key} />
+                    <ApiKeyRow key={key.key} apiKey={key} />
                 ))}
             </GridTableBody>
         </GridTable>
     );
 }

 function ApiKeyRow({ apiKey }: { apiKey: FetchedOrganisationApiKeyData }) {
     const { updateApiKey: update } = useOrganisation();
     const { pushModal, popModal } = useModal();
+    const [visible, setVisible] = useState(false);
+    const [copied, setCopied] = useState(false);
+    
     const copyKey = useCallback(async () => {
         if (!window.navigator || !window.navigator.clipboard) return;
         await window.navigator.clipboard.writeText(apiKey.key);
+        setCopied(true);
+        setTimeout(() => setCopied(false), 2000);
     }, [apiKey.key]);

-    const [visible, setVisible] = useState(false);

     const updateApiKey = useCallback(
         (
             data: UpdateOrganisationApiKeyData,
             original: FetchedOrganisationApiKeyData,
         ) => {
             void update(original.key, data);
             popModal();
         },
         [update, pushModal],
     );

     const openUpdateApiKeyModal = useCallback(() => {
         pushModal(
             <Modal className={"w-[88%] max-w-xl"}>
                 <ApiKeyForm data={apiKey} update={updateApiKey} />
             </Modal>,
         );
     }, [updateApiKey, apiKey]);

     return (
         <GridTableRow
-            className={"items-center whitespace-nowrap py-2 even:bg-black/5"}
+            className="items-center border-b border-gray-100 py-4 transition-colors hover:bg-gray-50"
         >
-            <p className={"px-2"}>{apiKey.name}</p>
-            <p className={"select-text px-2"}>
-                {!visible ? "".padEnd(apiKey.key.length, "*") : apiKey.key}
-            </p>
-            <div className={"flex gap-2 px-2"}>
-                <IconEye
-                    className={"cursor-pointer"}
-                    onClick={() => setVisible(!visible)}
-                />
-                <IconCopy className={"cursor-pointer"} onClick={copyKey} />
-                <IconEdit
-                    className={"cursor-pointer"}
-                    onClick={openUpdateApiKeyModal}
-                />
+            <div className="px-4">
+                <p className="font-medium text-gray-900">{apiKey.name}</p>
+            </div>
+            <div className="px-4">
+                <code className="select-text rounded bg-gray-100 px-2 py-1 text-sm font-mono">
+                    {!visible ? "•".repeat(Math.min(apiKey.key.length, 32)) : apiKey.key}
+                </code>
+            </div>
+            <div className="flex gap-1 px-4">
+                <Button
+                    variant="ghost"
+                    size="sm"
+                    onClick={() => setVisible(!visible)}
+                    aria-label={visible ? "Hide API key" : "Show API key"}
+                >
+                    {visible ? (
+                        <IconEyeOff className="h-4 w-4" />
+                    ) : (
+                        <IconEye className="h-4 w-4" />
+                    )}
+                </Button>
+                <Button
+                    variant="ghost"
+                    size="sm"
+                    onClick={copyKey}
+                    aria-label="Copy API key to clipboard"
+                >
+                    <IconCopy className="h-4 w-4" />
+                    {copied && <span className="text-xs">Copied!</span>}
+                </Button>
+                <Button
+                    variant="ghost"
+                    size="sm"
+                    onClick={openUpdateApiKeyModal}
+                    aria-label="Edit API key"
+                >
+                    <IconEdit className="h-4 w-4" />
+                </Button>
             </div>
         </GridTableRow>
     );
 }