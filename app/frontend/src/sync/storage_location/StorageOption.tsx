import EditIcon from "@mui/icons-material/Edit"
import type { User as SupabaseAuthUser } from "@supabase/supabase-js"

import "./StorageOption.scss"
import type { SupabaseKnowledgeBaseWithAccess, SupabaseUsersById } from "../../supabase/interfaces"
import { get_user_name_for_display } from "../../supabase/users"



interface OwnProps
{
    user: SupabaseAuthUser | undefined
    users_by_id: SupabaseUsersById
    base: SupabaseKnowledgeBaseWithAccess
    selected: boolean
    on_click: () => void
    on_click_edit: () => void
}


export function StorageOption (props: OwnProps)
{
    const { user, users_by_id, base, selected, on_click, on_click_edit } = props

    const { title, public_read, access_level } = base

    const access_description = access_level === "owner" ? "Editor (Owner)"
        : access_level === "editor" ? "Editor"
        : access_level === "viewer" ? "Viewer"
        : base.public_read ? "Viewer (public access)" : "?"

    return <tr
        className={"base_option " + (selected ? "selected" : "") }
        onClick={on_click}
    >
        <td className="narrow"><input type="radio" checked={selected} style={{ cursor: "pointer" }} /></td>
        <td>
            {title || "(No title)"}
        </td>
        <td>{public_read && "(Public)"}</td>

        <td>{get_user_name_for_display({ users_by_id, current_user_id: user?.id, other_user_id: base.owner_user_id })}</td>
        <td>{access_description}</td>

        {/* <td className="narrow" style={{ color: "grey", fontSize: 12 }}>{id}</td> */}
        <td className="narrow edit_title" onClick={!base.can_edit ? undefined : e =>
            {
                e.stopImmediatePropagation()
                on_click_edit()
            }}
        >
            {base.can_edit && <EditIcon />}
        </td>
    </tr>
}
