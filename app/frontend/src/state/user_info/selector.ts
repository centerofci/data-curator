import type { RootState } from "../State"



export function selector_user_name (state: RootState)
{
    return state.user_info.user_name
}


export function selector_need_to_set_user_name (state: RootState)
{
    const { user, users_by_id, user_name } = state.user_info
    return user && users_by_id && !user_name
}


export function selector_chosen_storage (state: RootState)
{
    const { bases_by_id: bases_by_id, chosen_base_id } = state.user_info
    const base = chosen_base_id === undefined ? undefined : (bases_by_id && bases_by_id[chosen_base_id])
    return { base, chosen_base_id }
}


export function selector_storage_name (state: RootState)
{
    const { base, chosen_base_id } = selector_chosen_storage(state)

    return base ? base.title : (chosen_base_id === undefined ? "Not set" : `Store: ${chosen_base_id}`)
}


export function selector_need_to_create_a_base (state: RootState)
{
    const { user, bases_by_id } = state.user_info
    return user && bases_by_id && Object.keys(bases_by_id).length === 0
}