import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import "./Editable.css"
import "./EditableNumber.css"
import type { RootState } from "../state/State"
import { EditableTextSingleLine } from "./EditableTextSingleLine"



type OwnProps =
{
    disabled?: boolean
    placeholder: string
    value: number
    allow_undefined: false
    on_change?: (new_value: number) => void
} |
{
    disabled?: boolean
    placeholder: string
    value: number | undefined
    allow_undefined: true
    on_change?: (new_value: number | undefined) => void
}



const map_state = (state: RootState) => ({
    editing: !state.display_options.consumption_formatting,
})


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps



function _EditableNumber (props: Props)
{
    const value = props.value !== undefined ? props.value.toString() : ""

    const { allow_undefined, on_change, disabled, editing } = props


    let class_name = "editable_number"

    if (!editing || !on_change || disabled)
    {
        class_name = class_name + (editing ? "" : " not_editable ") + (disabled ? " disabled " : "")
        return <div className={class_name}>{props.value === undefined ? props.placeholder : props.value}</div>
    }


    return <div className={class_name}>
        <EditableTextSingleLine
            placeholder={props.placeholder}
            value={value}
            on_change={new_value => {
                const valid_value = string_to_number(new_value)
                if (on_change_accepts_undefined(on_change, allow_undefined)) on_change(valid_value)
                else if (valid_value !== undefined) on_change(valid_value)
            }}
        />
    </div>
}

export const EditableNumber = connector(_EditableNumber) as FunctionalComponent<OwnProps>



function string_to_number (value: string): number | undefined
{
    if (!value) return undefined

    const num_value = parseFloat(value)
    if (Number.isNaN(num_value)) return 0

    return num_value
}



function on_change_accepts_undefined (on_change: (v: number) => void, allow_undefined?: boolean): on_change is (v: number | undefined) => void
{
    return !!allow_undefined
}
