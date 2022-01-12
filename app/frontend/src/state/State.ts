import type { AnyAction } from "redux"

import type { CreationContextState } from "./creation_context/state"
import type { ControlsState } from "./controls/state"
import type { DerivedState } from "./derived/State"
import type { DisplayOptionsState } from "./display_options/state"
import type { FilterContextState } from "./filter_context/state"
import type { GlobalKeysState } from "./global_keys/state"
import type { RoutingState } from "./routing/interfaces"
import type { SearchState } from "./search/state"
import type { MetaWComponentsState } from "./specialised_objects/meta_wcomponents/State"
import type { SpecialisedObjectsState } from "./specialised_objects/State"
import type { SyncState } from "./sync/state"
import type { UserActivityState } from "./user_activity/state"
import type { UserInfoState } from "./user_info/state"
import type { ViewPrioritiesState } from "./priorities/state"



export interface RootStateCore
{
    specialised_objects: SpecialisedObjectsState
}
export interface RootState extends RootStateCore
{
    controls: ControlsState
    creation_context: CreationContextState
    derived: DerivedState
    display_options: DisplayOptionsState
    filter_context: FilterContextState
    global_keys: GlobalKeysState
    last_action: AnyAction | undefined
    meta_wcomponents: MetaWComponentsState
    routing: RoutingState
    search: SearchState
    sync: SyncState
    user_activity: UserActivityState
    user_info: UserInfoState
    view_priorities: ViewPrioritiesState
}
