import { round_to_max_significant_figures } from "../../shared/utils/number"
import { describe, test } from "../../shared/utils/test"
import { NODE_WIDTH } from "../position_utils"
import { ConnectionEndType } from "./ConnectionEnd"
import { derive_connection_coords, DeriveConnectionCoordsArgs, DeriveConnectionCoordsReturn } from "./derive_coords"


export const test_derive_connection_coords = describe.delay("derive_connection_coords", () =>
{
    let args: DeriveConnectionCoordsArgs
    let result: DeriveConnectionCoordsReturn

    describe("connection between two nodes", () =>
    {
        args = test_helper__get_args()
        args.connection_from_component!.kv_wc_entry = { top: 0, left: 0 }
        args.connection_to_component!.kv_wc_entry =   { top: 0, left: NODE_WIDTH + 100 }

        result = derive_connection_coords(args)
        test(test_helper__round_derived_connection_coords(result), {
            line_start_x: 250, line_start_y: -77,
            relative_control_point1: { x: 50, y: 0 },
            relative_control_point2: { x: -50, y: 0 },
            line_end_x: 340, line_end_y: -77,
            connection_end_x: 350, connection_end_y: -77,
            end_angle: 3.142,
        }, `two nodes not overlapping horizontally
                    [from]----->[to]`)


        args = test_helper__get_args()
        args.connection_from_component!.kv_wc_entry = { top: 0, left: 0 }
        args.connection_to_component!.kv_wc_entry =   { top: 0, left: NODE_WIDTH + 10 }

        result = derive_connection_coords(args)
        test(test_helper__round_derived_connection_coords(result), {
            line_start_x: 250, line_start_y: -77,
            relative_control_point1: { x: 130, y: 0 },
            relative_control_point2: { x: 130, y: 0 },
            line_end_x: 520, line_end_y: -47,
            connection_end_x: 510, connection_end_y: -47,
            end_angle: 0,
        }, `two nodes not overlapping horizontally but too close to each other:
                    [from] [to]`)


        args = test_helper__get_args()
        args.connection_from_component!.kv_wc_entry = { top: 0, left: 0 }
        args.connection_to_component!.kv_wc_entry =   { top: 0, left: NODE_WIDTH - 10 }

        result = derive_connection_coords(args)
        test(test_helper__round_derived_connection_coords(result), {
            line_start_x: 250, line_start_y: -77,
            relative_control_point1: { x: 120, y: 0 },
            relative_control_point2: { x: 120, y: 0 },
            line_end_x: 500, line_end_y: -47,
            connection_end_x: 490, connection_end_y: -47,
            end_angle: 0,
        }, `two nodes overlapping horizontally
                    [fr.[to]`)


        args = test_helper__get_args()
        args.connection_from_component!.kv_wc_entry = { top: 0, left: 0 }
        args.connection_to_component!.kv_wc_entry =   { top: 0, left: -10 }

        result = derive_connection_coords(args)
        test(test_helper__round_derived_connection_coords(result), {
            line_start_x: 250, line_start_y: -77,
            relative_control_point1: { x: 30, y: 0 },
            relative_control_point2: { x: 30, y: 0 },
            line_end_x: 250, line_end_y: -47,
            connection_end_x: 240, connection_end_y: -47,
            end_angle: 0,
        }, `two nodes not overlapping horizontally but too close to each other in the other direction
                    [to] [from]`)


        args = test_helper__get_args()
        args.connection_from_component!.kv_wc_entry = { top: 0, left: 0 }
        args.connection_to_component!.kv_wc_entry =   { top: 0, left: -50 }

        result = derive_connection_coords(args)
        test(test_helper__round_derived_connection_coords(result), {
            line_start_x: 250, line_start_y: -77,
            relative_control_point1: { x: 30, y: 0 },
            relative_control_point2: { x: 30, y: 0 },
            line_end_x: 210, line_end_y: -47,
            connection_end_x: 200, connection_end_y: -47,
            end_angle: 0,
        }, `two nodes not overlapping horizontally and far from each other in the other direction
                    [to]<-----[from]`)
    })


    args = test_helper__get_args()
    args.connection_to_component = args.connection_from_component
    result = derive_connection_coords(args)
    test(test_helper__round_derived_connection_coords(result), {
        line_start_x: NODE_WIDTH, line_start_y: -77,
        relative_control_point1: { x: 30, y: 0 },
        relative_control_point2: { x: 30, y: 0 },
        line_end_x: NODE_WIDTH + 10, line_end_y: -47,
        connection_end_x: NODE_WIDTH, connection_end_y: -47,
        end_angle: 0,
    }, "connection from a node back to itself")


    args = test_helper__get_args()
    args.end_size = 0
    let console_warn_args: any[] = []
    args.console_warn = (...args) => console_warn_args = args
    derive_connection_coords(args)
    test(console_warn_args, [`Invalid connection end_size "0", defaulting to 1`], "Should log a warning message about invalid end_size: 0,")


    describe("connection between nothing and a node", () =>
    {
        args = test_helper__get_args()
        args.connection_from_component = undefined
        args.connection_to_component!.kv_wc_entry = { top: 0, left: 0 }
        result = derive_connection_coords(args)
        test(test_helper__round_derived_connection_coords(result), {
            line_start_x: -150, line_start_y: -77,
            relative_control_point1: { x: 0, y: 0 },
            relative_control_point2: { x: 0, y: 0 },
            line_end_x: -9, line_end_y: -77,
            connection_end_x: 0, connection_end_y: -77,
            end_angle: 3.142,
        }, "straight line from nothing to one node")


        args = test_helper__get_args()
        args.connection_from_component!.kv_wc_entry = { top: 0, left: 0 }
        args.connection_to_component = undefined
        result = derive_connection_coords(args)

        test(test_helper__round_derived_connection_coords(result), {
            line_start_x: 250, line_start_y: -77,
            relative_control_point1: { x: 0, y: 0 },
            relative_control_point2: { x: 0, y: 0 },
            line_end_x: 390, line_end_y: -77,
            connection_end_x: 400, connection_end_y: -77,
            end_angle: 3.142,
        }, "straight line from one node to nothing")
    })


    describe("connection between a node and a connection", () =>
    {
        args = test_helper__get_args()
        args.connection_from_component!.kv_wc_entry = { top: 0, left: 0 }
        args.connection_to_component = {
            kv_wc_entry: { top: 0, left: -100 },
            wcomponent_type: "causal_link",
            connection_terminal_type: { direction: "to", attribute: "state" },
        }

        result = derive_connection_coords(args)
        test(test_helper__round_derived_connection_coords(result), {
            line_start_x: 250, line_start_y: -77,
            relative_control_point1: { x: 180, y: 0 },
            relative_control_point2: { x: 180, y: 0 },
            line_end_x: -91, line_end_y: 0,
            connection_end_x: -100, connection_end_y: 0,
            end_angle: 0,
        }, "connect from one node to another connection")


        args = test_helper__get_args()
        args.connection_from_component!.kv_wc_entry = { top: 0, left: 0 }
        args.connection_to_component = {
            kv_wc_entry: { top: -200, left: -100 },
            wcomponent_type: "causal_link",
            connection_terminal_type: { direction: "to", attribute: "state" },
        }
        result = derive_connection_coords(args)

        test(test_helper__round_derived_connection_coords(result), {
            line_start_x: 0, line_start_y: -77,
            relative_control_point1: { x: -50, y: 0 },
            relative_control_point2: { x: -50, y: 0 },
            line_end_x: -110, line_end_y: 200,
            connection_end_x: -100, connection_end_y: 200,
            end_angle: 3.142,
        }, "connect from another connection to a node")
    })

})


function test_helper__get_args (): DeriveConnectionCoordsArgs
{
    return {
        connection_from_component: {
            kv_wc_entry: { top: 0, left: 0 },
            wcomponent_type: "statev2",
            connection_terminal_type: { direction: "from", attribute: "state" },
        },
        connection_to_component: {
            kv_wc_entry: { top: 0, left: NODE_WIDTH + 100 },
            wcomponent_type: "statev2",
            connection_terminal_type: { direction: "to", attribute: "state" },
        },
        line_behaviour: undefined,
        circular_links: true,
        end_size: 1,
        connection_end_type: ConnectionEndType.positive,
    }
}


function test_helper__round_derived_connection_coords (coords: DeriveConnectionCoordsReturn): DeriveConnectionCoordsReturn
{
    return {
        line_start_x: round_to_max_significant_figures(coords.line_start_x, 2),
        line_start_y: round_to_max_significant_figures(coords.line_start_y, 2),
        relative_control_point1: {
            x: round_to_max_significant_figures(coords.relative_control_point1.x, 2),
            y: round_to_max_significant_figures(coords.relative_control_point1.y, 2),
        },
        relative_control_point2: {
            x: round_to_max_significant_figures(coords.relative_control_point2.x, 2),
            y: round_to_max_significant_figures(coords.relative_control_point2.y, 2),
        },
        line_end_x: round_to_max_significant_figures(coords.line_end_x, 2),
        line_end_y: round_to_max_significant_figures(coords.line_end_y, 2),
        connection_end_x: round_to_max_significant_figures(coords.connection_end_x, 2),
        connection_end_y: round_to_max_significant_figures(coords.connection_end_y, 2),
        end_angle: round_to_max_significant_figures(coords.end_angle, 4),
    }
}
