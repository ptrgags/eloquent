<script setup lang="ts">
import { type ComputedRef, type Ref, ref, computed } from 'vue'
import { type Idea, Preference, create_idea, update_ratings } from './ideas/Idea'

const new_idea_name = ref("")

// For the sake of testing, let me rank teas I have
const ideas_list: Ref<Idea[]> = ref([
    create_idea("Genmaicha"),
    create_idea("Rooibos"),
    create_idea("English Breakfast"),
    create_idea("Peach"),
    create_idea("Earl Grey"),
])

function rand_index(array: any[]): number {
    return Math.floor(array.length * Math.random())
}

function choose_indices(): [number, number]  {
    if (ideas_list.value.length < 2) {
        return [0, 0]
    }

    const first: number = rand_index(ideas_list.value)

    let second: number = first;
    while (second === first) {
        second = rand_index(ideas_list.value)
    }

    return [first, second]
}

const comparison_indices = ref(choose_indices());

const can_compare: ComputedRef<boolean> = computed(() => {
    return ideas_list.value.length >= 2;
})

const first_option: ComputedRef<Idea | undefined> = computed(() => {
    if (!can_compare.value) {
        return undefined
    }

    const [first_index, ] = comparison_indices.value;
    return ideas_list.value[first_index]
})

const second_option: ComputedRef<Idea | undefined> = computed(() => {
    if (ideas_list.value.length < 2) {
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
}

function remove_idea(idea: Idea) {
    ideas_list.value = ideas_list.value.filter((x: Idea) => x !== idea);
}

function select_preference(preference: Preference) {
    update_ratings(first_option.value!, second_option.value!, preference);
    comparison_indices.value = choose_indices()
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