import { VAPsType } from "../wcomponent/interfaces/VAPsType"
import type {
    ComposedCounterfactualV2StateValueAndPredictionSet,
} from "../wcomponent/interfaces/counterfactual"
import { calc_prediction_certainty, calc_prediction_is_uncertain } from "./prediction_uncertainty"
import {
    partition_and_prune_items_by_datetimes_and_versions,
} from "./value_and_prediction/partition_and_prune_items_by_datetimes_and_versions"
import { WComponent, wcomponent_is_allowed_to_have_state_VAP_sets } from "../wcomponent/interfaces/SpecialisedObjects"
import { get_wcomponent_VAPs_represent } from "../wcomponent/get_wcomponent_VAPs_represent"
import { get_VAPs_ordered_by_prob } from "./value_and_prediction/probable_VAPs"
import { apply_counterfactuals_v2_to_VAP_set } from "./value_and_prediction/apply_counterfactuals_v2_to_VAP_set"
import type { CurrentValueAndProbability } from "./interfaces/value"
import { parse_VAP_value } from "../wcomponent/value/parse_value"
import type { VAPSetIdToCounterfactualV2Map } from "./interfaces/counterfactual"
import { is_defined } from "../shared/utils/is_defined"



interface GetWComponentStateValueAndProbabilitiesArgs
{
    wcomponent: WComponent
    VAP_set_id_to_counterfactual_v2_map: VAPSetIdToCounterfactualV2Map | undefined
    created_at_ms: number
    sim_ms: number
}
interface GetWComponentStateValueAndProbabilitiesReturn
{
    most_probable_VAP_set_values: CurrentValueAndProbability[]
    any_uncertainty?: boolean
    counterfactual_applied?: boolean
    derived__using_value_from_wcomponent_ids?: string[]
}
export function get_wcomponent_state_value_and_probabilities (args: GetWComponentStateValueAndProbabilitiesArgs): GetWComponentStateValueAndProbabilitiesReturn
{
    const { wcomponent, VAP_set_id_to_counterfactual_v2_map, created_at_ms, sim_ms } = args


    if (!wcomponent_is_allowed_to_have_state_VAP_sets(wcomponent)) return { most_probable_VAP_set_values: [] }

    // todo should implement this fully?
    const wcomponents_by_id = {}
    const VAPs_represent = get_wcomponent_VAPs_represent(wcomponent, wcomponents_by_id)

    // Defensively set to empty array
    const { values_and_prediction_sets = [] } = wcomponent
    const { present_item: VAP_set } = partition_and_prune_items_by_datetimes_and_versions({
        items: values_and_prediction_sets, created_at_ms, sim_ms,
    })

    const counterfactual_VAP_set = VAP_set === undefined ? undefined : apply_counterfactuals_v2_to_VAP_set({
        VAP_set,
        VAP_set_id_to_counterfactual_v2_map,
    })

    const { most_probable_VAP_set_values, any_uncertainty } = get_most_probable_VAP_set_values(counterfactual_VAP_set, VAPs_represent)


    let derived__using_value_from_wcomponent_ids: string[] | undefined = [
        counterfactual_VAP_set?.active_counterfactual_v2_id,
        // Should this live in this function or a higher level function? Perhaps
        // we should only be returning `present_item?.active_counterfactual_v2_id`
        // from this `get_wcomponent_state_value_and_probabilities` function?
        wcomponent._derived__using_value_from_wcomponent_id,
    ].filter(is_defined)

    derived__using_value_from_wcomponent_ids = derived__using_value_from_wcomponent_ids.length
        ? derived__using_value_from_wcomponent_ids
        : undefined


    return {
        most_probable_VAP_set_values,
        any_uncertainty,
        counterfactual_applied: counterfactual_VAP_set?.has_any_counterfactual_applied,
        derived__using_value_from_wcomponent_ids,
    }
}



function get_most_probable_VAP_set_values (VAP_set: ComposedCounterfactualV2StateValueAndPredictionSet | undefined, VAPs_represent: VAPsType): { most_probable_VAP_set_values: CurrentValueAndProbability[], any_uncertainty: boolean }
{
    if (!VAP_set || VAP_set.entries.length === 0) return { most_probable_VAP_set_values: [], any_uncertainty: false }


    const VAPs_by_prob = get_VAPs_ordered_by_prob(VAP_set.entries, VAPs_represent)

    let any_uncertainty = false
    const most_probable_VAP_set_values: CurrentValueAndProbability[] = []

    VAPs_by_prob.forEach(VAP =>
    {
        const parsed_value = parse_VAP_value(VAP, VAPs_represent)
        const certainty = calc_prediction_certainty(VAP)

        const uncertain = calc_prediction_is_uncertain(VAP)
        any_uncertainty = any_uncertainty || uncertain

        const include = VAPs_represent === VAPsType.boolean || uncertain || VAP.probability !== 0
        if (include)
        {
            const VAP_set_value: CurrentValueAndProbability = {
                probability: VAP.probability,
                conviction: VAP.conviction,
                certainty,
                parsed_value,
                value_id: VAP.value_id,
            }
            most_probable_VAP_set_values.push(VAP_set_value)
        }
    })

    return { most_probable_VAP_set_values, any_uncertainty }
}
