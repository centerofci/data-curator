import type { AutoCompleteOption } from "../form/AutocompleteText"
import { get_title } from "../shared/models/get_rich_text"
import type { WComponent, WComponentsById } from "../shared/models/interfaces/SpecialisedObjects"
import type { WcIdCounterfactualsMap } from "../state/derived/State"



interface GetWcomponentSearchOptionsArgs
{
    wcomponents?: WComponent[]
    wcomponents_by_id: WComponentsById
    wc_id_counterfactuals_map: WcIdCounterfactualsMap | undefined
    created_at_ms: number
    sim_ms: number
}


export function get_wcomponent_search_options (args: GetWcomponentSearchOptionsArgs): AutoCompleteOption[]
{
    const { wcomponents: wcs, wcomponents_by_id, wc_id_counterfactuals_map: cf_map, created_at_ms, sim_ms } = args

    const wcomponents = wcs || Object.values(wcomponents_by_id)

    const options = wcomponents
        .map(wcomponent => {
            const counterfactuals = cf_map && cf_map[wcomponent.id]

            const title = get_title({
                wcomponent,
                rich_text: false,
                wcomponents_by_id,
                counterfactuals,
                created_at_ms,
                sim_ms,
            })

            return {
                id: wcomponent.id,
                title,
                subtitle: wcomponent.title,
            }
        })

    return options
}
