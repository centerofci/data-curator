import { WComponent } from "../wcomponent/interfaces/SpecialisedObjects"
import { get_wcomponent_state_value_and_probabilities } from "./get_wcomponent_state_value_and_probabilities"
import type { VAPSetIdToCounterfactualV2Map } from "./interfaces/counterfactual"
import type { DerivedValueForUI } from "./interfaces/value"
import { get_boolean_representation, parsed_value_to_string } from "./value/parsed_value_presentation"



interface GetWcomponentStateUIValueArgs
{
    wcomponent: WComponent
    VAP_set_id_to_counterfactual_v2_map: VAPSetIdToCounterfactualV2Map | undefined
    created_at_ms: number
    sim_ms: number
}
// This function is called to populate the value shown under the component title
// * the `get_probable_VAP_set_values_for_display` function which populates the values of the VAP set summary
// * the `convert_VAP_set_to_VAP_visuals` function which gets the values to show in the component node state "table"
export function get_wcomponent_state_UI_value (args: GetWcomponentStateUIValueArgs): DerivedValueForUI | undefined
{
    const {
        most_probable_VAP_set_values,
        any_uncertainty,
        counterfactual_applied,
        derived__using_value_from_wcomponent_ids,
    } = get_wcomponent_state_value_and_probabilities(args)


    const boolean_representation = get_boolean_representation(args.wcomponent)
    const value_strings: string[] = []
    most_probable_VAP_set_values.forEach(possibility =>
    {
        const value_string = parsed_value_to_string(possibility.parsed_value, boolean_representation)
        value_strings.push(value_string)
    })

    const is_defined = most_probable_VAP_set_values.length > 0
    const values_string = reduce_display_string_values(value_strings)

    // let derived__using_values_from_wcomponent_ids: string[] | undefined = undefined
    // if (wcomponent_is_allowed_to_have_state_VAP_sets(args.wcomponent))
    // {
    //     derived__using_values_from_wcomponent_ids = args.wcomponent._derived__using_value_from_wcomponent_id
    // }

    return !is_defined ? undefined : {
        values_string,
        counterfactual_applied,
        uncertain: any_uncertainty,
        derived__using_values_from_wcomponent_ids: derived__using_value_from_wcomponent_ids,
    }
}



const max_items = 3
function reduce_display_string_values (value_strings: string[])
{
    let values_string = value_strings.slice(0, max_items).join(", ").trim() || "not defined"
    if (value_strings.length > max_items) values_string += `, (${value_strings.length - max_items} more)`

    return values_string
}
