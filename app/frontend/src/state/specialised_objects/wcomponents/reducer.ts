import type { AnyAction } from "redux"
import { prepare_new_VAP_set } from "../../../wcomponent/CRUD_helpers/prepare_new_VAP_set"

import { prepare_new_VAP } from "../../../wcomponent/CRUD_helpers/prepare_new_VAP"
import type { CreationContextState } from "../../creation_context/state"
import { test } from "../../../shared/utils/test"
import { prepare_new_wcomponent_object } from "../../../wcomponent/CRUD_helpers/prepare_new_wcomponent_object"
import { VAPsType } from "../../../wcomponent/interfaces/VAPsType"
import type { WComponentNodeStateV2, StateValueAndPrediction } from "../../../wcomponent/interfaces/state"
import { update_subsubstate } from "../../../utils/update_state"
import type { RootState } from "../../State"
import { is_update_specialised_object_sync_info } from "../../sync/actions"
import { get_wcomponent_from_state } from "../accessors"
import { is_upsert_wcomponent, is_delete_wcomponent } from "./actions"
import { bulk_editing_wcomponents_reducer } from "./bulk_edit/reducer"
import { tidy_wcomponent } from "./tidy_wcomponent"
import { handle_upsert_wcomponent } from "./utils"
import type { WComponentsById } from "../../../wcomponent/interfaces/SpecialisedObjects"



export const wcomponents_reducer = (state: RootState, action: AnyAction): RootState =>
{

    if (is_upsert_wcomponent(action))
    {
        const tidied = tidy_wcomponent(action.wcomponent, state.specialised_objects.wcomponents_by_id)
        state = handle_upsert_wcomponent(state, tidied, action.is_source_of_truth)
    }


    if (is_delete_wcomponent(action))
    {
        const { wcomponent_id } = action
        let { wcomponents_by_id } = state.specialised_objects
        const existing = wcomponents_by_id[wcomponent_id]


        if (existing)
        {
            state = handle_upsert_wcomponent(state, existing, false, true)
        }
    }


    if (is_update_specialised_object_sync_info(action) && action.object_type === "wcomponent")
    {
        let wc = get_wcomponent_from_state(state, action.id)
        if (wc)
        {
            wc = { ...wc, saving: action.saving }
            state = update_subsubstate(state, "specialised_objects", "wcomponents_by_id", action.id, wc)
        }
        else
        {
            console.error(`Could not find wcomponent by id: "${action.id}" whilst handling is_update_specialised_object_sync_info`)
        }
    }


    state = bulk_editing_wcomponents_reducer(state, action)

    return state
}



function run_tests ()
{
    console .log("running tests of tidy_wcomponent")

    const sort_list = false

    const dt1 = new Date("2021-05-12")
    const dt2 = new Date("2021-05-13")

    const creation_context: CreationContextState = { use_creation_context: false, creation_context: {
        label_ids: [],
    } }

    let wcomponent: WComponentNodeStateV2
    let VAPs: StateValueAndPrediction[]
    let tidied: WComponentNodeStateV2
    let tidied_VAPs: StateValueAndPrediction[]
    let wcomponents_by_id: WComponentsById = {}

    const base_id = -1

    // Should sort VAP sets by ascending created_at
    wcomponent = prepare_new_wcomponent_object({ base_id, type: "statev2", subtype: "other" }, creation_context) as WComponentNodeStateV2
    wcomponent.values_and_prediction_sets = [
        { ...prepare_new_VAP_set(VAPsType.undefined, {}, [], base_id, creation_context), id: "vps2", created_at: dt2, custom_created_at: undefined },
        { ...prepare_new_VAP_set(VAPsType.undefined, {}, [], base_id, creation_context), id: "vps1", created_at: dt1, custom_created_at: undefined },
    ]
    tidied = tidy_wcomponent(wcomponent, wcomponents_by_id) as WComponentNodeStateV2

    test(tidied.values_and_prediction_sets!.map(({ id }) => id), ["vps1", "vps2"], "", sort_list)



    wcomponent = prepare_new_wcomponent_object({ base_id, type: "statev2", subtype: "other" }, creation_context) as WComponentNodeStateV2
    VAPs = [
        { ...prepare_new_VAP(), id: "VAP1", relative_probability: 5 },
        { ...prepare_new_VAP(), id: "VAP2", relative_probability: 0 },
    ]
    wcomponent.values_and_prediction_sets = [
        { ...prepare_new_VAP_set(VAPsType.undefined, {}, [], base_id, creation_context), entries: VAPs },
    ]
    tidied = tidy_wcomponent(wcomponent, wcomponents_by_id) as WComponentNodeStateV2

    test(tidied.values_and_prediction_sets![0]!.entries.map(({ probability }) => probability), [1, 0], "", sort_list)



    // Changing wcomponent to type boolean should not result in relative_probability being removed
    // Changing wcomponent to type boolean should allow probabilites to be different from relative_probability
    wcomponent = { ...wcomponent, subtype: "boolean" }
    tidied = tidy_wcomponent(wcomponent, wcomponents_by_id) as WComponentNodeStateV2
    tidied_VAPs = tidied.values_and_prediction_sets![0]!.entries
    test(tidied_VAPs.map(({ relative_probability: rp }) => rp), [5, 0], "", sort_list)
    test(tidied_VAPs.map(({ probability }) => probability), [1, 0], "", sort_list)


    VAPs = [
        { ...prepare_new_VAP(), id: "VAP1", relative_probability: 5, probability: 0 },
        { ...prepare_new_VAP(), id: "VAP2", relative_probability: 0, probability: 1 },
    ]
    let values_and_prediction_sets = [
        { ...prepare_new_VAP_set(VAPsType.undefined, {}, [], base_id, creation_context), entries: VAPs },
    ]
    wcomponent = { ...wcomponent, subtype: "boolean", values_and_prediction_sets }

    tidied = tidy_wcomponent(wcomponent, wcomponents_by_id) as WComponentNodeStateV2
    tidied_VAPs = tidied.values_and_prediction_sets![0]!.entries

    test(tidied_VAPs.map(({ relative_probability: rp }) => rp), [5, 0], "", sort_list)
    test(tidied_VAPs.map(({ probability }) => probability), [0, 1], "", sort_list)
}

// run_tests()
