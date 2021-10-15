import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward"
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward"

import "./KnowledgeGraphTimeMarkers.scss"
import { get_current_composed_knowledge_view_from_state } from "../state/specialised_objects/accessors"
import type { RootState } from "../state/State"
import { SCALE_BY } from "../canvas/zoom_utils"
import { bounded } from "../shared/utils/bounded"
import { useMemo } from "preact/hooks"
import { date2str } from "../shared/utils/date_helpers"
import { time_scale_days_to_ms_pixels_fudge_factor } from "../shared/constants"



const map_state = (state: RootState) =>
{
    const current_composed_knowledge_view = get_current_composed_knowledge_view_from_state(state)
    const composed_datetime_line_config = current_composed_knowledge_view?.composed_datetime_line_config

    return {
        display_time_marks: state.display_options.display_time_marks,
        time_origin_ms: composed_datetime_line_config?.time_origin_ms,
        time_origin_x: composed_datetime_line_config?.time_origin_x,
        time_scale: composed_datetime_line_config?.time_scale,
        time_line_number: composed_datetime_line_config?.time_line_number,
        time_line_spacing_days: composed_datetime_line_config?.time_line_spacing_days,
        x: state.routing.args.x,
        zoom: state.routing.args.zoom,
        sim_ms: state.routing.args.sim_ms,
    }
}

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector>



function _KnowledgeGraphTimeMarkers (props: Props)
{
    const {
        sim_ms, time_origin_ms,
        time_origin_x,
        time_scale,
        time_line_number,
        time_line_spacing_days,
    } = props
    if (!props.display_time_marks || time_origin_ms === undefined || time_origin_x === undefined || time_scale === undefined) return null

    const other_datetime_lines = useMemo(() => get_other_datetime_lines({
        time_line_number, time_line_spacing_days,
    }), [time_line_number, time_line_spacing_days])

    const { x, zoom } = props
    const xd = zoom / SCALE_BY
    const xm = (x - time_origin_x) * xd
    const time_scale_ms_to_pixels_fudge = (time_scale / time_scale_days_to_ms_pixels_fudge_factor) * xd

    return <div className="datetime_lines_container">
        {other_datetime_lines.map(config =>
        {
            return <DatetimeLine
                key={config.key}
                date_ms={sim_ms + config.offset}
                time_origin_ms={time_origin_ms}
                time_scale_ms_to_pixels_fudge={time_scale_ms_to_pixels_fudge}
                xm={xm}
                xd={xd}
                color="black"
                opacity={config.opacity}
            />
        })}

        <DatetimeLine
            date_ms={new Date().getTime()}
            time_origin_ms={time_origin_ms}
            time_scale_ms_to_pixels_fudge={time_scale_ms_to_pixels_fudge}
            xm={xm}
            xd={xd}
            color="red"
            left_label_when_off_screen={true}
        />
        <DatetimeLine
            date_ms={sim_ms}
            time_origin_ms={time_origin_ms}
            time_scale_ms_to_pixels_fudge={time_scale_ms_to_pixels_fudge}
            xm={xm}
            xd={xd}
            color="blue"
            left_label_when_off_screen={true}
        />
    </div>
}

export const KnowledgeGraphTimeMarkers = connector(_KnowledgeGraphTimeMarkers) as FunctionalComponent<{}>



const date_format = "yyyy-MM-dd"
interface DatetimeLineProps
{
    date_ms: number
    time_origin_ms: number
    time_scale_ms_to_pixels_fudge: number
    xm: number
    xd: number
    color?: string
    opacity?: number
    left_label_when_off_screen?: boolean
}
function DatetimeLine (props: DatetimeLineProps)
{
    const { color, opacity } = props
    let screen_left = ((props.date_ms - props.time_origin_ms) * props.time_scale_ms_to_pixels_fudge) - props.xm
    const max_screen_left = document.body.clientWidth - 20

    const off_left = screen_left < 0
    const off_right = screen_left > max_screen_left
    const on_screen = !off_left && !off_right
    if (!on_screen && !props.left_label_when_off_screen) return null

    screen_left = bounded(screen_left, 0, max_screen_left)

    return <div
        className="datetime_container"
        style={{ color, borderColor: color, left: screen_left, opacity }}
    >
        <div className="rotater">
            {off_left && <ArrowUpwardIcon fontSize="small" />}
            {off_right && <ArrowDownwardIcon fontSize="small" />}
            <div className="date_label">
                {date2str(new Date(props.date_ms), date_format)}
            </div>
        </div>
        {on_screen && <div className="datetime_line" />}
    </div>
}



const milliseconds_in_day = 1000 * 3600 * 24
interface GetOtherDatetimeLinesArgs
{
    time_line_number: number | undefined
    time_line_spacing_days: number | undefined
}
interface DatetimeLineConfig
{
    offset: number
    opacity: number
    key: string
}
function get_other_datetime_lines (args: GetOtherDatetimeLinesArgs): DatetimeLineConfig[]
{
    const other_datetime_lines: DatetimeLineConfig[] = []
    const { time_line_number, time_line_spacing_days } = args
    if (time_line_number === undefined || time_line_spacing_days === undefined) return []

    const time_line_spacing_ms = time_line_spacing_days * milliseconds_in_day

    for (let i = time_line_number; i > 0; --i)
    {
        const opacity = i / time_line_number
        const j = time_line_number - i + 1

        other_datetime_lines.push({
            offset: time_line_spacing_ms * j,
            opacity,
            key: `plus${i}`
        })
        other_datetime_lines.push({
            offset: -time_line_spacing_ms * j,
            opacity,
            key: `minus${i}`
        })
    }

    return other_datetime_lines
}
