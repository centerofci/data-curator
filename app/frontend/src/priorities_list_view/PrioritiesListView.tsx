import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import "./PrioritiesListView.css"
import { WComponentCanvasNode } from "../knowledge/canvas_node/WComponentCanvasNode"
import { MainArea } from "../layout/MainArea"
import type { WComponentNodeGoal } from "../shared/wcomponent/interfaces/goal"
import { alert_wcomponent_is_goal, alert_wcomponent_is_prioritisation } from "../shared/wcomponent/interfaces/SpecialisedObjects"
import { get_current_UI_knowledge_view_from_state } from "../state/specialised_objects/accessors"
import type { RootState } from "../state/State"
import { EditableNumber } from "../form/EditableNumber"
import { ExpandableListWithAddButton } from "../form/editable_list/ExpandableListWithAddButton"
import type { WComponentPrioritisation } from "../shared/wcomponent/interfaces/priorities"
import { factory_render_list_content } from "../form/editable_list/render_list_content"
import { ListHeaderAddButton } from "../form/editable_list/ListHeaderAddButton"



export function PrioritiesListView (props: {})
{
    return <MainArea
        main_content={<PrioritiesListViewContent />}
    />
}



const map_state = (state: RootState) =>
{
    const wcomponents_by_id = state.specialised_objects.wcomponents_by_id

    const kv = get_current_UI_knowledge_view_from_state(state)
    const goals: WComponentNodeGoal[] = []
    const prioritisations: WComponentPrioritisation[] = []

    if (kv)
    {
        kv.wc_ids_by_type.goal.forEach(id =>
        {
            const goal = wcomponents_by_id[id]

            if (!alert_wcomponent_is_goal(goal, id)) return

            goals.push(goal)
        })

        kv.wc_ids_by_type.prioritisation.forEach(id =>
        {
            const prioritisation = wcomponents_by_id[id]

            if (!alert_wcomponent_is_prioritisation(prioritisation, id)) return

            prioritisations.push(prioritisation)
        })
    }

    return {
        goals,
        prioritisations,
        editing: !state.display_options.consumption_formatting,
    }
}


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector>



function _PrioritiesListViewContent (props: Props)
{
    const { goals, prioritisations, editing } = props

    return <div className="priorities_list_view_content">
        <div className="goals">
            <h1>Potential</h1>

            {goals.map(goal => <div style={{ display: "flex" }}>
                <WComponentCanvasNode id={goal.id} on_graph={false} />

                <div>
                    <br />
                    <span class="description_label">Effort</span> &nbsp;
                    <EditableNumber placeholder="..." allow_undefined={false} value={0} on_change={new_effort => {}} />
                </div>

            </div>)}

            <h1>Prioritised</h1>
            <h1>Deprioritised</h1>
        </div>



        <div className="prioritisations">
            <div className="prioritisations_header">
                <h1>Prioritisations</h1>

                {editing && <ListHeaderAddButton
                    new_item_descriptor="Prioritisation"
                    on_pointer_down_new_list_entry={() => {}}
                />}
            </div>

            {factory_render_list_content({
                items: prioritisations, get_id: p => p.id, update_items: () => {}, item_top_props: {
                    get_summary: p => <div>{p.title}</div>, get_details: p => <div></div>
                },
            })({ disable_partial_collapsed: true, expanded_items: false, expanded_item_rows: false })}
        </div>
    </div>
}

const PrioritiesListViewContent = connector(_PrioritiesListViewContent) as FunctionalComponent<{}>
