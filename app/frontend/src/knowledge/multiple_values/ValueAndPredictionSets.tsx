import { FunctionalComponent, h } from "preact"

import "./ValueAndPredictionSets.css"
import type {
    StateValueAndPredictionsSet,
} from "../../shared/wcomponent/interfaces/state"
import { partition_and_prune_items_by_datetimes } from "../../shared/wcomponent/utils_datetime"
import type { RootState } from "../../state/State"
import { connect, ConnectedProps } from "react-redux"
import { ValueAndPredictionSetsComponent } from "./ValueAndPredictionSetsComponent"
import { get_wcomponent_VAP_set_counterfactuals } from "../../state/derived/accessor"
import type { VAPsType } from "../../shared/wcomponent/interfaces/generic_value"



interface OwnProps
{
    wcomponent_id: string
    VAPs_represent: VAPsType
    values_and_prediction_sets: StateValueAndPredictionsSet[]
    update_values_and_predictions: (values_and_predictions: StateValueAndPredictionsSet[]) => void
}


const map_state = (state: RootState, own_props: OwnProps) =>
{
    const VAP_set_counterfactuals_map = get_wcomponent_VAP_set_counterfactuals(state, own_props.wcomponent_id)

    return {
        created_at_ms: state.routing.args.created_at_ms,
        sim_ms: state.routing.args.sim_ms,
        VAP_set_counterfactuals_map,
        creation_context: state.creation_context,
        editing: !state.display_options.consumption_formatting,
    }
}



const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps


function _ValueAndPredictionSets (props: Props)
{
    const { wcomponent_id, VAP_set_counterfactuals_map, values_and_prediction_sets, VAPs_represent } = props
    const { invalid_future_items, invalid_past_items, past_items, present_items, future_items } = partition_and_prune_items_by_datetimes({
        items: values_and_prediction_sets,
        created_at_ms: props.created_at_ms,
        sim_ms: props.sim_ms,
    })

    return <ValueAndPredictionSetsComponent
        wcomponent_id={wcomponent_id}
        VAP_set_counterfactuals_map={VAP_set_counterfactuals_map}

        item_descriptor="Value"
        VAPs_represent={VAPs_represent}
        update_items={props.update_values_and_predictions}

        values_and_prediction_sets={values_and_prediction_sets}
        invalid_future_items={invalid_future_items}
        invalid_past_items={invalid_past_items}
        past_items={past_items}
        present_items={present_items}
        future_items={future_items}

        creation_context={props.creation_context}
        editing={props.editing}
    />
}

export const ValueAndPredictionSets = connector(_ValueAndPredictionSets) as FunctionalComponent<OwnProps>
