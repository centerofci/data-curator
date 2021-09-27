import type { KnowledgeView } from "../../../shared/interfaces/knowledge_view"
import { update_substate } from "../../../utils/update_state"
import type { RootState } from "../../State"
import { update_specialised_object_ids_pending_save } from "../../sync/utils"
import { update_modified_by } from "../update_modified_by"



export function handle_upsert_knowledge_view (state: RootState, knowledge_view: KnowledgeView, source_of_truth?: boolean): RootState
{
    const map = { ...state.specialised_objects.knowledge_views_by_id }
    knowledge_view = source_of_truth ? knowledge_view : update_modified_by(knowledge_view, state)
    map[knowledge_view.id] = knowledge_view

    state = update_substate(state, "specialised_objects", "knowledge_views_by_id", map)

    // Set derived data
    state = update_specialised_object_ids_pending_save(state, "knowledge_view", knowledge_view.id, !!knowledge_view.needs_save)

    return state
}
