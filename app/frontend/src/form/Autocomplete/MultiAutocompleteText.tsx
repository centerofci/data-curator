import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import { ACTIONS } from "../../state/actions"
import type { RootState } from "../../state/State"

import { AutocompleteOption, AutocompleteText } from "./AutocompleteText"
import { SelectedOption } from "./SelectedOption"



interface OwnProps <E extends AutocompleteOption = AutocompleteOption>
{
    placeholder: string
    selected_option_ids: string[]
    initial_search_term?: string
    options: E[]
    allow_none?: boolean
    on_focus?: () => void
    on_blur?: () => void
    on_change: (ids: E["id"][]) => void
    on_mouse_over_option?: (id: E["id"] | undefined) => void
    on_mouse_leave_option?: (id: E["id"] | undefined) => void
    extra_styles?: h.JSX.CSSProperties
    start_expanded?: boolean
}



const map_state = (state: RootState) => ({
    editing: !state.display_options.consumption_formatting,
})

const map_dispatch = {
    change_route: ACTIONS.routing.change_route,
}

const connector = connect(map_state, map_dispatch)
type Props<E extends AutocompleteOption> = ConnectedProps<typeof connector> & OwnProps<E>


function _MultiAutocompleteText <E extends AutocompleteOption> (props: Props<E>)
{
    const { editing, options, selected_option_ids } = props

    const filtered_options = options.filter(({ id }) => !selected_option_ids.includes(id))

    const option_by_id: { [id: string]: E } = {}
    options.forEach(option => option_by_id[option.id] = option)


    return <div className="multi_autocomplete">
        {editing && <AutocompleteText
            {...props}
            selected_option_id={undefined}
            options={filtered_options}
            on_change={id =>
            {
                if (id === undefined) return
                props.on_change([...selected_option_ids, id])
            }}
        />}

        {selected_option_ids.map(id => <SelectedOption
            editing={editing}
            option={option_by_id[id]}
            on_remove_option={removed_id =>
            {
                props.on_change(selected_option_ids.filter(id => id !== removed_id))
            }}
            on_mouse_over_option={props.on_mouse_over_option}
            on_mouse_leave_option={props.on_mouse_leave_option}
            on_pointer_down_selected_option={(e, id) =>
            {
                props.change_route({ item_id: id })
            }}
        />)}
    </div>
}

export const MultiAutocompleteText = connector(_MultiAutocompleteText) as FunctionalComponent<OwnProps>