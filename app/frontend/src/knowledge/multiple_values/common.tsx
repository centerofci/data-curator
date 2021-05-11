import { h } from "preact"

import "./common.css"
import type {
    WComponentStateV2SubType,
    StateValueAndPredictionsSet,
    StateValueAndPrediction,
} from "../../shared/models/interfaces/state"
import { get_probable_VAP_set_values, get_VAP_set_prob, get_VAP_set_conviction } from "../../sharedf/wcomponent_state"
import { UncertainDateTime } from "../uncertainty/datetime"
import { set_VAP_probabilities } from "./utils"
import { ValueAndPredictions } from "./ValueAndPredictions"
import type { VAP_id_counterfactual_map, VAP_set_id_counterfactual_map } from "../../state/derived/State"
import { merge_counterfactuals_into_VAPs } from "../counterfactuals/merge"
import { SummaryForPrediction } from "../predictions/common"
import { EditableText } from "../../form/EditableText"
import { EditablePercentage } from "../../form/EditablePercentage"



export const get_summary_for_single_VAP_set = (subtype: WComponentStateV2SubType, show_created_at: boolean, VAP_counterfactuals_map: VAP_id_counterfactual_map | undefined) => (VAP_set: StateValueAndPredictionsSet, on_change: (item: StateValueAndPredictionsSet) => void): h.JSX.Element =>
{
    let VAPs = get_VAPs_from_set(VAP_set, subtype)
    VAPs = merge_counterfactuals_into_VAPs(VAPs, VAP_counterfactuals_map)
    VAP_set = { ...VAP_set, entries: VAPs }

    const values = get_probable_VAP_set_values(VAP_set, subtype)
    const prob = get_VAP_set_prob(VAP_set, subtype) + " %"
    const conv = get_VAP_set_conviction(VAP_set, subtype) + " %"

    return <SummaryForPrediction
        created_at={show_created_at ? (VAP_set.custom_created_at || VAP_set.created_at) : undefined}
        value={subtype !== "boolean" ? values : ""}
        datetime={VAP_set.datetime}
        probability={prob}
        conviction={conv}
    />
}



export const get_details_for_single_VAP_set = (subtype: WComponentStateV2SubType, wcomponent_id?: string, VAP_set_counterfactuals_map?: VAP_set_id_counterfactual_map) => (VAP_set: StateValueAndPredictionsSet, on_change: (item: StateValueAndPredictionsSet) => void): h.JSX.Element =>
{
    const VAPs = get_VAPs_from_set(VAP_set, subtype)
    const VAP_counterfactuals_map = VAP_set_counterfactuals_map && VAP_set_counterfactuals_map[VAP_set.id]

    return <div className="VAP_set_details">
        <br />
        <UncertainDateTime
            datetime={VAP_set.datetime}
            on_change={datetime => on_change({ ...VAP_set, datetime })}
        />
        <br />
        <div>
            <ValueAndPredictions
                wcomponent_id={wcomponent_id}
                VAP_set_id={VAP_set.id}
                created_at={get_custom_created_at(VAP_set) || get_created_at(VAP_set)}
                subtype={subtype}
                values_and_predictions={VAPs}
                VAP_counterfactuals_map={VAP_counterfactuals_map}
                update_values_and_predictions={VAPs => on_change(merge_entries(VAPs, VAP_set, subtype))}
            />
        </div>
        <br />
        <br />
    </div>
}



export const get_details2_for_single_VAP_set = (subtype: WComponentStateV2SubType) => (VAP_set: StateValueAndPredictionsSet, on_change: (item: StateValueAndPredictionsSet) => void): h.JSX.Element =>
{
    const shared_entry_values = VAP_set.shared_entry_values || {}
    // Provide the explanations from exist VAPs
    const VAP_explanations = VAP_set.entries
        .map(({ explanation }) => explanation.trim())
        .filter(explanation => explanation)
        .join("\n\n")
    const explanation = shared_entry_values.explanation || VAP_explanations || ""
    const conviction = shared_entry_values.conviction || 1


    const is_boolean = subtype === "boolean"


    return <div className="shared_VAP_set_details">
        <div className="row_one">
            <div>Explanation:</div>
            {!is_boolean && <div>Cn: &nbsp; <EditablePercentage
                disabled={false}
                placeholder="..."
                value={conviction}
                on_change={conviction =>
                {
                    const shared_entry_values = { ...VAP_set.shared_entry_values, conviction }
                    // Overwrite all the existing convictions with this conviction
                    const entries = VAP_set.entries.map(e => ({ ...e, conviction }))
                    on_change({ ...VAP_set, entries, shared_entry_values })
                }}
            /></div>}
        </div>
        <EditableText
            placeholder="..."
            value={explanation}
            on_change={explanation =>
            {
                const shared_entry_values = { ...VAP_set.shared_entry_values, explanation }
                on_change({ ...VAP_set, shared_entry_values })
            }}
        />

        <br />
    </div>
}



const get_created_at = (item: StateValueAndPredictionsSet) => item.created_at
const get_custom_created_at = (item: StateValueAndPredictionsSet) => item.custom_created_at



function get_VAPs_from_set (VAP_set: StateValueAndPredictionsSet, subtype: string)
{
    let VAPs = VAP_set.entries

    if (subtype === "boolean" && VAPs.length !== 1)
    {
        // ensure the ValueAndPrediction component always and only receives up to a single VAP entry
        const entries = VAPs.slice(0, 1)
        return entries
    }

    VAPs = set_VAP_probabilities(VAP_set.entries)

    return VAPs
}



function merge_entries (VAPs: StateValueAndPrediction[], VAP_set: StateValueAndPredictionsSet, subtype: string): StateValueAndPredictionsSet
{
    if (subtype === "boolean")
    {
        // For now we'll save any other values that were already here from other subtypes
        VAPs = VAPs.concat(VAP_set.entries.slice(1))
    }

    return { ...VAP_set, entries: VAPs }
}
