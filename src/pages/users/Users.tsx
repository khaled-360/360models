@@ .. @@
 import { motion } from "framer-motion";
 import { useCallback, useEffect, useMemo, useState } from "react";
 import { useContext as useOrganisations } from "@contexts/useOrganisations.tsx";
 import { useContext as useAuth } from "@contexts/useAuth.tsx";
 import { useContext as useUsers } from "@contexts/useUsers.tsx";
 import { useContext as useBreadcrumbs } from "@contexts/useBreadcrumb.tsx";
 import { Modal } from "@components/Modal.tsx";
 import {
     CreateUserData,
     FetchedUserData,
 } from "@360models.platform/types/DTO/users";
 import {
     useAddOrganisationUser,
     useInvalidateOrganisationUsers,
     useRemoveOrganisationUser,
     useUserOrganisations,
 } from "@queries/organisation-users.ts";
 import { FetchedOrganisationData } from "@360models.platform/types/DTO/organisations";
 import { UserForm } from "@forms/UserForm.tsx";
 import {
     DropDown,
     DropDownOption,
 } from "@components/CustomInputs/DropDown.tsx";
-import { IconPlus, IconX } from "@tabler/icons-react";
+import { IconPlus, IconX, IconUsers, IconSearch } from "@tabler/icons-react";
 import {
     GridTable,
     GridTableBody,
     GridTableHeaders,
     GridTableRow,
 } from "@components/GridTableNew.tsx";
 import { Button } from "@components/Button.tsx";
 import { PageHeader } from "@components/Header/PageHeader.tsx";
 import { GridList } from "@components/GridList.tsx";
 import { useOverlayRenderer as useModal } from "@contexts/useOverlayRenderer.tsx";
 import { Page } from "@components/Page.tsx";

 export function Users() {
     const { users, addUser } = useUsers();
     const { isAdmin } = useAuth();
     const { organisations } = useOrganisations();
     const breadcrumbs = useBreadcrumbs();
     const { pushModal, popModal } = useModal();
+    const [userFilter, setUserFilter] = useState("");

     const [organisationFilter, setOrganisationFilter] =
         useState<FetchedOrganisationData | null>(null);

     // TODO generic type error found, review fast fixx
     const organisationFilterOptions = useMemo<DropDownOption<string>[]>(
         () => organisations.map((org) => ({ value: org.id, label: org.name })),
         [organisations],
     );
     const emptyFilterDropdownOption = useMemo<DropDownOption<string>>(
         () => ({ label: "All Organisations", value: undefined }),
         [],
     );

     const addNewUser = useCallback(
         async (data: CreateUserData) => {
             popModal();
             await addUser(data);
         },
         [addUser],
     );

     const organisationFilterSelect = useCallback(
         (id: string) => {
             setOrganisationFilter(
                 organisations.find((org) => org.id === id) ?? null,
             );
         },
         [organisations],
     );

+    const filteredUsers = useMemo(() => {
+        return users.filter(user => 
+            user.email.toLowerCase().includes(userFilter.toLowerCase()) ||
+            user.name.toLowerCase().includes(userFilter.toLowerCase())
+        );
+    }, [users, userFilter]);

     useEffect(() => {
         breadcrumbs.setCrumbs([{ label: "Users", link: "/users" }]);
     }, []);

     return (
         <Page>
             <PageHeader
-                title={"Users"}
+                title="Users"
+                subtitle={`${users.length} user${users.length !== 1 ? 's' : ''} registered`}
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
                                         <UserForm add={addNewUser} />
                                     </Modal>,
                                 )
                             }
+                            aria-label="Add new user"
                         >
-                            <IconPlus className={"aspect-square h-[80%]"} />
+                            <IconPlus className="h-5 w-5" />
+                            <span className="hidden sm:inline">Add User</span>
                         </Button>
                     )
                 }
             >
-                <GridList
-                    columnSizes={[
-                        "minmax(250px, auto)",
-                        "1fr",
-                        "minmax(250px, auto)",
-                    ]}
-                >
-                    <div>
+                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
+                    <div className="relative flex-1">
+                        <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                         <input
-                            type={"text"}
-                            className={
-                                "rounded-lg border border-black/20 px-4 py-2 !outline-0 focus:border-black/45"
-                            }
-                            placeholder={"Filter users"}
+                            type="text"
+                            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm transition-colors focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
+                            placeholder="Search users..."
+                            value={userFilter}
+                            onChange={(e) => setUserFilter(e.target.value)}
+                            aria-label="Filter users"
                         />
                     </div>
-                    <div />
-                    <div>
+                    <div className="w-full sm:w-64">
                         <DropDown
                             options={organisationFilterOptions}
                             selected={organisationFilter?.id ?? undefined}
                             changed={organisationFilterSelect}
                             emptyOption={emptyFilterDropdownOption}
-                            placeholder={"All Organisations"}
+                            placeholder="All Organisations"
                             filterable={true}
                         />
                     </div>
-                </GridList>
+                </div>
             </PageHeader>
+            
             <motion.div
                 initial={{ opacity: 0.5 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0.5 }}
-                className={"h-full"}
+                className="h-full p-4 lg:p-6"
             >
-                <div className={"flex h-full min-w-0 gap-4"}>
-                    <UserList
-                        users={users}
+                <div className="flex h-full min-w-0">
+                    <UserListTable
+                        users={filteredUsers}
                         manageOrganisations={(user) =>
                             pushModal(
                                 <Modal
                                     close={() => popModal()}
                                     className={"w-full max-w-xl"}
                                 >
                                     <AssignUserToOrganisation user={user} />
                                 </Modal>,
                             )
                         }
                         organisationFilter={organisationFilter}
                     />
                 </div>
             </motion.div>
         </Page>
     );
 }

-function UserList({
+function UserListTable({
     users,
     manageOrganisations,
     organisationFilter,
 }: {
     users: FetchedUserData[];
     manageOrganisations: (user: FetchedUserData) => void;
     organisationFilter: FetchedOrganisationData | null;
 }) {
     return (
-        <GridTable columnSizes={["1fr", "auto", "auto"]}>
+        <GridTable columnSizes={["2fr", "1fr", "auto"]} className="w-full">
             <GridTableHeaders>
-                <div className={"p-2"}>Email</div>
-                <div className={"p-2"}>Role</div>
-                <div className={"p-2"}>Organisations</div>
+                <div className="p-4 font-semibold">User</div>
+                <div className="p-4 font-semibold">Role</div>
+                <div className="p-4 font-semibold">Actions</div>
             </GridTableHeaders>
             <GridTableBody>
-                {users.map((u) => (
-                    <UserRow
-                        user={u}
-                        manageOrganisations={manageOrganisations}
-                        organisationFilter={organisationFilter}
-                    />
-                ))}
+                {users.length === 0 ? (
+                    <GridTableRow className="items-center py-8">
+                        <div className="col-span-full text-center">
+                            <IconUsers className="mx-auto mb-2 h-8 w-8 text-gray-400" />
+                            <p className="text-gray-600">No users found</p>
+                        </div>
+                    </GridTableRow>
+                ) : (
+                    users.map((u) => (
+                        <UserRow
+                            key={u.id}
+                            user={u}
+                            manageOrganisations={manageOrganisations}
+                            organisationFilter={organisationFilter}
+                        />
+                    ))
+                )}
             </GridTableBody>
         </GridTable>
     );
 }

 function UserRow({
     user,
     organisationFilter,
     manageOrganisations,
 }: {
     user: FetchedUserData;
     organisationFilter: FetchedOrganisationData | null;
     manageOrganisations: (user: FetchedUserData) => void;
 }) {
     const { data: userOrganisations } = useUserOrganisations(user.id);
     if (
         organisationFilter &&
         !userOrganisations.some((org) => org.id === organisationFilter.id)
     )
         return null;

     return (
         <GridTableRow
-            className={"items-center whitespace-nowrap py-2 even:bg-black/5"}
+            className="items-center border-b border-gray-100 py-4 transition-colors hover:bg-gray-50"
         >
-            <p className={"px-2"}>{user.email}</p>
-            <p className={"px-2"}>{user.role}</p>
-            <div className={"flex justify-center"}>
+            <div className="px-4">
+                <div className="flex flex-col">
+                    <p className="font-medium text-gray-900">{user.name}</p>
+                    <p className="text-sm text-gray-600">{user.email}</p>
+                </div>
+            </div>
+            <div className="px-4">
+                <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
+                    {user.role}
+                </span>
+            </div>
+            <div className="px-4">
                 <Button
-                    className={
-                        "rounded-lg bg-red-400 px-3 py-1.5 font-semibold"
-                    }
+                    variant="secondary"
+                    size="sm"
                     onClick={() => manageOrganisations(user)}
+                    aria-label={`Manage organisations for ${user.name}`}
                 >
                     Manage
                 </Button>
             </div>
         </GridTableRow>
     );
 }

 function AssignUserToOrganisation({ user }: { user: FetchedUserData }) {
     const { organisations } = useOrganisations();
     const { data: userOrganisations } = useUserOrganisations(user.id);
     const invalidateOrganisationUser = useInvalidateOrganisationUsers();
     const { mutateAsync: addUserToOrganisationRequest } =
         useAddOrganisationUser();
     const { mutateAsync: removeUserOfOrganisationRequest } =
         useRemoveOrganisationUser();
     const [selected, setSelected] = useState<string>();

     const addUserToOrganisation = useCallback(async () => {
         setSelected("");
         await addUserToOrganisationRequest({
             organisationId: selected,
             data: { email: user.email },
         });
         await invalidateOrganisationUser(selected, user.id);
     }, [
         addUserToOrganisationRequest,
         selected,
         user.email,
         invalidateOrganisationUser,
     ]);

     const removeUserOfOrganisation = useCallback(
         async (id: string) => {
             await removeUserOfOrganisationRequest({
                 organisationId: id,
                 data: { userId: user.id },
             });
             await invalidateOrganisationUser(id, user.id);
         },
         [
             addUserToOrganisationRequest,
             user.id,
             selected,
             invalidateOrganisationUser,
         ],
     );

     return (
-        <div className={"flex flex-col gap-2"}>
-            <div className={"flex gap-3"}>
+        <div className="space-y-6">
+            <div>
+                <h3 className="text-lg font-semibold text-gray-900 mb-2">
+                    Manage Organisations for {user.name}
+                </h3>
+                <p className="text-sm text-gray-600">
+                    Add or remove this user from organisations
+                </p>
+            </div>
+            
+            <div className="flex gap-3">
                 <DropDown
                     options={organisations
                         .filter(
                             (org) =>
                                 !userOrganisations.some(
                                     (userOrg) => userOrg.id === org.id,
                                 ),
                         )
                         .map((org) => ({ value: org.id, label: org.name }))}
                     selected={selected}
-                    placeholder={"Select Organisations"}
-                    className={"flex-grow"}
+                    placeholder="Select organisation"
+                    className="flex-1"
                     changed={setSelected}
                 />
-                <button
-                    className={
-                        "flex items-center gap-2 rounded-xl bg-green-400 px-3 py-2"
-                    }
+                <Button
+                    variant="primary"
                     onClick={addUserToOrganisation}
+                    disabled={!selected}
+                    aria-label="Add user to selected organisation"
                 >
-                    <IconPlus className={"aspect-square w-[24px]"} />
-                    Add
-                </button>
+                    <IconPlus className="h-4 w-4" />
+                    <span className="hidden sm:inline">Add</span>
+                </Button>
             </div>
-            <div className="max-h-[350px] overflow-hidden rounded-lg border border-black/20">
+            
+            <div className="max-h-80 overflow-hidden rounded-xl border border-gray-200 bg-white">
                 <div className="h-full overflow-auto">
-                    <div className={"grid max-w-full grid-cols-[1fr_auto]"}>
+                    <div className="grid max-w-full grid-cols-[1fr_auto]">
                         <div
                             className={
-                                "col-span-2 grid grid-cols-subgrid border-b border-black/20 bg-black/10 text-left text-sm font-semibold"
+                                "col-span-2 grid grid-cols-subgrid border-b border-gray-200 bg-gray-50 text-left text-sm font-semibold text-gray-900"
                             }
                         >
-                            <div className={"p-2"}>Organisation</div>
+                            <div className="p-4">Current Organisations</div>
+                            <div className="p-4">Actions</div>
                         </div>
                         {userOrganisations.length === 0 && (
-                            <p
+                            <div
                                 className={
-                                    "col-span-2 p-2 text-center text-black/55"
+                                    "col-span-2 p-8 text-center"
                                 }
                             >
-                                No organisations assigned!
-                            </p>
+                                <IconUsers className="mx-auto mb-2 h-8 w-8 text-gray-400" />
+                                <p className="text-gray-600">No organisations assigned</p>
+                            </div>
                         )}
                         {userOrganisations.map((org) => (
                             <div
                                 className={
-                                    "col-span-2 grid grid-cols-subgrid text-left text-sm even:bg-black/5"
+                                    "col-span-2 grid grid-cols-subgrid border-b border-gray-100 text-left text-sm transition-colors hover:bg-gray-50"
                                 }
                                 key={org.id}
                             >
-                                <div className="flex items-center whitespace-nowrap p-2">
-                                    {org.name}
+                                <div className="flex items-center p-4">
+                                    <span className="font-medium text-gray-900">{org.name}</span>
                                 </div>
-                                <button
-                                    className="p-2"
+                                <div className="flex items-center justify-center p-4">
+                                    <Button
+                                        variant="ghost"
+                                        size="sm"
                                     onClick={() =>
                                         removeUserOfOrganisation(org.id)
                                     }
+                                        aria-label={`Remove user from ${org.name}`}
                                 >
-                                    <IconX
-                                        className={"aspect-square w-[24px]"}
-                                        color={"#ef4444"}
-                                    />
-                                </button>
+                                        <IconX className="h-4 w-4 text-red-500" />
+                                    </Button>
+                                </div>
                             </div>
                         ))}
                     </div>
                 </div>
             </div>
         </div>
     );
 }