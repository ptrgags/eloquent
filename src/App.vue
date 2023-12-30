<script setup lang="ts">
import { ref, type Ref } from 'vue'
import { type Idea, create_idea } from './ideas/Idea'

const new_idea_name = ref("")

// For the sake of testing, let me rank teas I have
const ideas_list: Ref<Idea[]> = ref([
    create_idea("Genmaicha"),
    create_idea("Rooibos"),
    create_idea("English Breakfast"),
    create_idea("Peach"),
    create_idea("Earl Grey"),
])

function add_idea() {
    const idea: Idea = create_idea(new_idea_name.value)
    ideas_list.value.push(idea)
    new_idea_name.value = ""
}

function remove_idea(idea: Idea) {
    ideas_list.value = ideas_list.value.filter((x: Idea) => x !== idea);
}
</script>

<template>
    <input type="text" v-model="new_idea_name" placeholder="idea"/>
    <button type="button" @click="add_idea">Create idea</button>

    <div>
        <h2>Ideas:</h2>
        <div class="horizontal" v-for="idea in ideas_list" :key="idea.id">
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
</style>