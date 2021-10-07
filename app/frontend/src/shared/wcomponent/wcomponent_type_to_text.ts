import type { WComponentType } from "./interfaces/wcomponent_base"



export const DEPRECATED_WCOMPONENT_TYPES: Set<WComponentType> = new Set([
    "counterfactual",
    "state",
    "sub_state", // not deprecated but an easy way to hide this component type for production
])


export function wcomponent_type_to_text (type: WComponentType)
{
    if (type === "counterfactual") return "counterfactualv1"
    if (type === "counterfactualv2") return "counterfactual"
    if (type === "state") return "statev1"
    if (type === "statev2") return "state"
    return type.replaceAll("_", " ")
}
