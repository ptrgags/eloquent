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

</script>

<template>
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
        <div :class="{
                horizontal: true,
                // TODO: base it on the length of the list
                accurate: idea.comparisons > 3
            }"
            v-for="idea in ideas_by_elo"
            :key="idea.id">
            <div>{{ idea.name }}</div>
            <div>{{ idea.elo }}</div>
            <div>{{ idea.comparisons }}</div>
            <button type="button" @click="remove_idea(idea)">X</button>
        </div>
    </div>
</template>

<style>
.horizontal {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}

.accurate {
    background-color: #1ab7c3;
}
</style>