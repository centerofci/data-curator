import { stable_stringify } from "./stable_stringify"


interface TestRunStats
{
    describe_run: number
    describe_skipped: number
    test_run: number
    test_passed: number
    test_failed: string[]
    test_skipped: number
}

let _tests_stats: TestRunStats = {
    describe_run: 0,
    describe_skipped: 0,
    test_run: 0,
    test_passed: 0,
    test_failed: [],
    test_skipped: 0,
}

export const tests_stats = {
    get: () => _tests_stats,
    reset: () => {
        _tests_stats = {
            describe_run: 0,
            describe_skipped: 0,
            test_run: 0,
            test_passed: 0,
            test_failed: [],
            test_skipped: 0,
        }
    },
    print: () =>
    {
        const stats = _tests_stats

        console.log(`
describe: ${stats.describe_run + stats.describe_skipped}
tests: ${stats.test_run + stats.test_skipped}`)

    const skipped = stats.describe_skipped + stats.test_skipped
    console.log(`%cskipped: ${skipped}`,
    `color:${skipped ? "tan" : "LightGrey"};font-weight:bold;`)

    if (stats.test_failed.length)
    {
        console.error("failed: " + stats.test_failed.join("\nfailed: "))
    }

    console.log(`%cpassed: ${stats.test_passed}${stats.test_failed.length ? `\nfailed: ${stats.test_failed.length}` : ""}
    `, `color:${stats.test_failed.length ? "red" : "green"};font-weight:bold;`)
    }
}

interface TestFn
{
    <T>(got: T, expected: T, description?: string, sort_items?: boolean): void
}

interface Test extends TestFn
{
    skip: <T>(got: T, expected: T, description?: string, sort_items?: boolean) => void
}


const test_fn: TestFn = <T>(got: T, expected: T, description="", sort_items=true) =>
{
    _tests_stats.test_run += 1

    const stringify_options = { render_undefined: true, sort_items }
    const str_got = stable_stringify(got, stringify_options)
    const str_expected = stable_stringify(expected, stringify_options)

    const pass = str_got === str_expected
    if (pass)
    {
        _tests_stats.test_passed += 1
        const description_first_line = description.split("\n").filter(l => l.trim())[0]
        console .log(`pass:  ${description_first_line}`)
    }
    else
    {
        _tests_stats.test_failed.push(`${description} "${str_got}" !== "${str_expected}"`)
        console.error(`fail:  ${description} "${str_got}" !== "${str_expected}"`)
        try
        {
            if (got?.constructor === Object)
            {
                const keys = [...new Set([...Object.keys(got), ...Object.keys(expected as any)])]
                keys.sort()
                keys.forEach(key =>
                {
                    const got_value = (got as any)[key]
                    const expected_value = (expected as any)[key]
                    const str_got_value = stable_stringify(got_value, stringify_options)
                    const str_expected_value = stable_stringify(expected_value, stringify_options)
                    let pass = str_got_value === str_expected_value
                    if (!pass) console.debug(`Test failure: different values for key "${key}", got: '${str_got_value}', but expected: '${str_expected_value}'`)
                    else if (str_got_value === "undefined")
                    {
                        // check the keys were both present
                        const key_in_got = key in (got as any)
                        const key_in_expected = key in (expected as any)
                        if (key_in_got !== key_in_expected) console.debug(`Test failure: key "${key}", got: ${key_in_got ? "present" : "not present"}, but expected: ${key_in_expected ? "present" : "not present"}`)
                    }
                })
            }

        } catch (e) {
            console.debug("error in providing debugging for test failure", e)
        }
    }
}

export const test: Test = test_fn as any
test.skip = <T>(got: T, expected: T, description="", sort_items=true) =>
{
    _tests_stats.test_skipped += 1
    console .warn("skipping  " + description)
}


interface DescribeFn
{
    (description: string, test_fn: () => void): () => void
}

interface Describe extends DescribeFn
{
    skip: (description: string, test_fn: () => void) => () => void
    delay: (description: string, test_fn: () => void) => () => void
}


const describe_fn: DescribeFn = (description: string, test_fn: () => void) =>
{
    function run_tests ()
    {
        _tests_stats.describe_run += 1
        console .group(description)
        test_fn()
        console .groupEnd()
    }

    run_tests()

    return run_tests
}

export const describe: Describe = describe_fn as any
describe.skip = (description: string, test_fn: () => void) =>
{
    function skip_tests ()
    {
        _tests_stats.describe_skipped += 1
        console .warn("skipping  " + description)
    }

    return skip_tests
}

describe.delay = (description: string, test_fn: () => void) =>
{
    function run_tests ()
    {
        _tests_stats.describe_run += 1
        console .group(description)
        test_fn()
        console .groupEnd()
    }

    return run_tests
}
