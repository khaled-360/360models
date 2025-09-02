import { Page } from "@components/Page.tsx";
import { PageHeader } from "@components/Header/PageHeader.tsx";
import {
    IconArrowLeft,
    IconBulldozer,
    IconMoodSmile,
} from "@tabler/icons-react";
import { PreviousCrumb } from "@components/BreadCrumbs/PreviousBreadcrumb.tsx";
import { motion } from "framer-motion";

export function Construction() {
    return (
        <Page>
            <PageHeader
                title={"Page under construction..."}
                beforeTitleElement={
                    <PreviousCrumb className={"rounded-full p-3 shadow-sm"}>
                        <IconArrowLeft />
                    </PreviousCrumb>
                }
            />
            <motion.div
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0.5 }}
                className={"flex h-full flex-col items-center justify-center"}
            >
                <IconBulldozer width={128} height={128} strokeWidth={1} />
                <h3 className={"flex items-center gap-2 text-3xl"}>
                    This page is currently under construction, please come back
                    later! <IconMoodSmile height={32} width={32} />
                </h3>
            </motion.div>
        </Page>
    );
}
