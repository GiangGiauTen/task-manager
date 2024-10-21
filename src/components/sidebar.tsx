import Link from "next/link"
import Image from "next/image"
import { DottedSeparator } from "./dotted-separator"
import { Navigation } from "./navigation"
import { WorkspaceSwitcher } from "./workspace-switcher"
import { Projects } from "./projects"

export const Sidebar = () => {
    return (
        <aside className="h-full bg-neutral-100 p-4 w-full">
            <Link href={"/"}>
            <Image src={"/logo.svg"} alt="logo" width={164} height={48}/>
            </Link>
            <DottedSeparator classname="my-4"/>
            <WorkspaceSwitcher/>
            <DottedSeparator classname="my-4"/>

            <Navigation/>
            <DottedSeparator classname="my-4"/>
<Projects />
        </aside>
    )
}