import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { ACTIONS } from "../state/actions"
import type { RootState } from "../state/State"
import { TimeSlider } from "../time_control/TimeSlider"



const map_state = (state: RootState) => ({
    events: state.derived.project_priorities_meta.project_priority_events,
})

const map_dispatch = {
    change_display_at_created_datetime: ACTIONS.display_at_created_datetime.change_display_at_created_datetime,
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>


function _PrioritiesContentControls (props: Props)
{
    return <TimeSlider
        get_handle_ms={state => state.routing.args.created_at_ms}
        change_handle_ms={ms => props.change_display_at_created_datetime({ ms })}
        events={props.events}
        data_set_name="priorities"
    />
}

export const PrioritiesContentControls = connector(_PrioritiesContentControls) as FunctionalComponent<{}>