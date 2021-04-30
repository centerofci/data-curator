import { FunctionalComponent, h } from "preact"

import "./ValueAndPredictionSets.css"
import type {
    StateValueAndPredictionsSet,
    WComponentStateV2SubType,
} from "../../shared/models/interfaces/state"
import { partition_and_prune_items_by_datetimes } from "../../shared/models/utils_datetime"
import type { RootState } from "../../state/State"
import { connect, ConnectedProps } from "react-redux"
import { ValueAndPredictionSetsComponent } from "./ValueAndPredictionSetsComponent"



interface OwnProps
{
    subtype: WComponentStateV2SubType
    values_and_prediction_sets: StateValueAndPredictionsSet[]
    update_values_and_predictions: (values_and_predictions: StateValueAndPredictionsSet[]) => void
}


const map_state = (state: RootState) => ({
    created_at_ms: state.routing.args.created_at_ms,
    sim_ms: state.routing.args.sim_ms,
})


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps


function _ValueAndPredictionSets (props: Props)
{
    const { values_and_prediction_sets, subtype } = props
    const { invalid_items, past_items, present_items, future_items } = partition_and_prune_items_by_datetimes({
        items: values_and_prediction_sets,
        created_at_ms: props.created_at_ms,
        sim_ms: props.sim_ms,
    })

    return <ValueAndPredictionSetsComponent
        item_descriptor="Value"
        values_and_prediction_sets={values_and_prediction_sets}
        subtype={subtype}
        update_items={props.update_values_and_predictions}

        invalid_items={invalid_items}
        past_items={past_items}
        present_items={present_items}
        future_items={future_items}
    />
}

export const ValueAndPredictionSets = connector(_ValueAndPredictionSets) as FunctionalComponent<OwnProps>
