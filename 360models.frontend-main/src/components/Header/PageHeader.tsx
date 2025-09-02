import { PropsWithChildren, ReactNode } from "react";
import { Button } from "@components/Button.tsx";
import { useLayout } from "@contexts/UseLayout.tsx";
import { IconMenu } from "@tabler/icons-react";

type Props = {
    title: string;
    subtitle?: string;
    primaryActionElement?: ReactNode;
    secondaryActionElement?: ReactNode;
    beforeTitleElement?: ReactNode;
    extraRightElement?: ReactNode;
} & PropsWithChildren;

export function PageHeader({
    title,
    subtitle,
    primaryActionElement,
    secondaryActionElement,
    beforeTitleElement,
    extraRightElement,
    children,
}: Props) {
    const layout = useLayout();

    return (
        <div className="border-b-2 border-black/5 px-4">
            <div className="flex items-center justify-center gap-5 py-4 xs:justify-start">
                {layout.type === "Panel" && (
                    <div className="lg:hidden">
                        <Button
                            className="max-w-xs rounded-lg bg-red-400 px-3 py-2 shadow-md disabled:cursor-default disabled:bg-[#915757]/60"
                            onClick={layout.openNavbar}
                        >
                            <IconMenu className="aspect-square h-full" />
                        </Button>
                    </div>
                )}

                <div className={`${!children && "hidden xs:block"}`}>
                    {beforeTitleElement}
                </div>

                <div className="flex flex-col gap-1">
                    <h2 className="text-4xl font-bold sm:text-5xl">{title}</h2>
                    {subtitle && (
                        <p className="text-sm text-black/75">{subtitle}</p>
                    )}
                </div>

                <div className={`flex-grow ${!children && "hidden xs:block"}`}>
                    {children}
                </div>

                <div className="flex items-center gap-2">
                    {primaryActionElement}
                    {secondaryActionElement}
                    {extraRightElement && (
                        <div className="ml-2">{extraRightElement}</div>
                    )}
                </div>
            </div>
        </div>
    );
}
