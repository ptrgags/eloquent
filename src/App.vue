<script setup lang="ts">
import { type ComputedRef, type Ref, type StyleValue, ref, computed } from 'vue'
import { type Idea, Preference, create_idea, update_ratings, update_ids_on_import } from './ideas/Idea'

interface PersistentState {
    ideas: Idea[]
}

const new_idea_name = ref("")

function loadState(): PersistentState {
    const state_json = localStorage.getItem("eloquent")
    if (state_json === null) {
        return {
            ideas: []
        }
    }

    const state = JSON.parse(state_json) as PersistentState
    update_ids_on_import(state.ideas)
    return state
}

const initialState = loadState();

// For the sake of testing, let me rank teas I have
const ideas_list: Ref<Idea[]> = ref(initialState.ideas);

function saveState() {
    const state = {
        ideas: ideas_list.value
    }

    localStorage.setItem("eloquent", JSON.stringify(state, undefined, 4))
}

function rand_index(array: any[]): number {
    return Math.floor(array.length * Math.random())
}

function rand_index_weighted<T>(
    array: T[],
    weight_func: (x: T) => number
): number {
    const total_weight = array.reduce((total: number, current: T) => total + weight_func(current), 0)

    let selected_index;
    while (selected_index === undefined) {
        const index = rand_index(array);
        const selected = array[index];

        // The probability is weight / total
        const prob = weight_func(selected) / total_weight;

        if (Math.random() < prob) {
            selected_index = index;
        }
    }

    return selected_index;
}

const can_compare: ComputedRef<boolean> = computed(() => {
    return ideas_list.value.length >= 2;
})

function choose_indices(): [number, number]  {
    if (!can_compare.value) {
        return [0, 0]
    }

    const lowest_comparisons_first = (x: Idea) => 1.0 / (x.comparisons + 1);
    const first: number = rand_index_weighted(ideas_list.value, lowest_comparisons_first);

    let second: number = first;
    while (second === first) {
        second = rand_index(ideas_list.value)
    }

    return [first, second]
}

const comparison_indices = ref(choose_indices());

const first_option: ComputedRef<Idea | undefined> = computed(() => {
    if (!can_compare.value) {
        return undefined
    }

    const [first_index, ] = comparison_indices.value;
    return ideas_list.value[first_index]
})

const second_option: ComputedRef<Idea | undefined> = computed(() => {
    if (!can_compare.value) {
        return undefined
    }

    const [, second_index] = comparison_indices.value;
    return ideas_list.value[second_index]
})

interface WithStyle {
    style: StyleValue
}

const PALETTE = [
    "#00795e",
    "#008c6d",
    "#009f7b",
    "#0fa886",
    "#1eb190",
    "#2eb89a",
    "#3ebfa3",
    "#53c9af",
    "#68d3bb",
    "#76d7c1",
]

function compute_style(idea: Idea): StyleValue {
    const comparisons = idea.comparisons

    let color_index = 0
    if (comparisons > 0) {
        color_index = Math.floor(Math.log2(comparisons))
        color_index = Math.min(color_index, PALETTE.length)
    }

    return {
        backgroundColor: PALETTE[color_index],
        color: color_index < 5 ? "#eeeeee" : "#1d1d1d"
    }
}

const ideas_by_elo: ComputedRef<(Idea & WithStyle)[]> = computed(() => {
    const with_style = ideas_list.value.map(x => {
        return {
            ...x,
            style: compute_style(x)
        }
    })
    return with_style.sort((a, b) => b.elo - a.elo);
})

function add_idea() {
    if (new_idea_name.value === "") {
        return
    }

    const idea: Idea = create_idea(new_idea_name.value)
    ideas_list.value = [...ideas_list.value, idea]
    new_idea_name.value = ""

    comparison_indices.value = choose_indices()
    saveState()
}

function remove_idea(id: number) {
    ideas_list.value = ideas_list.value.filter((x: Idea) => x.id !== id)

    comparison_indices.value = choose_indices()
    saveState()
}

function clear() {
    ideas_list.value = []
    saveState()
}

function reset_comparisons() {
    for (const idea of ideas_list.value) {
        idea.elo = 1000
        idea.comparisons = 0
    }
}

function select_preference(preference: Preference) {
    update_ratings(first_option.value!, second_option.value!, preference);
    comparison_indices.value = choose_indices()

    // we updated the ideas list, so save the state
    saveState();
}

function export_state() {
    const state = {
        ideas: ideas_list.value
    }

    const state_json = JSON.stringify(state)
    const data_url = `data:text/json;charset=utf-8,${encodeURIComponent(state_json)}`
    const a = document.createElement('a')
    a.href = data_url
    a.download = 'state.json'
    document.body.appendChild(a);
    a.click();
    a.remove();
}

function import_state_json(file: File): Promise<PersistentState> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
            resolve(JSON.parse(reader.result as string))
        }
        reader.onerror = error => reject(error)
        reader.readAsText(file)
    })
}

async function import_state(event: Event) {
    const target = event.target as HTMLInputElement

    if (target.files?.length === 1) {
        const file = target.files[0]
        const state = await import_state_json(file)
        update_ids_on_import(state.ideas)
        ideas_list.value = state.ideas
        saveState()
    }
}

</script>

<template>
    <div class="container">
        <div class="panel">
            <div class="gh-icon">
                <a href="https://github.com/ptrgags/eloquent"><img alt="GitHub icon that links to the project repo" src="/assets/github-mark-white.svg" /></a>
            </div>
            <h1><span class="highlight-elo">Elo</span>quent</h1>
            <br />
            <p>
                A tool for the indecisive. Make a list of ideas and compare them
                two at a time. This app uses the
                <a href="https://en.m.wikipedia.org/wiki/Elo_rating_system">Elo rating system</a>
                similar to chess to produce a ranking of ideas over time. It takes
                many comparisons to make an accurate ranking, so take your time
                and contemplate your choices. 
            </p>
            <details>
                <summary>Example uses</summary>
                <ul>
                    <li>Enter some creative ideas and decide which are worthwhile</li>
                    <li>Make a list of games/shows/etc. and rank your favorites</li>
                    <li>List items in your wishlist and see which ones you <em>really</em> want</li>
                    <li>Enter a list of tasks and prioritize them</li>
                </ul>
            </details>
            <p>
                This app uses your browser's local storage to save your place if
                you leave this page. No information is collected, and there is no server.
            </p>
        </div>

        <div class="horizontal">
            <div class="column vertical">
                <div class="panel">
                    <h2>Ideas</h2>
                    <p>Add ideas to the list with the input below. The table is listed in order by Elo ranking.</p>
                    <div class="centered">
                        <input type="text" v-model="new_idea_name" @keyup.enter="add_idea" placeholder="idea"/>
                        <button type="button" @click="add_idea">Create idea</button>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Idea</th>
                                <th>Elo</th>
                                <th># Comparisons</th>
                                <th>Remove</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="idea in ideas_by_elo"
                                :key="idea.id"
                                :style="idea.style">
                                <td>{{ idea.name }}</td>
                                <td class="centered">{{ idea.elo }}</td>
                                <td class="centered">{{ idea.comparisons }}</td>
                                <td class="centered"><button class="centered" type="button" @click="remove_idea(idea.id)">X</button></td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="centered">
                        <button type="button" @click="reset_comparisons">Reset ranking</button>
                        <button type="button" @click="clear">Remove all ideas</button>
                    </div>
                </div>
            </div>
            <div class="column vertical">
                <div class="panel compare">
                    <h2>Compare</h2>
                    <p>Choose your preference of the two ideas below. This will update the Elo ranking table.</p>
                    <div class="horizontal">
                        <button class="compare-button" type="button" :enabled="can_compare" @click="select_preference(Preference.First)">{{ first_option?.name }}</button>
                        <button class="compare-button" type="button" :enabled="can_compare" @click="select_preference(Preference.NoPreference)">No Preference</button>
                        <button class="compare-button" type="button" :enabled="can_compare" @click="select_preference(Preference.Second)">{{second_option?.name}}</button>
                    </div>
                </div>

                <div class="panel">
                    <h2>Import/Export Ideas</h2>
                    <p>Use the buttons below to export the current ranking to a JSON file. This file can be imported later or in another browser.</p>
                    Export: 
                    <button type="button" @click="export_state">Export</button>
                    <br/>
                    Import:
                    <input type="file" @change="import_state" accept=".json"/>
                </div>
            </div>
        </div>
    </div>
</template>

<style>

.gh-icon {
    background-color: rgba(0, 0, 0, 0.8);
    padding: 10px;
    box-sizing: border-box;
    border-radius: 10px;
    position: absolute;
    right: 20px;
    z-index: 100;
}

.gh-icon img {
    width: 32px;
}

.highlight-elo {
    color: #1eb192;
}

a {
    color: #1eb192;
}

body {
    margin: 0;
    padding: 0;
    background-color: #222222;
    color: #dddddd;
    font-family: sans-serif;
}

.container {
    width: 1000px;
    margin: 0 auto;
}

h1, h2 {
    text-align: center;
    margin-top: 0;
}

table {
    margin: 10px auto;
}

th {
    background-color: #333333;
}

td {
    padding: 2px;
}

.panel {
    background-color: #444444;
    padding: 20px;
    border-radius: 10px;
    margin: 10px;
    width: 100%;
}

.compare-button {
    width: 30%;
    height: 100%;
}

.centered {
    text-align: center;
}

.horizontal {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}

.vertical {
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
}

.column {
    width: 450px;
}

@media screen and (max-width: 1024px) {
    .container {
        max-width: 80vw;
    }

    .column {
        width: 80vw;
    }

    .panel {
        box-sizing: border-box;
        width: 80vw;
    }
}
</style>