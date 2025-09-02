import { FormEvent, useCallback, useMemo, useState } from "react";
import {
    FetchedUserData,
    UpdateUserData,
    CreateUserData,
} from "@360models.platform/types/DTO/users";
import { DropDown } from "@components/CustomInputs/DropDown.tsx";
import {
    RoleTypeArray,
    RoleTypes,
} from "@360models.platform/types/SharedData/users";

type Props = {
    data?: FetchedUserData;
    add: (data: CreateUserData) => void;
    update?: (data: UpdateUserData, original: FetchedUserData) => void;
    showRoleOption?: boolean;
};

export function UserForm({
    data = null,
    add,
    update,
    showRoleOption = true,
}: Props) {
    const [name, setName] = useState(data?.name ?? "");
    const [email, setEmail] = useState(data?.email ?? "");
    const [role, setRole] = useState(data?.role ?? "User");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const isAdd = useMemo(() => data === null, [data]);

    const execute = useCallback(
        async (e: FormEvent) => {
            e.preventDefault();
            if (password !== confirmPassword) {
                //TODO notify user that password is too weak
                return;
            }
            isAdd
                ? add({
                      name: name,
                      email: email,
                      password: password,
                      role: role,
                  })
                : update?.(
                      {
                          name: name,
                          email: email,
                          password: password ? password : undefined,
                          role: role,
                      },
                      data,
                  );
        },
        [
            add,
            update,
            name,
            email,
            password,
            confirmPassword,
            role,
            data,
            isAdd,
        ],
    );

    return (
        <form className={"flex w-full flex-col gap-4"} onSubmit={execute}>
            <div className={"flex flex-col gap-1"}>
                <div className={"flex items-center justify-between gap-2"}>
                    <label htmlFor={"name"}>Name:</label>
                    <div
                        className={
                            "rounded-xl bg-red-500 px-1.5 py-0.5 text-xs text-white"
                        }
                    >
                        Required
                    </div>
                </div>
                <input
                    id={"name"}
                    type={"name"}
                    className={
                        "rounded-lg border-2 border-gray-300 bg-gray-200 px-3 py-2 shadow-md outline-0"
                    }
                    value={name}
                    autoComplete={"name"}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
            <div className={"flex flex-col gap-1"}>
                <div className={"flex items-center justify-between gap-2"}>
                    <label htmlFor={"name"}>Email:</label>
                    <div
                        className={
                            "rounded-xl bg-red-500 px-1.5 py-0.5 text-xs text-white"
                        }
                    >
                        Required
                    </div>
                </div>
                <input
                    id={"email"}
                    type={"email"}
                    className={
                        "rounded-lg border-2 border-gray-300 bg-gray-200 px-3 py-2 shadow-md outline-0"
                    }
                    value={email}
                    autoComplete={"email"}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className={"flex flex-col gap-1"}>
                <div className={"flex items-center justify-between gap-2"}>
                    <label htmlFor={"password"}>Password:</label>
                    {isAdd && (
                        <div
                            className={
                                "rounded-xl bg-red-500 px-1.5 py-0.5 text-xs text-white"
                            }
                        >
                            Required
                        </div>
                    )}
                </div>
                <input
                    id={"password"}
                    type={"password"}
                    autoComplete={"new-password"}
                    className={
                        "rounded-lg border-2 border-gray-300 bg-gray-200 px-3 py-2 shadow-md outline-0"
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            {(password || isAdd) && (
                <div className={"flex flex-col gap-1"}>
                    <div className={"flex items-center justify-between gap-2"}>
                        <label htmlFor={"password"}>Confirm Password:</label>
                        {isAdd && (
                            <div
                                className={
                                    "rounded-xl bg-red-500 px-1.5 py-0.5 text-xs text-white"
                                }
                            >
                                Required
                            </div>
                        )}
                    </div>
                    <input
                        id={"password"}
                        type={"password"}
                        autoComplete={"new-password"}
                        className={
                            "rounded-lg border-2 border-gray-300 bg-gray-200 px-3 py-2 shadow-md outline-0"
                        }
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>
            )}
            {showRoleOption && (
                <div className={"flex flex-col gap-1"}>
                    <div className={"flex items-center justify-between gap-2"}>
                        <label>Role:</label>
                        <div
                            className={
                                "rounded-xl bg-red-500 px-1.5 py-0.5 text-xs text-white"
                            }
                        >
                            Required
                        </div>
                    </div>
                    <DropDown
                        options={RoleTypeArray.map((role) => ({
                            label: role,
                            value: role,
                        }))}
                        selected={role}
                        changed={(opt: RoleTypes) => setRole(opt)}
                    />
                </div>
            )}
            <button
                type={"submit"}
                className={
                    "rounded-lg border-2 border-blue-300 bg-blue-200 px-4 py-2 font-semibold uppercase shadow-lg"
                }
            >
                {isAdd ? "Add" : "Update"} User
            </button>
        </form>
    );
}
