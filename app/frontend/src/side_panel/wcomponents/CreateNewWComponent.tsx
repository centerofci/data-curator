import { Button, ButtonGroup } from "@mui/material"
import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import "./CreateNewWComponent.css"
import { Button as FrontendButton } from "../../sharedf/Button"
import { get_current_composed_knowledge_view_from_state } from "../../state/specialised_objects/accessors"
import type { RootState } from "../../state/State"
import { create_wcomponent } from "../../state/specialised_objects/wcomponents/create_wcomponent_type"
import { selector_chosen_base_id } from "../../state/user_info/selector"
import { ACTIONS } from "../../state/actions"
import { WComponentType, wcomponent_types } from "../../wcomponent/interfaces/wcomponent_base"
import { wcomponent_type_to_text } from "../../wcomponent_derived/wcomponent_type_to_text"



const map_state = (state: RootState) => ({
    // a_selected_wcomponent_id: state.meta_wcomponents.selected_wcomponent_ids_list[0] || "",
    current_knowledge_view: get_current_composed_knowledge_view_from_state(state),
    editing: !state.display_options.consumption_formatting,
    base_id: selector_chosen_base_id(state),
})

const map_dispatch = {
    toggle_consumption_formatting: ACTIONS.display.toggle_consumption_formatting,
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>

function _CreateNewWComponent (props: Props)
{
    const {
        // a_selected_wcomponent_id: judgement_target_wcomponent_id,
        current_knowledge_view,
        editing,
        base_id,
    } = props

    if (!editing) return <div class="create_new_wcomponent">
        <FrontendButton onClick={() => props.toggle_consumption_formatting({})}>
            Swap to editing
        </FrontendButton>
    </div>

    if (base_id === undefined) return <div class="create_new_wcomponent">Select a base first.</div>

    if (!current_knowledge_view) return <div class="create_new_wcomponent">
        <h3>
            Create new component
        </h3>

        <p>Please select a knowledge view first</p>
    </div>


    return <div class="create_new_wcomponent">
        <h3>
            Create new component
        </h3>
        <ButtonGroup fullWidth={true} color="primary" variant="contained" orientation="vertical">
            {wcomponent_types.map(type => <Button onClick={() => create_wcomponent_type(base_id, type)}>
                {wcomponent_type_to_text(type)}
            </Button>)}
        </ButtonGroup>
        {/* {types.map(type => <Button
            value={type}
            extra_class_names="creation_option left"
            size="normal"
            on_pointer_down={() => create_wcomponent_type(type)}
        />)} */}
    </div>
}

export const CreateNewWComponent = connector(_CreateNewWComponent) as FunctionalComponent<{}>



function create_wcomponent_type (base_id: number, type: WComponentType)
{
    create_wcomponent({ wcomponent: { base_id, type } })
}
