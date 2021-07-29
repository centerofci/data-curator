import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { Canvas } from "../canvas/Canvas"
import { MainArea } from "../layout/MainArea"
import { get_current_composed_knowledge_view_from_state } from "../state/specialised_objects/accessors"
import type { RootState } from "../state/State"



const map_state = (state: RootState) =>
{
    const kv = get_current_composed_knowledge_view_from_state(state)
    const prioritisations = kv?.prioritisations || []

    return {
        prioritisations,
    }
}


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector>



const get_svg_children = (props: Props) =>
{
    return []
}



const get_children = (props: Props) =>
{
    const elements = <div></div>

    return elements
}



function _PrioritiesView (props: Props)
{
    const elements = get_children(props)

    return <MainArea
        main_content={<Canvas
            svg_children={get_svg_children(props)}
            svg_upper_children={[]}
        >
            {elements}
        </Canvas>}
    />
}

export const PrioritiesView = connector(_PrioritiesView) as FunctionalComponent<{}>
