<script setup lang="ts">
import { type ComputedRef, type Ref, ref, computed } from 'vue'
import { type Idea, Preference, create_idea, update_ratings } from './ideas/Idea'

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

    return JSON.parse(state_json) as PersistentState
}

const initialState = loadState();

// For the sake of testing, let me rank teas I have
const ideas_list: Ref<Idea[]> = ref(initialState.ideas);

function saveState() {
    const state = {
        ideas: ideas_list.value
    }

    localStorage.setItem("eloquent", JSON.stringify(state))
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

const ideas_by_elo: ComputedRef<Idea[]> = computed(() => {
    return [...ideas_list.value].sort((a, b) => b.elo - a.elo)
})

function add_idea() {
    const idea: Idea = create_idea(new_idea_name.value)
    ideas_list.value.push(idea)
    new_idea_name.value = ""

    comparison_indices.value = choose_indices()
    saveState();
}

function remove_idea(idea: Idea) {
    ideas_list.value = ideas_list.value.filter((x: Idea) => x !== idea);
    saveState();
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
        ideas_list.value = state.ideas
        saveState()
    }
}

</script>

<template>
    <h1>Eloquent</h1>
    <br />
    <p>Tool for ranking ideas using an Elo system like in Chess</p>
    <br />
    <input type="text" v-model="new_idea_name" placeholder="idea"/>
    <button type="button" @click="add_idea">Create idea</button>

    <div>
        <h2>Compare</h2>
        <div class="horizontal">
            <p>{{ first_option?.name }}</p>
            <p>vs.</p>
            <p>{{ second_option?.name }}</p>
        </div>
        <div class="horizontal">
            <button type="button" :enabled="can_compare" @click="select_preference(Preference.First)">First option</button>
            <button type="button" :enabled="can_compare" @click="select_preference(Preference.NoPreference)">Neither option</button>
            <button type="button" :enabled="can_compare" @click="select_preference(Preference.Second)">Right option</button>
        </div>
    </div>

    <div>
        <h2>Ideas:</h2>
        <table>
            <thead>
                <tr>
                    <th>Idea</th>
                    <th>Elo</th>
                    <th>Comparison Count</th>
                    <th>Remove</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="idea in ideas_by_elo"
                    :key="idea.id"
                    :class="{accurate: idea.comparisons >= 5}">
                    <td>{{ idea.name }}</td>
                    <td>{{ idea.elo }}</td>
                    <td>{{ idea.comparisons }}</td>
                    <button type="button" @click="remove_idea(idea)">X</button>
                </tr>
            </tbody>
        </table>
    </div>
    <div>
        <button type="button" @click="export_state">Export</button>
        <br/>
        Import:
        <input type="file" @change="import_state" accept=".json"/>
    </div>
</template>

<style>
.horizontal {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}

.accurate {
    background-color: #1eb192;
    color: #1d1d1d;
}
</style>