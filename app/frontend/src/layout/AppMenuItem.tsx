import { ComponentChildren, FunctionComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import { MenuItem as MaterialMenuItem } from "@material-ui/core"

import type { RootState } from "../state/State"
import { Link } from "../sharedf/Link"
import type { ROUTE_TYPES } from "../state/routing/interfaces"
import { CreationContextTabTitle } from "../creation_context/CreationContextTabTitle"
import { FilterContextTabTitle } from "../filter_context/FilterContextTabTitle"
import { ACTIONS } from "../state/actions"
import { route_to_text } from "./route_to_text"



interface OwnProps
{
    id: ROUTE_TYPES
    on_pointer_down: () => void
}

function get_title (id: ROUTE_TYPES)
{

    if (id === "filter") return <FilterContextTabTitle />
    else if (id === "creation_context") return <CreationContextTabTitle />
    else return route_to_text(id)
}

const map_state = (state: RootState) => ({ current_route: state.routing.route })
const map_dispatch = { change_route: ACTIONS.routing.change_route }

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps

function _AppMenuItem (props: Props)
{
    const title = get_title(props.id)
    return <CustomisableAppMenuItem
        on_pointer_down={() =>
        {
            // TODO remove this call of `change_route` once the <Button /> in <Link /> takes
            // up all the horizontal space
            props.change_route({ route: props.id, sub_route: null, item_id: null })
            props.on_pointer_down()
        }}
    >
        <Link
            route={props.id}
            sub_route={null}
            item_id={null}
            args={undefined}
            on_pointer_down={props.on_pointer_down}
        >
            {title}
        </Link>
    </CustomisableAppMenuItem>
}

export const AppMenuItem = connector(_AppMenuItem) as FunctionComponent<OwnProps>



export function CustomisableAppMenuItem (props: { on_pointer_down: () => void } & { children: ComponentChildren })
{
    return <MaterialMenuItem
        style={{ display: "flex", justifyContent: "flex-start", padding: "0.5em" }}
        onPointerDown={(e: h.JSX.TargetedEvent<HTMLDivElement, MouseEvent>) =>
        {
            e.stopImmediatePropagation()
            props.on_pointer_down()
        }}
    >
        {props.children}
    </MaterialMenuItem>
}
